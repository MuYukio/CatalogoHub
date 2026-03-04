using AutoMapper;
using CatalogoHub.api.Domain.DTOs;
using CatalogoHub.api.Domain.Entities;
using CatalogoHub.api.Infrastructure.Data;
using CatalogoHub.api.Infrastructure.Pdf;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[Authorize] // ← apenas aqui, não repetir nos métodos
[ApiController]
[Route("api/[controller]")]
public class FavoritesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<FavoritesController> _logger;
    private readonly PdfService _pdfService; 

    public FavoritesController(AppDbContext context, IMapper mapper,
        ILogger<FavoritesController> logger, PdfService pdfService)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
        _pdfService = pdfService;
    }


    private int? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null && int.TryParse(claim.Value, out var id) ? id : null;
    }

    [HttpGet]
    public async Task<IActionResult> GetFavorites()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var favorites = await _context.UserFavorites
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return Ok(favorites);
    }

    [HttpGet("type/{type}")]
    public async Task<IActionResult> GetFavoritesByType(string type)
    {
        if (type != "Game" && type != "Anime")
            return BadRequest(new { message = "Type must be 'Game' or 'Anime'" });

        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var favorites = await _context.UserFavorites
            .Where(f => f.UserId == userId && f.Type == type)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return Ok(favorites);
    }

    [HttpPost]
    public async Task<IActionResult> CreateFavorite([FromBody] CreateFavoriteDto createDto)
    {
        if (createDto.Type != "Game" && createDto.Type != "Anime")
            return BadRequest(new { message = "Type must be 'Game' or 'Anime'" });

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var favorite = _mapper.Map<UserFavorite>(createDto);
        favorite.UserId = userId.Value;

        _context.UserFavorites.Add(favorite);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFavorites),
            new { id = favorite.Id },
            _mapper.Map<FavoriteDto>(favorite));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFavorite(int id)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var favorite = await _context.UserFavorites.FindAsync(id);

        if (favorite == null)
            return NotFound();

        if (favorite.UserId != userId)
            return Forbid();

        _context.UserFavorites.Remove(favorite);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("pdf")]
    [ProducesResponseType(typeof(FileContentResult), 200)]
    public async Task<IActionResult> GenerateFavoritesPdf()
    {
        try
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "Usuário";

            var favorites = await _context.UserFavorites
                .Where(f => f.UserId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

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
                    OldestItem = favorites.Any() ? favorites.Min(f => f.CreatedAt) : null,
                    NewestItem = favorites.Any() ? favorites.Max(f => f.CreatedAt) : null
                }
            };

            var pdfBytes = _pdfService.GenerateFavoritesPdf(pdfData);
            var fileName = $"CatalogoHub_Favoritos_{DateTime.UtcNow:yyyyMMdd_HHmmss}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao gerar PDF de favoritos");
            return StatusCode(500, new { message = "Erro ao gerar PDF", error = ex.Message });
        }
    }
}