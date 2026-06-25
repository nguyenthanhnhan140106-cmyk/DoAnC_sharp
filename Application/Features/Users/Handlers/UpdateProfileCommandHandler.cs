using MediatR;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Application.DTOs;
using Application.Features.Users.Commands;

namespace Application.Features.Users.Handlers
{
    public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, UserResponseDTO?>
    {
        private readonly string _connectionString;

        public UpdateProfileCommandHandler(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("DefaultConnection");
        }

        public async Task<UserResponseDTO?> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
        {
            using var conn = new SqlConnection(_connectionString);

            
            var setClauses = new List<string>();
            if (!string.IsNullOrWhiteSpace(request.DisplayName)) setClauses.Add("DisplayName = @DisplayName");
            if (request.Bio != null)       setClauses.Add("Bio = @Bio");
            if (request.AvatarUrl != null) setClauses.Add("AvatarUrl = @AvatarUrl");

            if (setClauses.Count == 0)
                throw new InvalidOperationException("Không có thông tin nào được cập nhật.");

            var sql = $"UPDATE users SET {string.Join(", ", setClauses)} WHERE Id = @Id";
            await conn.ExecuteAsync(sql, new
            {
                request.Id,
                request.DisplayName,
                request.Bio,
                request.AvatarUrl
            });

            
            var query = @"
                SELECT 
                    u.Id, u.Username, u.DisplayName, u.Email, u.AvatarUrl, u.Bio, u.CreatedAt,
                    (SELECT COUNT(*) FROM user_follows WHERE FollowedUserId = u.Id) as FollowersCount,
                    ((SELECT COUNT(*) FROM user_follows WHERE FollowerId = u.Id) + (SELECT COUNT(*) FROM follows WHERE UserId = u.Id)) as FollowingCount
                FROM users u
                WHERE u.Id = @Id";

            var user = await conn.QueryFirstOrDefaultAsync<UserEntity>(query, new { request.Id });
            return user?.ToResponseDTO();
        }
    }
}
