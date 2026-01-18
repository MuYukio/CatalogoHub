using System.ComponentModel.DataAnnotations;

namespace CatalogoHub.api.Domain.DTOs //validacao de dados

{
        public class CreateFavoriteDto
        {
            [Required]
            public string ExternalId { get; set; }

            [Required]
            [RegularExpression("^(Game|Anime)$")]
            public string Type { get; set; }

            [Required]
            [StringLength(200)]
            public string Title { get; set; }

            [Required]
            [Url]
            public string ImageUrl { get; set; }
        }
}


