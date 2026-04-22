using CatalogoHub.api.Infrastructure.ExternalApis;
using CatalogoHub.api.Domain.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CatalogoHub.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnimesController : ControllerBase
    {
        private readonly JikanService _jikanService;
        private readonly ILogger<AnimesController> _logger; 

        public AnimesController(JikanService jikanService, ILogger<AnimesController> logger) 
        {
            _jikanService = jikanService;
            _logger = logger; 
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchAnimes(
            [FromQuery] string query,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 20)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Query parameter is required" });

            if (page < 1) page = 1;

            try
            {
                _logger.LogInformation("Searching animes: '{Query}', page {Page}", query, page);
                var result = await _jikanService.SearchAnimesAsync(query, page);

                return Ok(new
                {
                    results = result.Results,
                    pagination = new
                    {
                        currentPage = page,
                        hasNextPage = result.HasNextPage
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error searching animes", error = ex.Message });
            }
        }

        [HttpGet("{malId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAnimeDetails(int malId)
        {
            if (malId <= 0)
                return BadRequest(new { message = "Invalid anime id" });
            try
            {
                var anime = await _jikanService.GetAnimeDetailsAsync(malId);

                if (anime == null)
                    return NotFound(new { message = "Anime not found" });

                return Ok(anime);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error getting anime details", error = ex.Message });
            }
        }

        [HttpGet("test/popular")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPopularAnimesTest()
        {
            try
            {
                var animes = await _jikanService.GetPopularAnimesAsync(1, 5);

                if (animes == null || animes.Count == 0)
                    return Ok(new { success = false, message = "Test failed - No popular animes found" });

                return Ok(new
                {
                    success = true,
                    message = "Jikan Popular API is working correctly!",
                    count = animes.Count,
                    sampleAnime = animes.FirstOrDefault()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Jikan Popular API test failed", error = ex.Message });
            }
        }

        [HttpGet("recommendations")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<AnimeDto>>> GetAnimeRecommendations([FromQuery] int limit = 5)
        {
            try
            {
                var recommendations = await _jikanService.GetPopularAnimesAsync(1, limit); 

                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error getting recommendations", error = ex.Message });
            }
        }

        [HttpGet("popular")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<AnimeDto>>> GetPopularAnimes(
           [FromQuery] int page = 1,
           [FromQuery] int limit = 20)
        {
            try
            {
                var popularAnimes = await _jikanService.GetPopularAnimesAsync(page, limit);

                return Ok(popularAnimes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error getting popular animes", error = ex.Message });
            }
        }
        [HttpGet("season/current")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<AnimeDto>>> GetCurrentSeasonAnimes([FromQuery] int limit = 20)
        {
            try
            {
                var animes = await _jikanService.GetCurrentSeasonAnimesAsync(limit);
                return Ok(animes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error getting current season", error = ex.Message });
            }
        }
        [HttpGet("catalog"), AllowAnonymous]
        public async Task<IActionResult> GetAnimesCatalog(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null,
            [FromQuery] string? genreIds = null,
            [FromQuery] string? type = null,
            [FromQuery] string? status = null,
            [FromQuery] string ordering = "score")
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 40) pageSize = 20;

            var result = await _jikanService.GetAnimesCatalogAsync(
                page, pageSize, search, genreIds, type, status, ordering);

            return Ok(result);
        }

        [HttpGet("genres"), AllowAnonymous]
        public async Task<IActionResult> GetAnimeGenres()
        {
            var genres = await _jikanService.GetAnimeGenresAsync();
            return Ok(genres);
        }
    }
}