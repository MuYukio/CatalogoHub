using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CatalogoHub.api.Infrastructure.ExternalApis;
using Microsoft.Extensions.Logging;
using CatalogoHub.api.Domain.DTOs;

namespace CatalogoHub.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GamesController : ControllerBase
    {
        private readonly RawgService _rawgService;

        public GamesController(RawgService rawgService)
        {
            _rawgService = rawgService;
        }

        [HttpGet("search"), AllowAnonymous]
        public async Task<IActionResult> SearchGames([FromQuery] string query, [FromQuery] int page = 1)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Query parameter is required" });
            try
            {
                var result = await _rawgService.SearchGamesAsync(query, page);
                return Ok(result); 
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error searching games", error = ex.Message });
            }
        }

        [HttpGet("{id}"), AllowAnonymous]
        public async Task<IActionResult> GetGameDetails(int id)
        {
            if (id <= 0) return BadRequest(new { message = "Invalid game id" });
            try
            {
                var game = await _rawgService.GetGameDetailsAsync(id);
                return game == null
                    ? NotFound(new { message = "Game not found" })
                    : Ok(game);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving game details", error = ex.Message });
            }
        }

        [HttpGet("recent"), AllowAnonymous]
        public async Task<IActionResult> GetRecentGames(
            [FromQuery] int limit = 5,
            [FromQuery] bool includeAdult = false)
        {
            var games = await _rawgService.GetRecentlyReleasedGamesAsync(limit, includeAdult);
            return Ok(games);
        }

        [HttpGet("popular"), AllowAnonymous]
        public async Task<IActionResult> GetPopularGames(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] bool includeAdult = false)
        {
            var games = await _rawgService.GetPopularGamesAsync(page, pageSize, includeAdult);
            return Ok(games);
        }
    }
}
