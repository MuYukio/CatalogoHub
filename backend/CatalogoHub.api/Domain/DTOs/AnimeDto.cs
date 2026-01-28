namespace CatalogoHub.api.Domain.DTOs
{
    public class AnimeDto
    {
        public int MalId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? TitleEnglish { get; set; } = string.Empty;
        public string? TitleJapanese { get; set; } = string.Empty;
        public string? Synopsis { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public decimal? Score { get; set; }
        public string? Type { get; set; } = string.Empty;
        public int? Episodes { get; set; }
        public string? Status { get; set; } = string.Empty;
        public List<string> Genres { get; set; } = new();
        public string? Rating { get; set; }
        public bool IsAdultContent { get; set; }
        public List<string> ContentWarnings { get; set; } = new();
        public string? AgeRating { get; set; }
    }
    public class AnimeSearchResponseDto
    {
        public List<AnimeDto> Results { get; set; } = new();
        public bool HasNextPage { get; set; }
    }
    public class AnimeRecommendationDto
    {
        public int MalId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int RecommendationCount { get; set; }
    }
}

