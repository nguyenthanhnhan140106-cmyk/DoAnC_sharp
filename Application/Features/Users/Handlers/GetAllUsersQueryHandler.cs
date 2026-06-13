using MediatR;
using Dapper;
using MySqlConnector;
using Microsoft.Extensions.Configuration;
using Application.DTOs;
using Application.Features.Users.Queries;
using Domain.Entities;

namespace Application.Features.Users.Handlers
{
    public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, IEnumerable<UserResponseDTO>>
    {
        private readonly string _connectionString;

        public GetAllUsersQueryHandler(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException("DefaultConnection");
        }

        public async Task<IEnumerable<UserResponseDTO>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
        {
            using var conn = new MySqlConnection(_connectionString);
            
            var users = await conn.QueryAsync<UserEntity>(
                "SELECT Id, Username, Email, PasswordHash, AvatarUrl, CreatedAt FROM users"
            );

            return users.Select(u => u.ToResponseDTO());
        }
    }
}
