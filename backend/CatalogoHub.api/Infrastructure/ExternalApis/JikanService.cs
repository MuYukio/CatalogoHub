using CatalogoHub.api.Domain.DTOs;
using CatalogoHub.api.Infrastructure.ExternalApis;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CatalogoHub.api.Infrastructure.ExternalApis;

public class JikanService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<JikanService> _logger;
    private readonly IMemoryCache _cache;
    private readonly JsonSerializerOptions _jsonOptions;

    
    private static readonly TimeSpan CacheSearch = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan CacheDetail = TimeSpan.FromHours(1);
    private static readonly TimeSpan CacheCurrentSeason = TimeSpan.FromMinutes(30);
    private static readonly TimeSpan CachePopular = TimeSpan.FromMinutes(30);

    public JikanService(HttpClient httpClient, ILogger<JikanService> logger, IMemoryCache cache)
    {
        _httpClient = httpClient;
        _logger = logger;
        _cache = cache;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            NumberHandling = JsonNumberHandling.AllowReadingFromString
        };
    }

    private string ExtractImageUrl(JikanImages? images) =>
        images?.JPG?.LargeImageUrl
        ?? images?.WebP?.LargeImageUrl
        ?? images?.JPG?.ImageUrl
        ?? images?.WebP?.ImageUrl
        ?? string.Empty;

    private bool DetermineIfAdultContent(string? rating, List<JikanGenre>? genres)
    {
        if (!string.IsNullOrEmpty(rating))
        {
            var r = rating.ToUpper();
            if (r.Contains("RX") || r.Contains("R18") || r.Contains("HENTAI")) return true;
            if (r.Contains("R+")) return true;
        }
        if (genres != null)
        {
            var adultGenres = new[] { "hentai", "ecchi", "erotica" };
            if (genres.Any(g => adultGenres.Any(ag => (g.Name ?? "").ToLower().Contains(ag))))
                return true;
        }
        return false;
    }

    private List<string> GenerateContentWarnings(string? rating, List<JikanGenre>? genres, bool isAdult)
    {
        if (!isAdult) return new List<string>();
        var warnings = new HashSet<string>();
        if (!string.IsNullOrEmpty(rating))
        {
            var r = rating.ToUpper();
            if (r.Contains("RX") || r.Contains("HENTAI")) warnings.Add("Conteúdo sexual explícito");
            else if (r.Contains("R+")) warnings.Add("Nudez leve / conteúdo sugestivo");
            else if (r.Contains("R17")) warnings.Add("Conteúdo para maiores de 17 anos");
        }
        if (genres != null)
            foreach (var genre in genres)
            {
                var g = (genre.Name ?? "").ToLower();
                if (g.Contains("hentai")) warnings.Add("Conteúdo sexual explícito");
                else if (g.Contains("ecchi")) warnings.Add("Conteúdo sugestivo/ecchi");
            }
        return warnings.ToList();
    }

    private string TruncateSynopsis(string? synopsis, int maxLength) =>
        string.IsNullOrEmpty(synopsis) ? "Sem sinopse disponível" :
        synopsis.Length > maxLength ? synopsis[..maxLength] + "..." : synopsis;

    private AnimeDto MapToAnimeDto(JikanAnimeData anime, int synopsisLimit = 300)
    {
        bool isAdult = DetermineIfAdultContent(anime.Rating, anime.Genres);
        return new AnimeDto
        {
            MalId = anime.MalId,
            Title = anime.Title,
            TitleEnglish = anime.TitleEnglish ?? anime.Title,
            TitleJapanese = anime.TitleJapanese ?? anime.Title,
            Synopsis = TruncateSynopsis(anime.Synopsis, synopsisLimit),
            ImageUrl = ExtractImageUrl(anime.Images),
            Score = anime.Score.HasValue ? (double)anime.Score.Value : 0.0,
            Type = anime.Type ?? "TV",
            Episodes = anime.Episodes ?? 0,
            Status = anime.Status ?? "Unknown",
            Genres = anime.Genres?.Select(g => g.Name ?? string.Empty).ToList() ?? new List<string>(),
            AgeRating = anime.Rating,
            IsAdultContent = isAdult,
            ContentWarnings = GenerateContentWarnings(anime.Rating, anime.Genres, isAdult)
        };
    }


    public async Task<AnimeSearchResponseDto> SearchAnimesAsync(string query, int page = 1)
    {
        var cacheKey = $"jikan:search:{query.ToLower().Trim()}:p{page}";

        if (_cache.TryGetValue(cacheKey, out AnimeSearchResponseDto? cached) && cached != null)
        {
            _logger.LogInformation("[Cache HIT] SearchAnimes: {Key}", cacheKey);
            return cached;
        }

        try
        {
            await Task.Delay(500); 

            var url = $"anime?q={Uri.EscapeDataString(query)}&page={page}&limit=20";
            _logger.LogInformation("Searching Jikan: {Url}", url);

            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var jikanResponse = JsonSerializer.Deserialize<JikanApiResponse>(json, _jsonOptions);

            if (jikanResponse?.Data == null) return new AnimeSearchResponseDto();

            var result = new AnimeSearchResponseDto
            {
                Results = jikanResponse.Data.Select(item => MapToAnimeDto(item, 500)).ToList(),
                HasNextPage = jikanResponse.Pagination?.HasNextPage ?? false
            };

            _cache.Set(cacheKey, result, CacheSearch);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching animes");
            throw;
        }
    }

    public async Task<List<AnimeDto>> GetPopularAnimesAsync(int page = 1, int limit = 20)
    {
        var cacheKey = $"jikan:popular:p{page}:l{limit}";

        if (_cache.TryGetValue(cacheKey, out List<AnimeDto>? cached) && cached != null)
        {
            _logger.LogInformation("[Cache HIT] GetPopularAnimes: {Key}", cacheKey);
            return cached;
        }

        try
        {
            var url = $"top/anime?page={page}&limit={limit}";
            _logger.LogInformation("Fetching popular animes: {Url}", url);

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode) return new List<AnimeDto>();

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JikanTopResponse>(content, _jsonOptions);

            if (result?.Data == null) return new List<AnimeDto>();

            var animes = result.Data.Select(item => MapToAnimeDto(item, 300)).ToList();
            _cache.Set(cacheKey, animes, CachePopular);
            return animes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting popular animes");
            return new List<AnimeDto>();
        }
    }

    public async Task<AnimeDto?> GetAnimeDetailsAsync(int malId)
    {
        var cacheKey = $"jikan:detail:{malId}";

        if (_cache.TryGetValue(cacheKey, out AnimeDto? cached) && cached != null)
        {
            _logger.LogInformation("[Cache HIT] GetAnimeDetails: {Key}", cacheKey);
            return cached;
        }

        try
        {
            var response = await _httpClient.GetAsync($"anime/{malId}/full");
            if (!response.IsSuccessStatusCode) return null;

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JikanAnimeResponse>(json, _jsonOptions);
            if (result?.Data == null) return null;

            var anime = MapToAnimeDto(result.Data, int.MaxValue);
            _cache.Set(cacheKey, anime, CacheDetail);
            return anime;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting anime details");
            throw;
        }
    }

    public async Task<List<AnimeDto>> GetCurrentSeasonAnimesAsync(int limit = 20)
    {
        var cacheKey = $"jikan:season:current:l{limit}";

        if (_cache.TryGetValue(cacheKey, out List<AnimeDto>? cached) && cached != null)
        {
            _logger.LogInformation("[Cache HIT] GetCurrentSeasonAnimes: {Key}", cacheKey);
            return cached;
        }

        try
        {
            var url = $"seasons/now?limit={limit}&order_by=score";
            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode) return new List<AnimeDto>();

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JikanTopResponse>(content, _jsonOptions);

            if (result?.Data == null) return new List<AnimeDto>();

            var animes = result.Data.Select(item => MapToAnimeDto(item, 300)).ToList();
            _cache.Set(cacheKey, animes, CacheCurrentSeason);
            return animes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current season animes");
            return new List<AnimeDto>();
        }
    }
    public async Task<CatalogResponseDto<AnimeDto>> GetAnimesCatalogAsync(
        int page = 1,
        int pageSize = 20,
        string? search = null,
        string? genreIds = null,
        string? type = null,
        string? status = null,
        string ordering = "score")
    {
        var cacheKey = $"jikan:catalog:p{page}:s{pageSize}:q{search}:g{genreIds}:t{type}:st{status}:o{ordering}";

        if (_cache.TryGetValue(cacheKey, out CatalogResponseDto<AnimeDto>? cached) && cached != null)
        {
            _logger.LogInformation("[Cache HIT] GetAnimesCatalog: {Key}", cacheKey);
            return cached;
        }

        try
        {
            await Task.Delay(500);

            var url = $"anime?page={page}&limit={pageSize}&order_by={ordering}&sort=desc&sfw=true";

            if (!string.IsNullOrWhiteSpace(search))
                url += $"&q={Uri.EscapeDataString(search)}";

            if (!string.IsNullOrWhiteSpace(genreIds))
                url += $"&genres={genreIds}";   

            if (!string.IsNullOrWhiteSpace(type))
                url += $"&type={type}";

            if (!string.IsNullOrWhiteSpace(status))
                url += $"&status={status}";

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode) return new CatalogResponseDto<AnimeDto> { CurrentPage = page };

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JikanApiResponse>(content, _jsonOptions);

            if (result?.Data == null) return new CatalogResponseDto<AnimeDto> { CurrentPage = page };

            var animes = result.Data
                .Select(item => MapToAnimeDto(item, 300))
                .ToList();

            var lastPage = result.Pagination?.LastVisiblePage ?? page;
            var hasNext = result.Pagination?.HasNextPage ?? false;

            var dto = new CatalogResponseDto<AnimeDto>
            {
                Results = animes,
                CurrentPage = page,
                TotalPages = lastPage,
                HasNextPage = hasNext,
                TotalCount = lastPage * pageSize 
            };

            _cache.Set(cacheKey, dto, CacheSearch);
            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetAnimesCatalogAsync");
            return new CatalogResponseDto<AnimeDto> { CurrentPage = page };
        }

    }
    public async Task<List<GenreDto>> GetAnimeGenresAsync()
    {
        const string cacheKey = "jikan:genres";
        if (_cache.TryGetValue(cacheKey, out List<GenreDto>? cached) && cached != null)
            return cached;

        var response = await _httpClient.GetAsync("genres/anime?filter=genres");
        if (!response.IsSuccessStatusCode) return new();

        var json = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JikanGenresResponse>(json, _jsonOptions);
        
        var genres = result?.Data?
            .Select(g => new GenreDto { Id = g.MalId, Name = g.Name, Slug = g.Name.ToLower() })
            .OrderBy(g => g.Name)
            .ToList() ?? new();

        _cache.Set(cacheKey, genres, TimeSpan.FromHours(24));
        return genres;
    }
}