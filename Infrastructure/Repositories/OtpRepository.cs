using Application.Interfaces;
using Domain.Entities;
using MySqlConnector;
using Dapper;
using System.Data;

namespace Infrastructure.Repositories
{
    public class OtpRepository : IOtpRepository
    {
        private readonly string _connectionString;

        public OtpRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        private IDbConnection Connection => new MySqlConnection(_connectionString);

        public async Task DeleteExistingOtps(string email)
        {
            using var conn = Connection;
            await conn.ExecuteAsync("DELETE FROM user_otps WHERE Email = @Email", new { Email = email });
        }

        public async Task AddOtp(UserOtp userOtp)
        {
            using var conn = Connection;
            await conn.ExecuteAsync(
                "INSERT INTO user_otps (Email, OtpCode, ExpiryTime, IsUsed) VALUES (@Email, @OtpCode, @ExpiryTime, @IsUsed)", 
                userOtp);
        }

        public async Task<UserOtp?> GetValidOtp(string email)
        {
            using var conn = Connection;
            return await conn.QueryFirstOrDefaultAsync<UserOtp>(
                "SELECT * FROM user_otps WHERE Email = @Email AND IsUsed = 0 AND ExpiryTime > UTC_TIMESTAMP ORDER BY ExpiryTime DESC LIMIT 1", 
                new { Email = email });
        }

        public async Task UpdateOtp(UserOtp userOtp)
        {
            using var conn = Connection;
            await conn.ExecuteAsync("UPDATE user_otps SET IsUsed = @IsUsed WHERE Id = @Id", userOtp);
        }
    }
}
