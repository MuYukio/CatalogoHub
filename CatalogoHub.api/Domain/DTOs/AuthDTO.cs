using System.ComponentModel.DataAnnotations;

namespace CatalogoHub.api.Domain.DTOs
{
    public class RegisterDto
    {
        [EmailAddress]
        public required string Email { get; set; }
        [MinLength(6)]
        public required string Password { get; set; }

        [Compare("Password")]
        public required string ConfirmPassword { get; set; }
    }
    public class LoginDto
    {
        [EmailAddress]
        public required string Email { get; set; }

        [MinLength(6)]
        public required string Password { get; set; }
    }

    public class AuthResponseDto
    {
        public required string Token { get; set; }
        public DateTime ExpiresAt { get; set; }
        public required UserDto User { get; set; }
    }
    public class UserDto
    {
        public int Id { get; set; }
        public required string Email { get; set; }
        public DateTime CreatedAt { get; set; }
    }

}
