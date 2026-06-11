using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Dapper;
using MySqlConnector;

namespace Infrastructure.Repositories
{
    public class HistoryRepository : IHistoryRepository
    {
        private readonly string _connectionString;

        public HistoryRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        private IDbConnection CreateConnection() => new MySqlConnection(_connectionString);

        public async Task AddToHistoryAsync(int userId, int songId)
        {
            try
            {
                using var connection = CreateConnection();
                const string query = @"
                    INSERT INTO user_history (UserId, SongId, PlayedAt)
                    VALUES (@UserId, @SongId, UTC_TIMESTAMP())";
                await connection.ExecuteAsync(query, new { UserId = userId, SongId = songId });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding to history: {ex}");
                throw;
            }
        }

        public async Task<IEnumerable<SongDTO>> GetRecentAsync(int userId, int limit = 10)
        {
            try
            {
                using var connection = CreateConnection();
                const string query = @"
                    SELECT s.*, 
                           COALESCE(a.WorldRank, 0) as WorldRank, 
                           COALESCE(a.Followers, 0) as Followers, 
                           COALESCE(a.MonthlyListeners, 0) as MonthlyListeners, 
                           a.Bio, 
                           COALESCE(a.IsVerified, 1) as IsVerified,
                           uh.LastPlayed as PlayedAt
                    FROM (
                        SELECT SongId, MAX(PlayedAt) as LastPlayed
                        FROM user_history
                        WHERE UserId = @UserId
                        GROUP BY SongId
                    ) uh
                    INNER JOIN songs s ON uh.SongId = s.Id
                    LEFT JOIN artists a ON s.ArtistId = a.Id
                    ORDER BY uh.LastPlayed DESC
                    LIMIT @Limit";
                    
                return await connection.QueryAsync<SongDTO>(query, new { UserId = userId, Limit = limit });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting recent songs: {ex}");
                throw;
            }
        }
    }
}
