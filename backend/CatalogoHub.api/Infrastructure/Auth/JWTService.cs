using CatalogoHub.api.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
namespace CatalogoHub.api.Infrastructure.Auth;

public class JwtService
{
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _expireHours;

    public JwtService(IConfiguration configuration)
    {
        _secretKey = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT Key not configured");
        _issuer = configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException("JWT Issuer not configured");
        _audience = configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException("JWT Audience not configured");

        _expireHours = int.TryParse(configuration["Jwt:ExpireHours"], out var h) ? h : 2;
    }

    public string GenerateToken(User user)
    {
        var key = Encoding.UTF8.GetBytes(_secretKey);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim("age", user.Age.ToString()),

            new Claim("allowAdultContent", user.AllowAdultContent ? "1" : "0")
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(_expireHours),
            Issuer = _issuer,
            Audience = _audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var handler = new JwtSecurityTokenHandler();
        return handler.WriteToken(handler.CreateToken(tokenDescriptor));
    }

    public DateTime GetTokenExpiration() =>
        DateTime.UtcNow.AddHours(_expireHours);
}