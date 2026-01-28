using AutoMapper;
using CatalogoHub.api.Domain.DTOs;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CatalogoHub.api.Infrastructure.ExternalApis
{
    public class RawgService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly JsonSerializerOptions _jsonOptions;
        private readonly IMapper _mapper;
        private readonly ILogger<RawgService> _logger;

        public RawgService(HttpClient httpClient, IConfiguration configuration, IMapper mapper, ILogger<RawgService> logger)
        {
            _httpClient = httpClient;
            _apiKey = configuration["ExternalApis:Rawg:ApiKey"] ?? "c73db05cc23e4c69af1418a24e3883cd";
            _httpClient.BaseAddress = new Uri("https://api.rawg.io/api/");
            _mapper = mapper;
            _logger = logger;

            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
            };
        }

        public async Task<List<GameDto>> SearchGamesAsync(string query, int page = 1)
        {
            try
            {
                var url = $"games?key={_apiKey}&search={Uri.EscapeDataString(query)}&page={page}";
                var response = await _httpClient.GetAsync(url);

                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<RawgSearchResponse>(json, _jsonOptions);

                if (result?.Results == null)
                    return new List<GameDto>();

                var games = new List<GameDto>();
                foreach (var rawgGame in result.Results)
                {
                    var gameDto = _mapper.Map<GameDto>(rawgGame);
                    gameDto.IsAdultContent = IsAdultGame(rawgGame);

                    // Adicionar content warnings se for adulto
                    if (gameDto.IsAdultContent)
                    {
                        gameDto.ContentWarnings.Add("Adult Content");
                        if (rawgGame.EsrbRating != null)
                            gameDto.ContentWarnings.Add($"ESRB: {rawgGame.EsrbRating.Name}");
                    }

                    games.Add(gameDto);
                }

                return games;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SearchGamesAsync");
                return new List<GameDto>();
            }
        }

        public async Task<GameDto?> GetGameDetailsAsync(int id)
        {
            try
            {
                var url = $"games/{id}?key={_apiKey}";
                var response = await _httpClient.GetAsync(url);

                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                var rawgGame = JsonSerializer.Deserialize<RawgGame>(json, _jsonOptions);

                if (rawgGame == null)
                    return null;

                var gameDto = _mapper.Map<GameDto>(rawgGame);
                gameDto.IsAdultContent = IsAdultGame(rawgGame);

                if (gameDto.IsAdultContent)
                {
                    gameDto.ContentWarnings.Add("Adult Content");
                    if (rawgGame.EsrbRating != null)
                        gameDto.ContentWarnings.Add($"ESRB: {rawgGame.EsrbRating.Name}");
                }

                return gameDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetGameDetailsAsync");
                return null;
            }
        }

        public async Task<List<GameDto>> GetRecentlyReleasedGamesAsync(int limit = 5)
        {
            try
            {
                // Buscar jogos lançados nos últimos 6 meses (não futuros)
                var sixMonthsAgo = DateTime.Now.AddMonths(-6).ToString("yyyy-MM-dd");
                var currentDate = DateTime.Now.ToString("yyyy-MM-dd");

                var url = $"games?key={_apiKey}&dates={sixMonthsAgo},{currentDate}&ordering=-released,-rating&page_size={limit}";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<RawgSearchResponse>(content, _jsonOptions);

                if (result?.Results == null)
                    return new List<GameDto>();

                var games = new List<GameDto>();
                foreach (var rawgGame in result.Results)
                {
                    var gameDto = _mapper.Map<GameDto>(rawgGame);
                    gameDto.IsAdultContent = IsAdultGame(rawgGame);

                    if (gameDto.IsAdultContent)
                    {
                        gameDto.ContentWarnings.Add("Adult Content");
                        if (rawgGame.EsrbRating != null)
                            gameDto.ContentWarnings.Add($"ESRB: {rawgGame.EsrbRating.Name}");
                    }

                    games.Add(gameDto);
                }

                return games;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent games");
                return new List<GameDto>();
            }
        }

        public async Task<List<GameDto>> GetPopularGamesAsync(int page = 1, int pageSize = 20)
        {
            try
            {
                var url = $"games?key={_apiKey}&ordering=-rating&page={page}&page_size={pageSize}";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<RawgSearchResponse>(content, _jsonOptions);

                if (result?.Results == null)
                    return new List<GameDto>();

                var games = new List<GameDto>();
                foreach (var rawgGame in result.Results)
                {
                    var gameDto = _mapper.Map<GameDto>(rawgGame);
                    gameDto.IsAdultContent = IsAdultGame(rawgGame);

                    if (gameDto.IsAdultContent)
                    {
                        gameDto.ContentWarnings.Add("Adult Content");
                        if (rawgGame.EsrbRating != null)
                            gameDto.ContentWarnings.Add($"ESRB: {rawgGame.EsrbRating.Name}");
                    }

                    games.Add(gameDto);
                }

                return games;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting popular games");
                return new List<GameDto>();
            }
        }

        private bool IsAdultGame(RawgGame game)
        {
            // Verificar ESRB rating
            var adultEsrbRatings = new[] { "Mature", "Adults Only", "Rating Pending" };
            if (game.EsrbRating != null && adultEsrbRatings.Contains(game.EsrbRating.Name))
                return true;

            // Verificar gêneros adultos
            var adultGenres = new[] { "Adult", "Erotic", "Hentai", "NSFW", "Gore", "Violent", "Horror", "Sexual Content" };
            if (game.Genres != null && game.Genres.Any(g => adultGenres.Contains(g.Name, StringComparer.OrdinalIgnoreCase)))
                return true;

            // Verificar no nome (heurística simples)
            var adultKeywords = new[] { "BDSM", "Hentai", "Porn", "Sex", "XXX", "Lewd", "18+", "Adult" };
            if (adultKeywords.Any(keyword =>
                game.Name.Contains(keyword, StringComparison.OrdinalIgnoreCase)))
                return true;

            return false;
        }
    }

    // Classes de resposta
    public class RawgSearchResponse
    {
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
        public string Released { get; set; } = string.Empty;

        [JsonPropertyName("background_image")]
        public string BackgroundImage { get; set; } = string.Empty;

        [JsonPropertyName("rating")]
        public double Rating { get; set; }

        [JsonPropertyName("platforms")]
        public List<PlatformInfo> Platforms { get; set; } = new();

        [JsonPropertyName("genres")]
        public List<Genre> Genres { get; set; } = new();

        [JsonPropertyName("esrb_rating")]
        public EsrbRating? EsrbRating { get; set; }
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