using AutoMapper;
using CatalogoHub.api.Domain.DTOs;
using CatalogoHub.api.Domain.Entities;
using CatalogoHub.api.Infrastructure.Data;
using CatalogoHub.api.Infrastructure.Pdf;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CatalogoHub.api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<FavoritesController> _logger;

        public FavoritesController(AppDbContext context,IMapper mapper, ILogger<FavoritesController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/favorites
        [HttpGet]
        [Authorize] // ← Adicione isso também
        public async Task<ActionResult<IEnumerable<FavoriteDto>>> GetFavorites()
        {
            // 1. Pega o UserId do token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized("Usuário não autenticado");

            var userId = int.Parse(userIdClaim.Value);

            // 2. Filtra APENAS os favoritos do usuário logado
            var favorites = await _context.UserFavorites
                 .Where(f => f.UserId == userId)
                 .OrderByDescending(f => f.CreatedAt)
                 .ToListAsync();

            return Ok(favorites);
        }

        // POST: api/favorites
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<FavoriteDto>> CreateFavorite(
        [FromBody] CreateFavoriteDto createDto)
        {
            if (createDto.Type != "Game" && createDto.Type != "Anime")
            {
                return BadRequest(new { message = "Type must be 'Game' or 'Anime'" });
            }

            // 1. Validação
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // 2. Pegar UserId do token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized("Usuário não autenticado");

            var userId = int.Parse(userIdClaim.Value);

            // 3. Mapear DTO → Entidade
            var favorite = _mapper.Map<UserFavorite>(createDto);
            favorite.UserId = userId; 

            // 4. Salvar
            _context.UserFavorites.Add(favorite);
            await _context.SaveChangesAsync();

            // 5. Mapear Entidade → DTO de resposta
            var favoriteDto = _mapper.Map<FavoriteDto>(favorite);

            // 6. Retornar
            return CreatedAtAction(nameof(GetFavorites),
                new { id = favoriteDto.Id },
                favoriteDto);
        }

        [HttpGet("type/{type}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<FavoriteDto>>> GetFavoritesByType(string type)
        {
            if (type != "Game" && type != "Anime")
                return BadRequest(new { message = "Type must be 'Game' or 'Anime'" });

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized("Usuário não autenticado");

            var userId = int.Parse(userIdClaim.Value);

            var favorites = await _context.UserFavorites
    .Where(f => f.UserId == userId && f.Type == type)
    .OrderByDescending(f => f.CreatedAt)
    .ToListAsync();

            return Ok(favorites);
        }
        [HttpGet("pdf")]
        [Authorize]
        [ProducesResponseType(typeof(FileContentResult), 200)]
        [ProducesResponseType(typeof(object), 401)]
        [ProducesResponseType(typeof(object), 500)]
        public async Task<IActionResult> GenerateFavoritesPdf()
        {
            try
            {
                // 1. Pegar UserId do token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                    return Unauthorized(new { message = "Usuário não autenticado" });

                var userId = int.Parse(userIdClaim.Value);
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "Usuário";

                // 2. Buscar favoritos do usuário
                var favorites = await _context.UserFavorites
                    .Where(f => f.UserId == userId)
                    .OrderByDescending(f => f.CreatedAt)
                    .ToListAsync();

                // 3. Preparar dados para PDF
                var pdfData = new FavoritesPdfDto
                {
                    UserEmail = userEmail,
                    GeneratedAt = DateTime.UtcNow,
                    Items = favorites.Select(f => new FavoritePdfItemDto
                    {
                        Id = f.Id,
                        Title = f.Title,
                        Type = f.Type,
                        ImageUrl = f.ImageUrl,
                        AddedDate = f.CreatedAt,
                        ExternalId = f.ExternalId
                    }).ToList(),
                    Summary = new SummaryDto
                    {
                        TotalItems = favorites.Count,
                        GamesCount = favorites.Count(f => f.Type == "Game"),
                        AnimesCount = favorites.Count(f => f.Type == "Anime"), 
                        OldestItem = favorites.Any() ? favorites.Min(f => f.CreatedAt) : (DateTime?)null,
                        NewestItem = favorites.Any() ? favorites.Max(f => f.CreatedAt) : (DateTime?)null
                    }
                };

                // 4. Gerar PDF
                var pdfService = new PdfService();
                var pdfBytes = pdfService.GenerateFavoritesPdf(pdfData);

                // 5. Retornar arquivo para download
                var fileName = $"CatalogoHub_Favoritos_{DateTime.UtcNow:yyyyMMdd_HHmmss}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Erro ao gerar PDF de favoritos"); // ← Use _logger
                return StatusCode(500, new
                {
                    message = "Erro ao gerar PDF",
                    error = ex.Message
                });
            }
        }
        // DELETE: api/favorites/{id}
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFavorite(int id)
        {
            var favorite = await _context.UserFavorites.FindAsync(id);

            if (favorite == null)
            {
                return NotFound();
            }

            _context.UserFavorites.Remove(favorite);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}