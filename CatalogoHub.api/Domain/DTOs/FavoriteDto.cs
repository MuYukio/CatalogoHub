namespace CatalogoHub.api.Domain.DTOs
{
    public class FavoriteDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public required string ExternalId { get; set; }
        public required string Type { get; set; }
        public required string Title { get; set; }
        public required string ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
