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
                "SELECT Id, Username, Email, PasswordHash, AvatarUrl, CreatedAt FROM users"
            );

            // 2. Dùng Mapper đã tạo để chuyển sang ResponseDTO (an toàn và ẩn PasswordHash)
            return users.Select(u => u.ToResponseDTO());
        }

        public async Task<UserResponseDTO?> GetUserByIdAsync(int id)
        {
            using var conn = new MySqlConnection(_connectionString);
            
            var query = @"
                SELECT 
                    u.Id, u.Username, u.Email, u.PasswordHash, u.AvatarUrl, u.CreatedAt,
                    (SELECT COUNT(*) FROM user_follows WHERE FollowedUserId = u.Id) as FollowersCount,
                    ((SELECT COUNT(*) FROM user_follows WHERE FollowerId = u.Id) + (SELECT COUNT(*) FROM follows WHERE UserId = u.Id)) as FollowingCount
                FROM users u
                WHERE u.Id = @Id";

            var user = await conn.QueryFirstOrDefaultAsync<UserEntity>(
                query,
                new { Id = id }
            );

            return user?.ToResponseDTO();
        }
    }
}
