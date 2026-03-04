using CatalogoHub.api.Domain.DTOs;
using CatalogoHub.api.Infrastructure.ExternalApis;
using System.Text.Json;
using System.Text.Json.Serialization;

public class JikanService

{
    private readonly HttpClient _httpClient;
    private readonly ILogger<JikanService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public JikanService(HttpClient httpClient, ILogger<JikanService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
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
            if (r.Contains("RX") || r.Contains("R18") || r.Contains("HENTAI"))
                return true;
            if (r.Contains("R+"))
                return true;
        }

        if (genres != null)
        {
            var adultGenres = new[] { "hentai", "ecchi", "erotica" };
            if (genres.Any(g => adultGenres.Any(ag =>
                (g.Name ?? "").ToLower().Contains(ag))))
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
        {
            foreach (var genre in genres)
            {
                var g = (genre.Name ?? "").ToLower();
                if (g.Contains("hentai")) warnings.Add("Conteúdo sexual explícito");
                else if (g.Contains("ecchi")) warnings.Add("Conteúdo sugestivo/ecchi");
            }
        }

        return warnings.ToList();
    }

    public async Task<AnimeSearchResponseDto> SearchAnimesAsync(string query, int page = 1)
    {
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

            var animes = jikanResponse.Data.Select(a =>
            {
                bool isAdult = DetermineIfAdultContent(a.Rating, a.Genres);
                return MapToAnimeDto(a.MalId, a.Title, a.TitleEnglish, a.TitleJapanese,
                    a.Synopsis, a.Images != null ? new JikanImages
                    {
                        JPG = new JikanImageJpg { ImageUrl = a.Images.JPG?.ImageUrl ?? "", LargeImageUrl = a.Images.JPG?.LargeImageUrl ?? "" },
                        WebP = new JikanImageWebp { ImageUrl = a.Images.WebP?.ImageUrl ?? "", LargeImageUrl = a.Images.WebP?.LargeImageUrl ?? "" }
                    } : null,
                    a.Score, a.Type, a.Episodes, a.Status, a.Genres, a.Rating, isAdult, 500);
            }).ToList();

            return new AnimeSearchResponseDto
            {
                Results = animes,
                HasNextPage = jikanResponse.Pagination?.HasNextPage ?? false
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching animes");
            throw;
        }
    }

    public async Task<List<AnimeDto>> GetPopularAnimesAsync(int page = 1, int limit = 20)
    {
        try
        {
            var url = $"top/anime?page={page}&limit={limit}";
            _logger.LogInformation("Fetching popular animes: {Url}", url);

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode) return new List<AnimeDto>();

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JikanTopResponse>(content, _jsonOptions);

            if (result?.Data == null) return new List<AnimeDto>();

            return result.Data.Select(item =>
            {
                bool isAdult = DetermineIfAdultContent(item.Rating, item.Genres);
                return new AnimeDto
                {
                    MalId = item.MalId,
                    Title = item.Title,
                    TitleEnglish = item.TitleEnglish ?? item.Title,
                    TitleJapanese = item.TitleJapanese ?? item.Title,
                    Synopsis = TruncateSynopsis(item.Synopsis, 300),
                    ImageUrl = ExtractImageUrl(item.Images),
                    Score = item.Score ?? 0,
                    Type = item.Type ?? "TV",
                    Episodes = item.Episodes,
                    Status = item.Status ?? "Unknown",
                    Genres = item.Genres?.Select(g => g.Name).ToList() ?? new List<string>(),
                    AgeRating = item.Rating,
                    IsAdultContent = isAdult,
                    ContentWarnings = GenerateContentWarnings(item.Rating, item.Genres, isAdult)
                };
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting popular animes");
            return new List<AnimeDto>();
        }
    }

    public async Task<AnimeDto?> GetAnimeDetailsAsync(int malId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"anime/{malId}/full");
            if (!response.IsSuccessStatusCode) return null;

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JikanAnimeResponse>(json, _jsonOptions);
            if (result?.Data == null) return null;

            var a = result.Data;
            bool isAdult = DetermineIfAdultContent(a.Rating, a.Genres);

            return new AnimeDto
            {
                MalId = a.MalId,
                Title = a.Title,
                TitleEnglish = a.TitleEnglish,
                TitleJapanese = a.TitleJapanese,
                Synopsis = a.Synopsis,
                ImageUrl = a.Images != null
                    ? (a.Images.JPG?.LargeImageUrl ?? a.Images.JPG?.ImageUrl
                    ?? a.Images.WebP?.LargeImageUrl ?? string.Empty)
                    : string.Empty,
                Score = a.Score,
                Type = a.Type,
                Episodes = a.Episodes,
                Status = a.Status,
                Genres = a.Genres?.Select(g => g.Name).ToList() ?? new List<string>(),
                AgeRating = a.Rating,
                IsAdultContent = isAdult,
                ContentWarnings = GenerateContentWarnings(a.Rating, a.Genres, isAdult)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting anime details");
            throw;
        }
    }

    private string TruncateSynopsis(string? synopsis, int maxLength) =>
        string.IsNullOrEmpty(synopsis) ? "Sem sinopse disponível" :
        synopsis.Length > maxLength ? synopsis[..maxLength] + "..." : synopsis;

    private AnimeDto MapToAnimeDto(int malId, string title, string? titleEn, string? titleJp,
        string? synopsis, JikanImages? images, decimal? score, string? type,
        int? episodes, string? status, List<JikanGenre>? genres, string? rating,
        bool isAdult, int synopsisLimit) => new AnimeDto
        {
            MalId = malId,
            Title = title,
            TitleEnglish = titleEn ?? title,
            TitleJapanese = titleJp ?? title,
            Synopsis = TruncateSynopsis(synopsis, synopsisLimit),
            ImageUrl = ExtractImageUrl(images),
            Score = score,
            Type = type ?? "TV",
            Episodes = episodes,
            Status = status ?? "Unknown",
            Genres = genres?.Select(g => g.Name).ToList() ?? new List<string>(),
            AgeRating = rating,
            IsAdultContent = isAdult,
            ContentWarnings = GenerateContentWarnings(rating, genres, isAdult)
        };

    public async Task<List<AnimeDto>> GetCurrentSeasonAnimesAsync(int limit = 20)
    {
        try
        {
            var url = $"seasons/now?limit={limit}&order_by=score";
            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode) return new List<AnimeDto>();

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JikanTopResponse>(content, _jsonOptions);

            if (result?.Data == null) return new List<AnimeDto>();

            return result.Data.Select(item =>
            {
                bool isAdult = DetermineIfAdultContent(item.Rating, item.Genres);
                return new AnimeDto
                {
                    MalId = item.MalId,
                    Title = item.Title,
                    TitleEnglish = item.TitleEnglish ?? item.Title,
                    TitleJapanese = item.TitleJapanese ?? item.Title,
                    Synopsis = TruncateSynopsis(item.Synopsis, 300),
                    ImageUrl = ExtractImageUrl(item.Images),
                    Score = item.Score ?? 0,
                    Type = item.Type ?? "TV",
                    Episodes = item.Episodes,
                    Status = item.Status ?? "Unknown",
                    Genres = item.Genres?.Select(g => g.Name).ToList() ?? new List<string>(),
                    AgeRating = item.Rating,
                    IsAdultContent = isAdult,
                    ContentWarnings = GenerateContentWarnings(item.Rating, item.Genres, isAdult)
                };
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current season animes");
            return new List<AnimeDto>();
        }
    }
}