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

        public JikanService(HttpClient httpClient, ILogger<JikanService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _httpClient.BaseAddress = new Uri("https://api.jikan.moe/v4/");
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                NumberHandling = JsonNumberHandling.AllowReadingFromString
            };
        }

        public async Task<AnimeSearchResponseDto> SearchAnimesAsync(string query, int page = 1)
        {
            try
            {
                await Task.Delay(1000);
                var url = $"anime?q={Uri.EscapeDataString(query)}&page={page}&limit=20";
                _logger.LogInformation("Requesting Jikan API: {Url}", url);

                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                var jikanResponse = JsonSerializer.Deserialize<JikanApiResponse>(json, _jsonOptions);

                if (jikanResponse?.Data == null)
                    return new AnimeSearchResponseDto();

                var animes = jikanResponse.Data.Select(a =>
                {
                    bool isAdultContent = DetermineIfAdultContent(a);

                    return new AnimeDto
                    {
                        MalId = a.MalId,
                        Title = a.Title,
                        TitleEnglish = a.TitleEnglish ?? a.Title,
                        TitleJapanese = a.TitleJapanese ?? a.Title,
                        Synopsis = !string.IsNullOrEmpty(a.Synopsis) && a.Synopsis.Length > 500
                            ? a.Synopsis.Substring(0, 500) + "..."
                            : a.Synopsis ?? "Sem sinopse disponível",
                        ImageUrl = a.Images?.JPG?.ImageUrl ?? a.Images?.WebP?.LargeImageUrl ?? string.Empty,
                        Score = a.Score,
                        Type = a.Type,
                        Episodes = a.Episodes,
                        Status = a.Status,
                        Genres = a.Genres?.Select(g => g.Name).ToList() ?? new List<string>(),
                        IsAdultContent = isAdultContent,
                        ContentWarnings = GenerateContentWarnings(a, isAdultContent)
                    };
                }).ToList();

                return new AnimeSearchResponseDto
                {
                    Results = animes,
                    HasNextPage = jikanResponse.Pagination?.HasNextPage ?? false
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while searching animes from Jikan API.");
                throw;
            }
        }

        public async Task<AnimeDto?> GetAnimeDetailsAsync(int malId)
        {
            try
            {
                await Task.Delay(1000);

                var url = $"anime/{malId}/full";
                _logger.LogInformation("Requesting Jikan API details: {Url}", url);

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

                bool isAdultContent = DetermineIfAdultContent(anime);

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
                    Genres = anime.Genres?.Select(g => g.Name).ToList() ?? new List<string>(),
                    IsAdultContent = isAdultContent,
                    ContentWarnings = GenerateContentWarnings(anime, isAdultContent)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting anime details");
                throw;
            }
        }

        public async Task<List<AnimeRecommendationDto>> GetAnimeRecommendationsAsync(int limit = 5)
        {
            try
            {
                await Task.Delay(1000);

                var url = $"recommendations/anime?limit={limit}";
                _logger.LogInformation("🔍 [JIKAN] Fetching anime recommendations from: {Url}", url);

                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("❌ [JIKAN] Recommendations API returned status: {StatusCode}", response.StatusCode);
                    return new List<AnimeRecommendationDto>();
                }

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<JikanRecommendationsResponse>(content, _jsonOptions);

                if (result?.Data == null || result.Data.Count == 0)
                {
                    _logger.LogWarning("⚠️ [JIKAN] No recommendations data");
                    return new List<AnimeRecommendationDto>();
                }

                var recommendations = result.Data
                    .SelectMany(rec => rec.Entries)
                    .Take(limit)
                    .Select(entry => new AnimeRecommendationDto
                    {
                        MalId = entry.MalId,
                        Title = entry.Title,
                        ImageUrl = entry.Images?.JPG?.ImageUrl ?? string.Empty,
                        RecommendationCount = 1
                    })
                    .ToList();

                _logger.LogInformation("✅ [JIKAN] Returning {Count} recommendations", recommendations.Count);
                return recommendations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ [JIKAN] Error getting anime recommendations");
                return new List<AnimeRecommendationDto>();
            }
        }

        public async Task<List<AnimeDto>> GetPopularAnimesAsync(int page = 1, int limit = 20)
        {
            try
            {
                await Task.Delay(1000);

                var url = $"top/anime?page={page}&limit={limit}";
                _logger.LogInformation("🔍 [JIKAN] Fetching popular animes from: {Url}", url);

                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("❌ [JIKAN] API returned status: {StatusCode}", response.StatusCode);
                    return new List<AnimeDto>();
                }

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<JikanTopResponse>(content, _jsonOptions);

                if (result?.Data == null || result.Data.Count == 0)
                {
                    _logger.LogWarning("⚠️ [JIKAN] No data in response");
                    return new List<AnimeDto>();
                }

                _logger.LogInformation("✅ [JIKAN] Successfully retrieved {Count} animes", result.Data.Count);

                var animes = result.Data.Select(item =>
                {
                    bool isAdultContent = DetermineIfAdultContent(item);
                    var contentWarnings = GenerateContentWarnings(item, isAdultContent);

                    return new AnimeDto
                    {
                        MalId = item.MalId,
                        Title = item.Title,
                        TitleEnglish = item.TitleEnglish ?? item.Title,
                        TitleJapanese = item.TitleJapanese ?? item.Title,
                        Synopsis = !string.IsNullOrEmpty(item.Synopsis) && item.Synopsis.Length > 300
                            ? item.Synopsis.Substring(0, 300) + "..."
                            : item.Synopsis ?? "Sem sinopse disponível",
                        ImageUrl = item.Images?.JPG?.ImageUrl ?? item.Images?.WebP?.ImageUrl ?? string.Empty,
                        Score = item.Score ?? 0,
                        Type = item.Type ?? "TV",
                        Episodes = item.Episodes,
                        Status = item.Status ?? "Unknown",
                        Genres = item.Genres?.Select(g => g.Name).ToList() ?? new List<string>(),
                        AgeRating = item.Rating,
                        IsAdultContent = isAdultContent,
                        ContentWarnings = contentWarnings
                    };
                }).ToList();

                var adultCount = animes.Count(a => a.IsAdultContent);
                _logger.LogInformation("⚠️ [JIKAN] Found {AdultCount} adult animes out of {Total}", adultCount, animes.Count);

                return animes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ [JIKAN] Error getting popular animes");
                return new List<AnimeDto>();
            }
        }

        private bool DetermineIfAdultContent(JikanAnimeData animeItem)
        {
            try
            {
                // Verificar pela classificação etária (Rating)
                if (!string.IsNullOrEmpty(animeItem.Rating))
                {
                    var rating = animeItem.Rating.ToUpper();
                    var adultRatings = new[] { "R+", "RX", "R18", "R18+", "17+", "ADULT", "MATURE", "R-17+" };

                    if (adultRatings.Any(r => rating.Contains(r)))
                    {
                        _logger.LogDebug("🔞 [JIKAN] Anime '{Title}' marked adult by rating: {Rating}",
                            animeItem.Title, animeItem.Rating);
                        return true;
                    }
                }

                // Verificar pelos gêneros
                if (animeItem.Genres != null)
                {
                    var adultGenreKeywords = new[]
                    {
                        "hentai", "ecchi", "erotic", "adult", "mature",
                        "gore", "violence", "sexual", "seinen", "josei",
                        "horror", "psychological", "thriller", "demons", "supernatural",
                        "vampire", "zombie", "dark fantasy", "tragedy", "dementia"
                    };

                    foreach (var genre in animeItem.Genres)
                    {
                        var genreName = (genre.Name ?? "").ToLower();
                        if (adultGenreKeywords.Any(keyword => genreName.Contains(keyword)))
                        {
                            _logger.LogDebug("🔞 [JIKAN] Anime '{Title}' marked adult by genre: {Genre}",
                                animeItem.Title, genre.Name);
                            return true;
                        }
                    }
                }

                // Verificar por temas no título ou sinopse
                var adultThemes = new[] { "hentai", "ecchi", "gore", "torture", "rape", "violence", "sex", "porn", "blood", "death" };
                var title = (animeItem.Title ?? "").ToLower();
                var synopsis = (animeItem.Synopsis ?? "").ToLower();

                if (adultThemes.Any(theme => title.Contains(theme) || synopsis.Contains(theme)))
                {
                    _logger.LogDebug("🔞 [JIKAN] Anime '{Title}' marked adult by theme detection", animeItem.Title);
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error determining adult content for anime");
                return false;
            }
        }

        private bool DetermineIfAdultContent(JikanAnimeItem animeItem)
        {
            try
            {
                // Verificar pela classificação etária (Rating)
                if (!string.IsNullOrEmpty(animeItem.Rating))
                {
                    var rating = animeItem.Rating.ToUpper();
                    var adultRatings = new[] { "R+", "RX", "R18", "R18+", "17+", "ADULT", "MATURE", "R-17+" };

                    if (adultRatings.Any(r => rating.Contains(r)))
                    {
                        _logger.LogDebug("🔞 [JIKAN] Anime '{Title}' marked adult by rating: {Rating}",
                            animeItem.Title, animeItem.Rating);
                        return true;
                    }
                }

                // Verificar pelos gêneros
                if (animeItem.Genres != null)
                {
                    var adultGenreKeywords = new[]
                    {
                        "hentai", "ecchi", "erotic", "adult", "mature",
                        "gore", "violence", "sexual", "seinen", "josei",
                        "horror", "psychological", "thriller", "demons", "supernatural",
                        "vampire", "zombie", "dark fantasy", "tragedy", "dementia"
                    };

                    foreach (var genre in animeItem.Genres)
                    {
                        var genreName = (genre.Name ?? "").ToLower();
                        if (adultGenreKeywords.Any(keyword => genreName.Contains(keyword)))
                        {
                            _logger.LogDebug("🔞 [JIKAN] Anime '{Title}' marked adult by genre: {Genre}",
                                animeItem.Title, genre.Name);
                            return true;
                        }
                    }
                }

                // Verificar por temas no título ou sinopse
                var adultThemes = new[] { "hentai", "ecchi", "gore", "torture", "rape", "violence", "sex", "porn", "blood", "death" };
                var title = (animeItem.Title ?? "").ToLower();
                var synopsis = (animeItem.Synopsis ?? "").ToLower();

                if (adultThemes.Any(theme => title.Contains(theme) || synopsis.Contains(theme)))
                {
                    _logger.LogDebug("🔞 [JIKAN] Anime '{Title}' marked adult by theme detection", animeItem.Title);
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error determining adult content for anime");
                return false;
            }
        }

        private List<string> GenerateContentWarnings(JikanAnimeData animeItem, bool isAdultContent)
        {
            var warnings = new List<string>();

            if (!isAdultContent) return warnings;

            // Adicionar avisos baseados na classificação
            if (!string.IsNullOrEmpty(animeItem.Rating))
            {
                var rating = animeItem.Rating.ToUpper();
                if (rating.Contains("R+") || rating.Contains("RX") || rating.Contains("R18"))
                {
                    warnings.Add("Conteúdo adulto explícito");
                }
                else if (rating.Contains("17+"))
                {
                    warnings.Add("Conteúdo para maiores de 17 anos");
                }
                else if (rating.Contains("R-17+"))
                {
                    warnings.Add("Conteúdo violento ou sugestivo");
                }
            }

            // Adicionar avisos baseados em gêneros
            if (animeItem.Genres != null)
            {
                foreach (var genre in animeItem.Genres)
                {
                    var genreName = (genre.Name ?? "").ToLower();
                    if (genreName.Contains("hentai"))
                    {
                        warnings.Add("Conteúdo sexual explícito");
                    }
                    else if (genreName.Contains("ecchi"))
                    {
                        warnings.Add("Conteúdo sugestivo/ecchi");
                    }
                    else if (genreName.Contains("gore") || genreName.Contains("violence"))
                    {
                        warnings.Add("Violência gráfica");
                    }
                    else if (genreName.Contains("horror"))
                    {
                        warnings.Add("Temas de horror");
                    }
                    else if (genreName.Contains("psychological"))
                    {
                        warnings.Add("Temas psicológicos intensos");
                    }
                    else if (genreName.Contains("demons") || genreName.Contains("supernatural"))
                    {
                        warnings.Add("Temas sobrenaturais");
                    }
                }
            }

            // Remover duplicados
            return warnings.Distinct().ToList();
        }

        private List<string> GenerateContentWarnings(JikanAnimeItem animeItem, bool isAdultContent)
        {
            var warnings = new List<string>();

            if (!isAdultContent) return warnings;

            // Adicionar avisos baseados na classificação
            if (!string.IsNullOrEmpty(animeItem.Rating))
            {
                var rating = animeItem.Rating.ToUpper();
                if (rating.Contains("R+") || rating.Contains("RX") || rating.Contains("R18"))
                {
                    warnings.Add("Conteúdo adulto explícito");
                }
                else if (rating.Contains("17+"))
                {
                    warnings.Add("Conteúdo para maiores de 17 anos");
                }
                else if (rating.Contains("R-17+"))
                {
                    warnings.Add("Conteúdo violento ou sugestivo");
                }
            }

            // Adicionar avisos baseados em gêneros
            if (animeItem.Genres != null)
            {
                foreach (var genre in animeItem.Genres)
                {
                    var genreName = (genre.Name ?? "").ToLower();
                    if (genreName.Contains("hentai"))
                    {
                        warnings.Add("Conteúdo sexual explícito");
                    }
                    else if (genreName.Contains("ecchi"))
                    {
                        warnings.Add("Conteúdo sugestivo/ecchi");
                    }
                    else if (genreName.Contains("gore") || genreName.Contains("violence"))
                    {
                        warnings.Add("Violência gráfica");
                    }
                    else if (genreName.Contains("horror"))
                    {
                        warnings.Add("Temas de horror");
                    }
                    else if (genreName.Contains("psychological"))
                    {
                        warnings.Add("Temas psicológicos intensos");
                    }
                    else if (genreName.Contains("demons") || genreName.Contains("supernatural"))
                    {
                        warnings.Add("Temas sobrenaturais");
                    }
                }
            }

            // Remover duplicados
            return warnings.Distinct().ToList();
        }
    }

    // Classes de desserialização (definidas fora da classe JikanService)
    public class JikanTopResponse
    {
        [JsonPropertyName("data")]
        public List<JikanAnimeItem> Data { get; set; } = new();
    }

    public class JikanAnimeItem
    {
        [JsonPropertyName("mal_id")]
        public int MalId { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("title_english")]
        public string? TitleEnglish { get; set; }

        [JsonPropertyName("title_japanese")]
        public string? TitleJapanese { get; set; }

        [JsonPropertyName("synopsis")]
        public string? Synopsis { get; set; }

        [JsonPropertyName("images")]
        public JikanImages? Images { get; set; }

        [JsonPropertyName("score")]
        public decimal? Score { get; set; }

        [JsonPropertyName("type")]
        public string? Type { get; set; }

        [JsonPropertyName("episodes")]
        public int? Episodes { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("genres")]
        public List<JikanGenre>? Genres { get; set; }

        [JsonPropertyName("rating")]
        public string? Rating { get; set; }
    }

    public class JikanImages
    {
        [JsonPropertyName("jpg")]
        public JikanImageJpg? JPG { get; set; }

        [JsonPropertyName("webp")]
        public JikanImageWebp? WebP { get; set; }
    }

    public class JikanImageJpg
    {
        [JsonPropertyName("image_url")]
        public string ImageUrl { get; set; } = string.Empty;

        [JsonPropertyName("small_image_url")]
        public string SmallImageUrl { get; set; } = string.Empty;

        [JsonPropertyName("large_image_url")]
        public string LargeImageUrl { get; set; } = string.Empty;
    }

    public class JikanImageWebp
    {
        [JsonPropertyName("image_url")]
        public string ImageUrl { get; set; } = string.Empty;

        [JsonPropertyName("small_image_url")]
        public string SmallImageUrl { get; set; } = string.Empty;

        [JsonPropertyName("large_image_url")]
        public string LargeImageUrl { get; set; } = string.Empty;
    }

    public class JikanGenre
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
    }

    public class JikanPagination
    {
        [JsonPropertyName("last_visible_page")]
        public int LastVisiblePage { get; set; }

        [JsonPropertyName("has_next_page")]
        public bool HasNextPage { get; set; }

        [JsonPropertyName("current_page")]
        public int CurrentPage { get; set; }

        [JsonPropertyName("items")]
        public JikanPaginationItems Items { get; set; } = new();
    }

    public class JikanPaginationItems
    {
        [JsonPropertyName("count")]
        public int Count { get; set; }

        [JsonPropertyName("total")]
        public int Total { get; set; }

        [JsonPropertyName("per_page")]
        public int PerPage { get; set; }
    }

    public class JikanRecommendationsResponse
    {
        [JsonPropertyName("data")]
        public List<JikanRecommendation> Data { get; set; } = new();
    }

    public class JikanRecommendation
    {
        [JsonPropertyName("mal_id")]
        public string? MalId { get; set; }

        [JsonPropertyName("entry")]
        public List<JikanRecommendationEntry> Entries { get; set; } = new();
    }

    public class JikanRecommendationEntry
    {
        [JsonPropertyName("mal_id")]
        public int MalId { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("images")]
        public JikanImages? Images { get; set; }
    }

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
        public string? TitleEnglish { get; set; }

        [JsonPropertyName("title_japanese")]
        public string? TitleJapanese { get; set; }

        [JsonPropertyName("synopsis")]
        public string? Synopsis { get; set; }

        [JsonPropertyName("images")]
        public AnimeImages? Images { get; set; }

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

        [JsonPropertyName("rating")]
        public string? Rating { get; set; }
    }

    public class AnimeImages
    {
        [JsonPropertyName("jpg")]
        public ImageFormat? JPG { get; set; }

        [JsonPropertyName("webp")]
        public ImageFormat? WebP { get; set; }
    }

    public class ImageFormat
    {
        [JsonPropertyName("image_url")]
        public string ImageUrl { get; set; } = string.Empty;

        [JsonPropertyName("small_image_url")]
        public string SmallImageUrl { get; set; } = string.Empty;

        [JsonPropertyName("large_image_url")]
        public string LargeImageUrl { get; set; } = string.Empty;
    }

    public class Pagination
    {
        [JsonPropertyName("has_next_page")]
        public bool HasNextPage { get; set; }
    }
}