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

        public async Task<IEnumerable<UserDTO>> GetAllUsersAsync()
        {
            using var conn = new MySqlConnection(_connectionString);
            return await conn.QueryAsync<UserDTO>(
                "SELECT Id, Username, Email, Role FROM users"
            );
        }
    }
}