using System.ComponentModel.DataAnnotations;

namespace CatalogoHub.api.Domain.Entities 
{
    public class User
    {
        public int Id { get; set; }

        [MaxLength(255)] 
        public required string Email { get; set; }

        [MaxLength(255)] 
        public required string PasswordHash { get; set; }

        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public int Age { get; set; } = 18;
        public bool AllowAdultContent { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }

        public ICollection<UserFavorite> Favorites { get; set; } = new List<UserFavorite>();
    }
}