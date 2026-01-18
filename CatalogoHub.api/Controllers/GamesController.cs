using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CatalogoHub.api.Infrastructure.ExternalApis;


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

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchGames(
            [FromQuery] string query, 
            [FromQuery] int page = 1)
        {
            if(string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Query paramter is required"});
            try
            {
                var games = await _rawgService.SearchGamesAsync(query, page);
                return Ok(games);

            }
            catch(Exception ex)
            {
                return StatusCode(500, new { 
                    message = "Error searching games",
                    error = ex.Message
                });
            }

        }
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetGameDetails(int id)
        {
            if (id <=0)
                return BadRequest(new { message = "Invalid game id"});

            try
            {
                var game = await _rawgService.GetGameDetailsAsync(id);

                if(game == null)
                    return NotFound(new { message = "Game not found"}); 

                return Ok(game);
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { 
                    message = "Error retrieving game details",
                    error = ex.Message
                });
            }


        }
        [HttpGet("test")]
        [AllowAnonymous]
        public async Task<IActionResult> TestApi()
        {
            try
            {
                var testUrl = $"https://api.rawg.io/api/games?key=c73db05cc23e4c69af1418a24e3883cd&search=mario&page=1";
                var httpClient = new HttpClient();
                var response = await httpClient.GetStringAsync(testUrl);

                return Ok(new
                {
                    success = true,
                    length = response.Length,
                    preview = response.Substring(0, Math.Min(500, response.Length))
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }
    }
}
