using MediatR;
using Dapper;
using MySqlConnector;
using Microsoft.Extensions.Configuration;
using Application.Features.Auth.Commands;

namespace Application.Features.Auth.Handlers
{
    public class RegisterCommandHandler : IRequestHandler<RegisterCommand, (bool Success, string Message)>
    {
        private readonly string _connectionString;

        public RegisterCommandHandler(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException("DefaultConnection");
        }

        public async Task<(bool Success, string Message)> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
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
    }
}
