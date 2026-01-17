using System.ComponentModel.DataAnnotations;
namespace CatalogoHub.api.Domain.DTOs

{
    public class CreateFavoriteDto
    {
        [Required(ErrorMessage ="User id é obrigatório")]
        [StringLength(100, MinimumLength = 3)]
        public string UserId { get; set; }

        [Required(ErrorMessage = "External id é obrigatório")]
        public string ExternalId { get; set; }

        [Required]
        [RegularExpression("^(Game|Anime)$", ErrorMessage = "Type deve ser 'Game' or 'Anime'.")]
        public string Type { get; set; }

        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string Title { get; set; }

        [Required]
        [Url(ErrorMessage = "ImageUrl deve ser uma URL válida.")]
        public string ImageUrl { get; set; }
    }
}
