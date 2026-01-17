using System.ComponentModel.DataAnnotations.Schema;

namespace CatalogoHub.Domain.Entities
{
    public class UserFavorite // ← ENTIDADE (representa o banco)
    {
        public int Id { get; set; }
        public required string UserId { get; set; }
        public required string ExternalId { get; set; }
        public required string Type { get; set; }
        public required string Title { get; set; }
        public required string ImageUrl { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}