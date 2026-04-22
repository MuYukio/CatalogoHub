using AutoMapper;
using CatalogoHub.api.Domain.DTOs;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CatalogoHub.api.Infrastructure.ExternalApis
{
    public class RawgService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly IMapper _mapper;
        private readonly ILogger<RawgService> _logger;
        private readonly IMemoryCache _cache;

        private static readonly TimeSpan CacheSearch = TimeSpan.FromMinutes(10);
        private static readonly TimeSpan CacheDetail = TimeSpan.FromHours(1);
        private static readonly TimeSpan CacheRecent = TimeSpan.FromMinutes(20);
        private static readonly TimeSpan CachePopular = TimeSpan.FromMinutes(30);

        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        public RawgService(HttpClient httpClient, IConfiguration configuration,
            IMapper mapper, ILogger<RawgService> logger, IMemoryCache cache)
        {
            _httpClient = httpClient;
            _apiKey = configuration["ExternalApis:Rawg:ApiKey"]
                ?? throw new InvalidOperationException(
                    "RAWG API Key não encontrada. Configure 'ExternalApis:Rawg:ApiKey' no appsettings.json");
            _mapper = mapper;
            _logger = logger;
            _cache = cache;
        }

        private GameDto MapGame(RawgGame rawgGame)
        {
            var dto = _mapper.Map<GameDto>(rawgGame);
            dto.Tags = rawgGame.Tags?.Select(t => t.Name).ToList() ?? new List<string>();
            dto.Developer = rawgGame.Developers?.FirstOrDefault()?.Name;
            dto.Publisher = rawgGame.Publishers?.FirstOrDefault()?.Name;
            dto.Metacritic = rawgGame.Metacritic;
            dto.Description = rawgGame.DescriptionRaw;
            dto.IsAdultContent = IsAdultGame(rawgGame);
            if (dto.IsAdultContent)
            {
                dto.ContentWarnings = rawgGame.EsrbRating != null
                    ? new List<string> { "Conteúdo adulto", $"ESRB: {rawgGame.EsrbRating.Name}" }
                    : new List<string> { "Conteúdo adulto" };
            }
            return dto;
        }

        private bool IsAdultGame(RawgGame game)
        {
            var adultEsrbRatings = new[] { "Mature", "Adults Only" };
            if (game.EsrbRating != null &&
                adultEsrbRatings.Contains(game.EsrbRating.Name, StringComparer.OrdinalIgnoreCase))
                return true;

            var adultGenres = new[] { "Adult", "Erotic", "Hentai", "NSFW", "Sexual Content", "Sex" };
            if (game.Genres?.Any(g =>
                adultGenres.Contains(g.Name, StringComparer.OrdinalIgnoreCase)) == true)
                return true;

            var adultKeywords = new[] { "Hentai", "Porn", "XXX", "Lewd", "18+", "BDSM", "Sex" };
            if (adultKeywords.Any(k =>
                game.Name.Contains(k, StringComparison.OrdinalIgnoreCase)))
                return true;

            return false;
        }

        public async Task<GameSearchResponseDto> SearchGamesAsync(string query, int page = 1)
        {
            var cacheKey = $"rawg:search:{query.ToLower().Trim()}:p{page}";

            if (_cache.TryGetValue(cacheKey, out GameSearchResponseDto? cached) && cached != null)
            {
                _logger.LogInformation("[Cache HIT] SearchGames: {Key}", cacheKey);
                return cached;
            }

            try
            {
                var url = $"games?key={_apiKey}&search={Uri.EscapeDataString(query)}&page={page}&page_size=20";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<RawgSearchResponse>(json, JsonOptions);

                if (result?.Results == null) return new GameSearchResponseDto();

                var dto = new GameSearchResponseDto
                {
                    Results = result.Results.Select(MapGame).ToList(),
                    HasNextPage = result.Next != null
                };

                _cache.Set(cacheKey, dto, CacheSearch);
                return dto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SearchGamesAsync");
                return new GameSearchResponseDto();
            }
        }

        public async Task<GameDto?> GetGameDetailsAsync(int id)
        {
            var cacheKey = $"rawg:detail:{id}";

            if (_cache.TryGetValue(cacheKey, out GameDto? cached) && cached != null)
            {
                _logger.LogInformation("[Cache HIT] GetGameDetails: {Key}", cacheKey);
                return cached;
            }

            try
            {
                var response = await _httpClient.GetAsync($"games/{id}?key={_apiKey}");
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                var rawgGame = JsonSerializer.Deserialize<RawgGame>(json, JsonOptions);

                if (rawgGame == null) return null;

                var dto = MapGame(rawgGame);
                _cache.Set(cacheKey, dto, CacheDetail);
                return dto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetGameDetailsAsync");
                return null;
            }
        }

        public async Task<List<GameDto>> GetRecentlyReleasedGamesAsync(int limit = 10, bool includeAdult = false)
        {
            var cacheKey = $"rawg:recent:l{limit}:adult{includeAdult}";

            if (_cache.TryGetValue(cacheKey, out List<GameDto>? cached) && cached != null)
            {
                _logger.LogInformation("[Cache HIT] GetRecentGames: {Key}", cacheKey);
                return cached;
            }

            try
            {
                var oneYearAgo = DateTime.Now.AddYears(-1).ToString("yyyy-MM-dd");
                var today = DateTime.Now.ToString("yyyy-MM-dd");
                var fetchSize = Math.Max(limit * 3, 60);

                var url = $"games?key={_apiKey}&dates={oneYearAgo},{today}&ordering=-released,-rating&page_size={fetchSize}";
                _logger.LogInformation("Fetching recent games: {Url}", url);

                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<RawgSearchResponse>(content, JsonOptions);

                if (result?.Results == null) return new List<GameDto>();

                var games = result.Results
                    .Select(MapGame)
                    .Where(g => includeAdult || !g.IsAdultContent)
                    .Take(limit)
                    .ToList();

                _cache.Set(cacheKey, games, CacheRecent);
                return games;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent games");
                return new List<GameDto>();
            }
        }

        public async Task<List<GameDto>> GetPopularGamesAsync(int page = 1, int pageSize = 20, bool includeAdult = false)
        {
            var cacheKey = $"rawg:popular:p{page}:s{pageSize}:adult{includeAdult}";

            if (_cache.TryGetValue(cacheKey, out List<GameDto>? cached) && cached != null)
            {
                _logger.LogInformation("[Cache HIT] GetPopularGames: {Key}", cacheKey);
                return cached;
            }

            try
            {
                var fetchSize = includeAdult ? pageSize : pageSize * 2;
                var url = $"games?key={_apiKey}&ordering=-rating&page={page}&page_size={fetchSize}";

                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<RawgSearchResponse>(content, JsonOptions);

                if (result?.Results == null) return new List<GameDto>();

                var games = result.Results
                    .Select(MapGame)
                    .Where(g => includeAdult || !g.IsAdultContent)
                    .Take(pageSize)
                    .ToList();

                _cache.Set(cacheKey, games, CachePopular);
                return games;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting popular games");
                return new List<GameDto>();
            }
        }
        public async Task<CatalogResponseDto<GameDto>> GetGamesCatalogAsync(
            int page = 1,
            int pageSize = 20,
            string? search = null,
            string? genres = null,
            string? platform = null,
            string ordering = "-rating",
            bool includeAdult = false)
        {
            var cacheKey = $"rawg:catalog:p{page}:s{pageSize}:q{search}:g{genres}:pl{platform}:o{ordering}:adult{includeAdult}";

            if (_cache.TryGetValue(cacheKey, out CatalogResponseDto<GameDto>? cached) && cached != null)
            {
                _logger.LogInformation("[Cache HIT] GetGamesCatalog: {Key}", cacheKey);
                return cached;
            }

            try
            {
                var fetchSize = includeAdult ? pageSize : pageSize * 2;
                var url = $"games?key={_apiKey}&page={page}&page_size={fetchSize}&ordering={ordering}";

                if (!string.IsNullOrWhiteSpace(search))
                    url += $"&search={Uri.EscapeDataString(search)}";

                if (!string.IsNullOrWhiteSpace(genres))
                    url += $"&genres={Uri.EscapeDataString(genres)}";

                if (!string.IsNullOrWhiteSpace(platform))
                    url += $"&platforms={Uri.EscapeDataString(platform)}";

                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<RawgSearchResponse>(content, JsonOptions);

                if (result?.Results == null) return new CatalogResponseDto<GameDto> { CurrentPage = page };

                var games = result.Results
                    .Select(MapGame)
                    .Where(g => includeAdult || !g.IsAdultContent)
                    .Take(pageSize)
                    .ToList();

                var totalCount = result.Count ?? 0;
                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

                var dto = new CatalogResponseDto<GameDto>
                {
                    Results = games,
                    CurrentPage = page,
                    TotalPages = Math.Min(totalPages, 500), 
                    HasNextPage = result.Next != null,
                    TotalCount = totalCount
                };

                _cache.Set(cacheKey, dto, CacheSearch);
                return dto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetGamesCatalogAsync");
                return new CatalogResponseDto<GameDto> { CurrentPage = page };
            }
        }

        public async Task<List<GenreDto>> GetGameGenresAsync()
        {
            const string cacheKey = "rawg:genres";
            if (_cache.TryGetValue(cacheKey, out List<GenreDto>? cached) && cached != null)
                return cached;

            var response = await _httpClient.GetAsync($"genres?key={_apiKey}");
            if (!response.IsSuccessStatusCode) return new();

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<RawgGenresResponse>(json, JsonOptions);

            var genres = result?.Results?
                .Select(g => new GenreDto { Id = g.Id, Name = g.Name, Slug = g.Slug })
                .ToList() ?? new();

            _cache.Set(cacheKey, genres, TimeSpan.FromHours(24));
            return genres;
        }
    }
}