using AutoMapper;
using CatalogoHub.api.Domain.DTOs;
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

        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        public RawgService(HttpClient httpClient, IConfiguration configuration,
            IMapper mapper, ILogger<RawgService> logger)
        {
            _httpClient = httpClient;

            _apiKey = configuration["ExternalApis:Rawg:ApiKey"]
                ?? throw new InvalidOperationException(
                    "RAWG API Key não encontrada. Configure 'ExternalApis:Rawg:ApiKey' no appsettings.json");
            _mapper = mapper;
            _logger = logger;
        }

        private GameDto MapGame(RawgGame rawgGame)
        {
            var dto = _mapper.Map<GameDto>(rawgGame);
            dto.IsAdultContent = IsAdultGame(rawgGame);
            
            if (dto.IsAdultContent)
            {
                dto.ContentWarnings = rawgGame.EsrbRating != null
                    ? new List<string> { "Conteúdo adulto", $"ESRB: {rawgGame.EsrbRating.Name}" }
                    : new List<string> { "Conteúdo adulto" };
            }

            return dto;
        }

        public async Task<GameSearchResponseDto> SearchGamesAsync(string query, int page = 1)
        {
            try
            {
                var url = $"games?key={_apiKey}&search={Uri.EscapeDataString(query)}&page={page}&page_size=20";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<RawgSearchResponse>(json, JsonOptions);

                if (result?.Results == null) return new GameSearchResponseDto();

                return new GameSearchResponseDto
                {
                    Results = result.Results.Select(MapGame).ToList(),
                    HasNextPage = result.Next != null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SearchGamesAsync");
                return new GameSearchResponseDto();
            }
        }

        public async Task<GameDto?> GetGameDetailsAsync(int id)
        {
            try
            {
                var response = await _httpClient.GetAsync($"games/{id}?key={_apiKey}");
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                var rawgGame = JsonSerializer.Deserialize<RawgGame>(json, JsonOptions);

                return rawgGame == null ? null : MapGame(rawgGame);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetGameDetailsAsync");
                return null;
            }
        }

        public async Task<List<GameDto>> GetRecentlyReleasedGamesAsync(int limit = 10, bool includeAdult = false)
        {
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

                return result.Results
                    .Select(MapGame)
                    .Where(g => includeAdult || !g.IsAdultContent) 
                    .Take(limit)
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent games");
                return new List<GameDto>();
            }
        }



        public async Task<List<GameDto>> GetPopularGamesAsync(int page = 1, int pageSize = 20, bool includeAdult = false)
        {
            try
            {
                var fetchSize = includeAdult ? pageSize : pageSize * 2; // busca extra para compensar filtragem
                var url = $"games?key={_apiKey}&ordering=-rating&page={page}&page_size={fetchSize}";

                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<RawgSearchResponse>(content, JsonOptions);

                if (result?.Results == null) return new List<GameDto>();

                return result.Results
                    .Select(MapGame)
                    .Where(g => includeAdult || !g.IsAdultContent)
                    .Take(pageSize)
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting popular games");
                return new List<GameDto>();
            }
        }
        private bool IsAdultGame(RawgGame game)
        {

            var adultEsrbRatings = new[] { "Mature", "Adults Only" };
            if (game.EsrbRating != null &&
                adultEsrbRatings.Contains(game.EsrbRating.Name, StringComparer.OrdinalIgnoreCase))
                return true;

            var adultGenres = new[] { "Adult", "Erotic", "Hentai", "NSFW", "Sexual Content","Sex" };
            if (game.Genres?.Any(g =>
                adultGenres.Contains(g.Name, StringComparer.OrdinalIgnoreCase)) == true)
                return true;

            var adultKeywords = new[] { "Hentai", "Porn", "XXX", "Lewd", "18+", "BDSM","Sex", };
            if (adultKeywords.Any(k =>
                game.Name.Contains(k, StringComparison.OrdinalIgnoreCase)))
                return true;

            return false;
        }
    }

    public class GameSearchResponseDto
    {
        public List<GameDto> Results { get; set; } = new();
        public bool HasNextPage { get; set; }
    }

    public class RawgSearchResponse
    {
        [JsonPropertyName("count")]
        public int Count { get; set; }

        [JsonPropertyName("next")]
        public string? Next { get; set; }

        [JsonPropertyName("results")]
        public List<RawgGame> Results { get; set; } = new();
    }

    public class RawgGame
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("released")]
        public string? Released { get; set; }

        [JsonPropertyName("background_image")]
        public string? BackgroundImage { get; set; }

        [JsonPropertyName("rating")]
        public double Rating { get; set; }

        [JsonPropertyName("platforms")]
        public List<PlatformInfo> Platforms { get; set; } = new();

        [JsonPropertyName("genres")]
        public List<Genre> Genres { get; set; } = new();

        [JsonPropertyName("esrb_rating")]
        public EsrbRating? EsrbRating { get; set; }

        [JsonPropertyName("description_raw")]
        public string? DescriptionRaw { get; set; }
    }

    public class EsrbRating
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
    }

    public class PlatformInfo
    {
        [JsonPropertyName("platform")]
        public Platform Platform { get; set; } = new();
    }

    public class Platform
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
    }

    public class Genre
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
    }
}