using CatalogoHub.api.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace CatalogoHub.api.Domain.Entities //REPRESENTA UM USARIO NO BANCO
{
    public class User
    {
        public int Id { get; set; }
        
        [Required, EmailAddress]
        public string Email { get; set; }

        [Required,MinLength(6)]
        public string PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; } =  DateTime.UtcNow;

        //relacionamento
        public List<UserFavorite>favorites { get; set; } = new();

        public ICollection<UserFavorite> Favorites { get; set; } = new List<UserFavorite>();
    }
}
