using AutoMapper;
using BC = BCrypt.Net.BCrypt; 
using CatalogoHub.api.Domain.DTOs;
using CatalogoHub.api.Domain.Entities;
using CatalogoHub.api.Infrastructure.Auth;
using CatalogoHub.api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;
    private readonly IMapper _mapper;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AppDbContext context, JwtService jwtService,
        IMapper mapper, ILogger<AuthController> logger)
    {
        _context = context;
        _jwtService = jwtService;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpPost("register"), AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
    {
        try
        {
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                return BadRequest(new { message = "Email já está em uso." });

            if (registerDto.Password != registerDto.ConfirmPassword)
                return BadRequest(new { message = "As senhas não coincidem." });

            var user = new User
            {
                Name = registerDto.Name,
                Email = registerDto.Email,
                PasswordHash = BC.HashPassword(registerDto.Password),
                Age = registerDto.Age,
                AllowAdultContent = registerDto.AllowAdultContent,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Novo usuário registrado: {Email}", user.Email);

            var token = _jwtService.GenerateToken(user);
            return Ok(new AuthResponseDto
            {
                UserId = user.Id,
                Token = token,
                Name = user.Name,
                Email = user.Email,
                Age = user.Age,
                AllowAdultContent = user.AllowAdultContent,
                ExpiresAt = _jwtService.GetTokenExpiration()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao registrar usuário");
            return StatusCode(500, new { message = "Erro interno do servidor." });
        }
    }

    [HttpPost("login"), AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null || !BC.Verify(loginDto.Password, user.PasswordHash))
                return Unauthorized(new { message = "Email ou senha incorretos." });

            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(user);
            return Ok(new AuthResponseDto
            {
                UserId = user.Id,
                Token = token,
                Name = user.Name,
                Email = user.Email,
                Age = user.Age,
                AllowAdultContent = user.AllowAdultContent,
                ExpiresAt = _jwtService.GetTokenExpiration()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao fazer login");
            return StatusCode(500, new { message = "Erro interno do servidor." });
        }
    }

    [HttpGet("me"), Authorize]
    public async Task<ActionResult<AuthResponseDto>> GetCurrentUser()
    {
        try
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null || !int.TryParse(claim.Value, out var userId))
                return Unauthorized(new { message = "Usuário não autenticado." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return NotFound(new { message = "Usuário não encontrado." });

            return Ok(new AuthResponseDto
            {
                UserId = user.Id,
                Token = _jwtService.GenerateToken(user),
                Name = user.Name,
                Email = user.Email,
                Age = user.Age,
                AllowAdultContent = user.AllowAdultContent,
                ExpiresAt = _jwtService.GetTokenExpiration()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter perfil");
            return StatusCode(500, new { message = "Erro interno do servidor." });
        }
    }
}