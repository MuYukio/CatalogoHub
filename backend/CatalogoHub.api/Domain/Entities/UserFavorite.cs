using System.ComponentModel.DataAnnotations;

namespace CatalogoHub.api.Domain.Entities
{
    public class UserFavorite
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        [MaxLength(10)]
        public string Type { get; set; } = string.Empty; 
        [MaxLength(50)]
        public string ExternalId { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}