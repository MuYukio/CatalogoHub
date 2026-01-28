namespace CatalogoHub.api.Domain.DTOs
{
    public class FavoritesPdfDto
    {
        public required string UserEmail { get; set; }
        public DateTime GeneratedAt { get; set; }
        public List<FavoritePdfItemDto> Items { get; set; } = new();
        public required SummaryDto Summary { get; set; } = new();
    }

    public class FavoritePdfItemDto
    {
        public int Id { get; set; }
        public required string Title { get; set; } = string.Empty;
        public required string Type { get; set; } = string.Empty;
        public required string ImageUrl { get; set; } = string.Empty;
        public DateTime AddedDate { get; set; }
        public required string ExternalId { get; set; } = string.Empty;
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
