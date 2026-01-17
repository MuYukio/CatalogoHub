using AutoMapper;
using CatalogoHub.api.Domain.DTOs;
using CatalogoHub.Domain.Entities;
using CatalogoHub.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CatalogoHub.Controllers
{
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
        public async Task<ActionResult<IEnumerable<FavoriteDto>>> GetFavorites() // ← ActionResult<T>
        {
            var favorites = await _context.UserFavorites
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
        public async Task<ActionResult<FavoriteDto>> CreateFavorite( 
            [FromBody] CreateFavoriteDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var favorite = _mapper.Map<UserFavorite>(createDto);

            _context.UserFavorites.Add(favorite);
            await _context.SaveChangesAsync();

            // Mapear para DTO
            var favoriteDto = _mapper.Map<FavoriteDto>(favorite);

            return CreatedAtAction(nameof(GetFavorites),
                new { id = favoriteDto.Id },
                favoriteDto);
        }

        // DELETE: api/favorites/{id}
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