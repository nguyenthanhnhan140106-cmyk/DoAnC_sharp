using Application.Interfaces;
using Application.DTOs;
using Dapper;
using MySqlConnector;

namespace Application.Services
{
    public class UserService : IUserService
    {
        private readonly string _connectionString;

        public UserService(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task<IEnumerable<UserResponseDTO>> GetAllUsersAsync()
        {
            using var conn = new MySqlConnection(_connectionString);
            
            // 1. Lấy dữ liệu dạng Entity từ database
            var users = await conn.QueryAsync<UserEntity>(
                "SELECT Id, Username, Email, PasswordHash, CreatedAt FROM users"
            );

            // 2. Dùng Mapper đã tạo để chuyển sang ResponseDTO (an toàn và ẩn PasswordHash)
            return users.Select(u => u.ToResponseDTO());
        }
    }
}
