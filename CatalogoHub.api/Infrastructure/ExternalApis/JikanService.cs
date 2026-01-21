using AutoMapper;
using CatalogoHub.api.Domain.DTOs;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CatalogoHub.api.Infrastructure.ExternalApis
{
    public class JikanService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<JikanService> _logger;
        private readonly JsonSerializerOptions _jsonOptions;
        private readonly IMapper _mapper;


        public JikanService(HttpClient httpClient, ILogger<JikanService> logger, IMapper mapper)
        {
            _httpClient = httpClient;
            _logger = logger;
            _httpClient.BaseAddress = new Uri("https://api.jikan.moe/v4/");
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            _mapper = mapper;
        }
        public async Task<AnimeSearchResponseDto> SearchAnimesAsync(string query, int page = 1)
        {
            try
            {

                await Task.Delay(1000);
                var url = $"anime?q={Uri.EscapeDataString(query)}&page={page}&limit=20";
                _logger.LogInformation("Requesting Jikan API: {Url}",url);

                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                var JikanResponse = JsonSerializer.Deserialize<JikanApiResponse>(json, _jsonOptions);

                if (JikanResponse?.Data == null)
                    return new AnimeSearchResponseDto();

                var animes = JikanResponse.Data.Select(a => new AnimeDto
                {
                    MalId = a.MalId,    
                    Title = a.Title,
                    TitleEnglish = a.TitleEnglish ?? a.Title,
                    TitleJapanese = a.TitleJapanese ?? a.Title,
                    Synopsis = !string.IsNullOrEmpty(a.Synopsis) && a.Synopsis.Length > 500
                        ? a.Synopsis.Substring(0, 500) + "..."
                        : a.Synopsis ?? "Sem sinopse disponível",
                    ImageUrl = a.Images?.JPG?.ImageUrl ?? a.Images?.WebP?.largeImageUrl ?? string.Empty,
                    Score = a.Score,
                    Type = a.Type,
                    Episodes = a.Episodes,
                    Status = a.Status,
                    Genres = a.Genres?.Select(g => g.Name).ToList() ?? new List<string>()
                }).ToList();

                return new AnimeSearchResponseDto
                {
                    Results = animes,
                    HasNextPage = JikanResponse.Pagination?.HasNextPage ?? false
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while searching animes from Jikan API.");
                throw;

            }
        }
        public async Task<AnimeDto?> GetAnimeDetailsAsync(int MalId)
        {
            try
            {
                await Task.Delay(1000);

                var url = $"anime/{MalId}/full";
                _logger.LogInformation("Requesting Jikan API details: {Url}",url);

                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    return null;
                }
                var json = await response.Content.ReadAsStringAsync();
                var jikanResponse = JsonSerializer.Deserialize<JikanAnimeResponse>(json, _jsonOptions);

                if (jikanResponse?.Data == null)
                    return null;

                var anime = jikanResponse.Data;
                return new AnimeDto
                {
                    MalId = anime.MalId,
                    Title = anime.Title,
                    TitleEnglish = anime.TitleEnglish,
                    TitleJapanese = anime.TitleJapanese,
                    Synopsis = anime.Synopsis,
                    ImageUrl = anime.Images?.JPG?.ImageUrl ?? anime.Images?.WebP?.ImageUrl ?? string.Empty,
                    Score = anime.Score,
                    Type = anime.Type,
                    Episodes = anime.Episodes,
                    Status = anime.Status,
                    Genres = anime.Genres?.Select(g => g.Name).ToList() ?? new List<string>()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting anime details");
                throw;
            }
        }
    }

    // Classes para desserialização da API Jikan
    public class JikanApiResponse
    {
        [JsonPropertyName("data")]
        public List<JikanAnimeData> Data { get; set; } = new();
        [JsonPropertyName("pagination")]
        public Pagination Pagination { get; set; } = new();
    }
    public class JikanAnimeResponse
    {
        [JsonPropertyName("data")]
        public JikanAnimeData Data { get; set; } = new();
    }
    public class JikanAnimeData
    {
        [JsonPropertyName("mal_id")]
        public int MalId { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("title_english")]
        public string? TitleEnglish { get; set; } = string.Empty;

        [JsonPropertyName("title_japanese")]
        public string? TitleJapanese { get; set; } = string.Empty;

        [JsonPropertyName("synopsis")]
        public string? Synopsis { get; set; } = string.Empty;

        [JsonPropertyName("images")]
        public AnimeImages? Images { get; set; } = new();

        [JsonPropertyName("score")]
        public decimal? Score { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;
        
        [JsonPropertyName("episodes")]
        public int? Episodes { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("genres")]
        public List<JikanGenre> Genres { get; set; } = new();
    }

    public class AnimeImages
    {
        [JsonPropertyName("jpg")]
        public ImageFormat? JPG { get; set; } = new();
        
        [JsonPropertyName("webp")]
        public ImageFormat? WebP { get; set; } = new();
    }
    public class ImageFormat
    {
        [JsonPropertyName("image_url")]
        public string ImageUrl { get; set; } = string.Empty;

        [JsonPropertyName("small_image_url")]
        public string smallImageUrl { get; set; } = string.Empty;

        [JsonPropertyName("large_image_url")]
        public string largeImageUrl { get; set; } = string.Empty;
    }
    public class JikanGenre
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
    }
    public class Pagination
    {

        [JsonPropertyName("has_next_page")]
        public bool HasNextPage { get; set; }
    }
}