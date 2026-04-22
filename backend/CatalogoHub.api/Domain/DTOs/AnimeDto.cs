namespace CatalogoHub.api.Domain.DTOs
{
    public class AnimeDto
    {
        public int MalId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? TitleEnglish { get; set; }
        public string? TitleJapanese { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string? Synopsis { get; set; }
        public double? Score { get; set; }
        public int? Episodes { get; set; }
        public string? Status { get; set; }
        public List<string> Genres { get; set; } = new();
        public int? Year { get; set; }
        public string? Season { get; set; }
        public List<string> Studios { get; set; } = new();
        public bool IsAdultContent { get; set; }
        public List<string> ContentWarnings { get; set; } = new();
        public string? Type { get; set; }

        public int? Rank { get; set; }
        public int? Popularity { get; set; }
        public string? Source { get; set; }
        public string? Aired { get; set; }
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

