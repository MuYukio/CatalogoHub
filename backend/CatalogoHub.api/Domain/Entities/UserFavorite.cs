using CatalogoHub.api.Domain.Entities;
using System.ComponentModel.DataAnnotations.Schema;

namespace CatalogoHub.api.Domain.Entities
{
    public class UserFavorite // ← ENTIDADE (representa o banco)
    {
        public int Id { get; set; }
        public  int UserId { get; set; }
        public required string ExternalId { get; set; }
        public required string Type { get; set; }
        public required string Title { get; set; }
        public required string ImageUrl { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; }
       
      
    }
}