using MediatR;
using Dapper;
using Microsoft.Data.SqlClient;
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
    using var conn = new SqlConnection(_connectionString);
    
    var user = await conn.QuerySingleOrDefaultAsync<UserDtoTemp>(
        "SELECT Id, Username, PasswordHash FROM users WHERE Username = @Username", 
        new { request.Username }
    );

    // Kiểm tra null an toàn trước khi verify
    if (user == null) return null;

    try 
    {
        // Sử dụng khối try-catch cho hàm Verify để tránh crash hệ thống
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;
    }
    catch (Exception ex)
    {
        // Ghi log lỗi để bạn biết chuỗi hash bị hỏng ở đâu
        Console.WriteLine($"[LỖI HASH] User {user.Username} có PasswordHash không hợp lệ: {ex.Message}");
        return null;
    }
            
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

