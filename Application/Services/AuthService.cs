using System.Data;
using BCrypt.Net;
using Dapper;
using MySqlConnector;
using Application.Interfaces;
using Application.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly string _connectionString;
        private readonly IConfiguration _configuration;

        public AuthService(string connectionString, IConfiguration configuration)
        {
            _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task<(bool Success, string Message)> RegisterAsync(RegisterRequestDTO request)
        {
                        Console.WriteLine("DEBUG: Connecting to: " + _connectionString); // Thêm dòng n

            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                return (false, "Username và mật khẩu không được để trống.");

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12);
            
            using var conn = new MySqlConnection(_connectionString);
            
            string sql = @"INSERT INTO users (Username, Email, PasswordHash) 
                           VALUES (@Username, @Email, @PasswordHash)";
            
            try
            {
                var affectedRows = await conn.ExecuteAsync(sql, new { 
                    request.Username, 
                    request.Email, 
                    PasswordHash = passwordHash 
                });
                
                return affectedRows > 0 ? (true, "Đăng ký thành công!") : (false, "Không thể tạo tài khoản.");
            }
            catch (MySqlException ex) when (ex.Number == 1062)
            {
                return (false, "Tên đăng nhập hoặc Email đã tồn tại.");
            }
        }

        public async Task<string?> LoginAsync(LoginRequestDTO request)
        {
            using var conn = new MySqlConnection(_connectionString);
            
            // Dùng UserEntity thay cho dynamic để tránh lỗi null reference
            var user = await conn.QuerySingleOrDefaultAsync<UserEntity>(
                "SELECT * FROM users WHERE Username = @Username", 
                new { request.Username });

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return null;
            }

            return GenerateJwtToken(user);
        }

        private string GenerateJwtToken(UserEntity user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var secretKey = _configuration["Jwt:Key"] ?? "Chuoi_Bi_Mat_Cuc_Ky_Dai_Va_An_Toan_123456";
            var key = Encoding.ASCII.GetBytes(secretKey); 
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] { 
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim("id", user.Id.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
