namespace CatalogoHub.api.Domain.DTOs
{
    public class FavoritesPdfDto
    {
        public string UserEmail { get; set; }
        public DateTime GeneratedAt { get; set; }
        public List<FavoritePdfItemDto> Items { get; set; } = new();
        public SummaryDto Summary { get; set; } = new();
    }

    public class FavoritePdfItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime AddedDate { get; set; }
        public string ExternalId { get; set; } = string.Empty;
    }
    public class SummaryDto
    {
        public int TotalItems { get; set; }
        public int GamesCount { get; set; }
        public int AnimesCount { get; set; }
        public DateTime? OldestItem { get; set; }  
        public DateTime? NewestItem { get; set; }  
    }
}
