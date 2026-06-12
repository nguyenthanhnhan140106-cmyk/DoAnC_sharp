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
        private readonly IOtpService _otpService;
        private readonly IEmailService _emailService;

        public AuthService(string connectionString, IConfiguration configuration, IOtpService otpService, IEmailService emailService)
        {
            _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _otpService = otpService ?? throw new ArgumentNullException(nameof(otpService));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
        }

        public async Task<bool> SendOtpAsync(string email)
        {
            string otp = new Random().Next(100000, 999999).ToString();
            await _otpService.SaveOtpAsync(email, otp, TimeSpan.FromMinutes(5));
            await _emailService.SendEmailAsync(email, "Mã xác thực TuneVault", $"Mã OTP của bạn là: {otp}. Mã có hiệu lực trong 5 phút.");
            return true;
        }

        public async Task<(bool Success, string Message)> RegisterAsync(RegisterRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                return (false, "Username và mật khẩu không được để trống.");

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12);
            using var conn = new MySqlConnection(_connectionString);
            
            string sql = @"INSERT INTO users (Username, Email, PasswordHash) VALUES (@Username, @Email, @PasswordHash)";
            
            try
            {
                var affectedRows = await conn.ExecuteAsync(sql, new { request.Username, request.Email, PasswordHash = passwordHash });
                return affectedRows > 0 ? (true, "Đăng ký thành công!") : (false, "Không thể tạo tài khoản.");
            }
            catch (MySqlException ex) when (ex.Number == 1062)
            {
                return (false, "Tên đăng nhập hoặc Email đã tồn tại.");
            }
        }

        public async Task<string?> VerifyOtpAndGetToken(string email, string otp)
        {
            var isValid = await _otpService.VerifyOtp(email, otp);
            if (!isValid) return null;
            var claims = new[] { new Claim(ClaimTypes.Email, email), new Claim("Purpose", "Registration") };
            return GenerateJwtToken(claims, TimeSpan.FromMinutes(10));
        }

        public async Task<string?> LoginAsync(LoginRequestDTO request)
        {
            using var conn = new MySqlConnection(_connectionString);
            var user = await conn.QuerySingleOrDefaultAsync<UserEntity>("SELECT * FROM users WHERE Username = @Username", new { request.Username });
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash)) return null;
            var claims = new[] { new Claim(ClaimTypes.Name, user.Username), new Claim("id", user.Id.ToString()) };
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
    }
}
