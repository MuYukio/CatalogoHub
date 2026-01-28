using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;


namespace CatalogoHub.api.Controllers

{
    [ApiController]
    [Route("api/[controller]")]
    public class GenresController : ControllerBase
    {
        private static readonly List<GenreCategory> GameGenreCategories = new()
        {
           new GenreCategory{ Name = "sexual content", Type = "adult", GameGenres = new List<string>
                {"Erotic", "Adult", "Hentai", "NSFW", "Pornographic" }},

           new GenreCategory { Name = "Violence", Type = "violent", GameGenres = new List<string>
                { "Gore", "Violent", "Horror", "Brutal", "Dark" } },

           new GenreCategory { Name = "Provocative Themes", Type = "provocative", GameGenres = new List<string>
                { "Provocative", "Controversial", "Taboo" } }
        };
        private static readonly List<GenreCategory> AnimeGenreCategories = new()
        {
            new GenreCategory { Name = "Sexual Content", Type = "adult", AnimeGenres = new List<string>
                { "Ecchi", "Hentai", "Erotica", "Adult Cast" } },

            new GenreCategory { Name = "Violence", Type = "violent", AnimeGenres = new List<string>
                { "Gore", "Horror", "Violence", "Dark Fantasy", "Psychological" } },

            new GenreCategory { Name = "Mature Themes", Type = "mature", AnimeGenres = new List<string>
                { "Mature", "Seinen", "Josei", "Drama", "Tragedy" } }
        };

        [HttpGet("game-categories")]
        [AllowAnonymous]
        public IActionResult GetGameGenreCategories()
        {
            return Ok(GameGenreCategories);
        }

        [HttpGet("anime-categories")]
        [AllowAnonymous]
        public IActionResult GetAnimeGenreCategories()
        {
            return Ok(AnimeGenreCategories);
        }

        [HttpGet("adult-game-genres")]
        [AllowAnonymous]
        public IActionResult GetAdultGameGenres()
        {
            var adultGenres = GameGenreCategories
                .Where(c => c.Type == "adult")
                .SelectMany(c => c.GameGenres)
                .Distinct()
                .ToList();

            return Ok(adultGenres);
        }

        [HttpGet("adult-anime-genres")]
        [AllowAnonymous]
        public IActionResult GetAdultAnimeGenres()
        {
            var adultGenres = AnimeGenreCategories
                .Where(c => c.Type == "adult")
                .SelectMany(c => c.AnimeGenres)
                .Distinct()
                .ToList();

            return Ok(adultGenres);
        }
    }
    public class GenreCategory
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public List<string> GameGenres { get; set; } = new();
        public List<string> AnimeGenres { get; set; } = new();
        public string Description { get; set; } = string.Empty;
        public int MinimumAge { get; set; } = 18;
    }
}
