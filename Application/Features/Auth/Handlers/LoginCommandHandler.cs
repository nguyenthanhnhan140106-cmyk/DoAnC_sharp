using MediatR;
using Dapper;
using MySqlConnector;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Application.Features.Auth.Commands;

namespace Application.Features.Auth.Handlers
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, string?>
    {
        private readonly string _connectionString;
        private readonly IConfiguration _configuration;

        public LoginCommandHandler(IConfiguration configuration)
        {
            _configuration = configuration;
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException("DefaultConnection");
        }

        public async Task<string?> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            using var conn = new MySqlConnection(_connectionString);
            
            // We can just use dynamic here to avoid importing Domain.Entities if not needed, 
            // but let's query the specific fields we need.
            var user = await conn.QuerySingleOrDefaultAsync<UserDtoTemp>(
                "SELECT Id, Username, PasswordHash FROM users WHERE Username = @Username", 
                new { request.Username }
            );

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash)) 
                return null;
                
            var claims = new[] { 
                new Claim(ClaimTypes.Name, user.Username), 
                new Claim("id", user.Id.ToString()) 
            };
            
            return GenerateJwtToken(claims, TimeSpan.FromDays(7));
        }

        private string GenerateJwtToken(IEnumerable<Claim> claims, TimeSpan expiry)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var secretKey = _configuration["Jwt:Key"] ?? "Chuoi_Bi_Mat_Cuc_Ky_Dai_Va_An_Toan_123456";
            var key = Encoding.ASCII.GetBytes(secretKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.Add(expiry),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
        }

        private class UserDtoTemp
        {
            public int Id { get; set; }
            public string Username { get; set; } = null!;
            public string PasswordHash { get; set; } = null!;
        }
    }
}
