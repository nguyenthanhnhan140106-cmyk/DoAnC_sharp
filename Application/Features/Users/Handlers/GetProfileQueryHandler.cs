using MediatR;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Application.DTOs;
using Application.Features.Users.Queries;
using Domain.Entities; // Needed for UserEntity temporarily or we can map directly

namespace Application.Features.Users.Handlers
{
    public class GetProfileQueryHandler : IRequestHandler<GetProfileQuery, UserResponseDTO?>
    {
        private readonly string _connectionString;

        public GetProfileQueryHandler(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException("DefaultConnection");
        }

        public async Task<UserResponseDTO?> Handle(GetProfileQuery request, CancellationToken cancellationToken)
        {
            using var conn = new SqlConnection(_connectionString);
            
            var query = @"
                SELECT 
                    u.Id, u.Username, u.Email, u.PasswordHash, u.AvatarUrl, u.CreatedAt,
                    (SELECT COUNT(*) FROM user_follows WHERE FollowedUserId = u.Id) as FollowersCount,
                    ((SELECT COUNT(*) FROM user_follows WHERE FollowerId = u.Id) + (SELECT COUNT(*) FROM follows WHERE UserId = u.Id)) as FollowingCount
                FROM users u
                WHERE u.Id = @Id";

            var user = await conn.QueryFirstOrDefaultAsync<UserEntity>(
                query,
                new { Id = request.Id }
            );

            return user?.ToResponseDTO();
        }
    }
}

