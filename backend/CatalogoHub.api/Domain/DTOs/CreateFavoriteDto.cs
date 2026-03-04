using System.ComponentModel.DataAnnotations;

namespace CatalogoHub.api.Domain.DTOs
{
    public class CreateFavoriteDto
    {
        [Required]
        [StringLength(50, MinimumLength = 1)]
        public required string ExternalId { get; set; }

        [Required]
        [RegularExpression("^(Game|Anime)$", ErrorMessage = "Type must be 'Game' or 'Anime'")]
        public required string Type { get; set; }

        [Required]
        [StringLength(200, MinimumLength = 1)]
        public required string Title { get; set; }

        [Required]
        [StringLength(500)]
        public string ImageUrl { get; set; } = string.Empty;
    }
}