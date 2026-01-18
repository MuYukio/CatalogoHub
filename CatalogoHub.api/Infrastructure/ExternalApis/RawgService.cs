using System.Text.Json;
using System.Text.Json.Serialization;

namespace CatalogoHub.api.Infrastructure.ExternalApis
{
    public class RawgService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly JsonSerializerOptions _jsonOptions;

        public RawgService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["ExternalApis:Rawg:ApiKey"];
            _httpClient.BaseAddress = new Uri("https://api.rawg.io/api/");

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

                return result.Results.Select(g => new GameDto
                {
                    Id = g.Id,
                    Name = g.Name,
                    Released = g.Released,
                    BackgroundImage = g.BackgroundImage,
                    Rating = g.Rating,
                    Platforms = g.Platforms?
                        .Where(p => p?.Platform != null)
                        .Select(p => p.Platform.Name)
                        .ToList() ?? new List<string>(),
                    Genres = g.Genres?
                        .Select(g => g.Name)
                        .ToList() ?? new List<string>()
                }).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SearchGamesAsync: {ex.Message}");
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
                var game = JsonSerializer.Deserialize<RawgGame>(json, _jsonOptions);

                if (game == null)
                    return null;

                return new GameDto
                {
                    Id = game.Id,
                    Name = game.Name,
                    Released = game.Released,
                    BackgroundImage = game.BackgroundImage,
                    Rating = game.Rating,
                    Platforms = game.Platforms?
                        .Where(p => p?.Platform != null)
                        .Select(p => p.Platform.Name)
                        .ToList() ?? new List<string>(),
                    Genres = game.Genres?
                        .Select(g => g.Name)
                        .ToList() ?? new List<string>()
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetGameDetailsAsync: {ex.Message}");
                return null;
            }
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

    // DTO de saída
    public class GameDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Released { get; set; } = string.Empty;
        public string BackgroundImage { get; set; } = string.Empty;
        public double Rating { get; set; }
        public List<string> Platforms { get; set; } = new();
        public List<string> Genres { get; set; } = new();
    }
}