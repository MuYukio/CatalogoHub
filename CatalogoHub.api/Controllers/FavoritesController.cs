using AutoMapper;
using CatalogoHub.api.Domain.DTOs;
using CatalogoHub.api.Domain.Entities;
using CatalogoHub.api.Infrastructure.Data;
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

        public FavoritesController(AppDbContext context,IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
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
                .Where(f => f.UserId == userId) // ← FILTRO IMPORTANTE!
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FavoriteDto
                {
                    Id = f.Id,
                    UserId = f.UserId,
                    ExternalId = f.ExternalId,
                    Type = f.Type,
                    Title = f.Title,
                    ImageUrl = f.ImageUrl,
                    CreatedAt = f.CreatedAt
                })
                .ToListAsync();

            return Ok(favorites);
        }

        // POST: api/favorites
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<FavoriteDto>> CreateFavorite(
        [FromBody] CreateFavoriteDto createDto)
        {
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
            favorite.UserId = userId; // ← ATRIBUIÇÃO MANUAL

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