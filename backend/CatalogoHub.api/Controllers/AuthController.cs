using AutoMapper;
using BCrypt.Net;
using CatalogoHub.api.Domain.DTOs;
using CatalogoHub.api.Domain.Entities;
using CatalogoHub.api.Infrastructure.Auth;
using CatalogoHub.api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;


namespace CatalogoHub.api.Controllers
{
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

        private string HashPassword(string password) =>
            BCrypt.Net.BCrypt.HashPassword(password);

        private bool VerifyPassword(string password, string storedHash) =>
            BCrypt.Net.BCrypt.Verify(password, storedHash);

        private int? TryGetUserIdFromClaims()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null || !int.TryParse(claim.Value, out var id)) return null;
            return id;
        }


        [HttpPost("register")]
        [AllowAnonymous]
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
                    PasswordHash = HashPassword(registerDto.Password), // ← corrigido
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

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

                if (user == null || !VerifyPassword(loginDto.Password, user.PasswordHash))
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

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<AuthResponseDto>> GetCurrentUser()
        {
            try
            {
                var userId = TryGetUserIdFromClaims();
                if (userId == null) return Unauthorized(new { message = "Não autenticado." });

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

        [HttpPut("profile")]
        [Authorize]
        public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            try
            {
                var userId = TryGetUserIdFromClaims();
                if (userId == null) return Unauthorized(new { message = "Não autenticado." });

                var user = await _context.Users.FindAsync(userId);
                if (user == null) return NotFound(new { message = "Usuário não encontrado." });

                if (!string.IsNullOrWhiteSpace(dto.Name))
                    user.Name = dto.Name;

                if (dto.Age.HasValue)
                    user.Age = dto.Age.Value;

                if (dto.AllowAdultContent.HasValue)
                    user.AllowAdultContent = dto.AllowAdultContent.Value;

                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                var userDto = _mapper.Map<UserDto>(user);
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar perfil");
                return StatusCode(500, new { message = "Erro interno ao atualizar perfil." });
            }
        }

        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try
            {
                if (dto.NewPassword != dto.ConfirmNewPassword)
                    return BadRequest(new { message = "A nova senha e a confirmação não coincidem." });

                if (dto.NewPassword.Length < 6)
                    return BadRequest(new { message = "A nova senha deve ter pelo menos 6 caracteres." });

                var userId = TryGetUserIdFromClaims();
                if (userId == null) return Unauthorized(new { message = "Não autenticado." });

                var user = await _context.Users.FindAsync(userId);
                if (user == null) return NotFound(new { message = "Usuário não encontrado." });

                if (!VerifyPassword(dto.CurrentPassword, user.PasswordHash))
                    return Unauthorized(new { message = "Senha atual incorreta." });

                user.PasswordHash = HashPassword(dto.NewPassword);
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Senha alterada com sucesso." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao alterar senha");
                return StatusCode(500, new { message = "Erro interno ao alterar senha." });
            }
        }

        [HttpDelete("account")]
        [Authorize]
        public async Task<IActionResult> DeleteAccount()
        {
            try
            {
                var userId = TryGetUserIdFromClaims();
                if (userId == null) return Unauthorized(new { message = "Não autenticado." });

                var user = await _context.Users.FindAsync(userId);
                if (user == null) return NotFound(new { message = "Usuário não encontrado." });

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Conta excluída com sucesso." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao excluir conta");
                return StatusCode(500, new { message = "Erro interno ao excluir conta." });
            }
        }
    }
}