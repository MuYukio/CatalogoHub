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
                _logger.LogInformation($"Searching animes: '{query}', page {page}");
                var result = await _jikanService.SearchAnimesAsync(query, page);

                var limitedResults = result.Results.Take(limit).ToList();
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
                _logger.LogError(ex, "Error searching animes");
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
                _logger.LogInformation($"Getting anime details for MalId: {malId}");
                var anime = await _jikanService.GetAnimeDetailsAsync(malId);

                if (anime == null)
                    return NotFound(new { message = "Anime not found" });

                return Ok(anime);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting anime details");
                return StatusCode(500, new { message = "Error getting anime details", error = ex.Message });
            }
        }
        [HttpGet("test/popular")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPopularAnimes()
        {
            try
            {
                var anime = await _jikanService.GetAnimeDetailsAsync(20);

                if (anime == null)
                    return Ok(new
                    {
                        success = false,
                        message = "Test failed - Naruto not found"
                    });

                return Ok(new
                {
                    success = true,
                    message = "Jikan API is working correctly!",
                    testAnime = anime
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Jikan API test failed",
                    error = ex.Message
                });
            }
        }
    }
}
