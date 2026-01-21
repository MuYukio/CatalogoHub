using System.ComponentModel.DataAnnotations;

namespace CatalogoHub.api.Domain.DTOs //validacao de dados

{
        public class CreateFavoriteDto
        {
            
            public required string ExternalId { get; set; }

            
            [RegularExpression("^(Game|Anime)$")]
            public required string Type { get; set; }

            
            [StringLength(200)]
            public required string Title { get; set; }

            
            [Url]
            public required string ImageUrl { get; set; }
        }
}


