namespace CatalogoHub.api.Domain.DTOs
{
    public class FavoriteDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string ExternalId { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public string ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
