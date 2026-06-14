using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Dapper;
using Microsoft.Data.SqlClient;

namespace Infrastructure.Repositories
{
    public class HistoryRepository : IHistoryRepository
    {
        private readonly string _connectionString;

        public HistoryRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        public async Task AddToHistoryAsync(int userId, int songId)
        {
            try
            {
                using var connection = CreateConnection();
                const string query = @"
                    INSERT INTO play_histories (UserId, SongId, PlayedAt)
                    VALUES (@UserId, @SongId, GETUTCDATE())";
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
                    SELECT TOP (@Limit) s.*, 
                           COALESCE(a.WorldRank, 0) as WorldRank, 
                           COALESCE(a.Followers, 0) as Followers, 
                           COALESCE(a.MonthlyListeners, 0) as MonthlyListeners, 
                           a.Bio, 
                           COALESCE(a.IsVerified, 1) as IsVerified,
                           uh.LastPlayed as PlayedAt,
                           al.Id as AlbumId,
                           al.Title as AlbumName
                    FROM (
                        SELECT SongId, MAX(PlayedAt) as LastPlayed
                        FROM play_histories
                        WHERE UserId = @UserId
                        GROUP BY SongId
                    ) uh
                    INNER JOIN songs s ON uh.SongId = s.Id
                    LEFT JOIN artists a ON s.ArtistId = a.Id
                    LEFT JOIN (
                        SELECT SongId, MIN(AlbumId) as MinAlbumId
                        FROM album_songs
                        GROUP BY SongId
                    ) als ON s.Id = als.SongId
                    LEFT JOIN albums al ON als.MinAlbumId = al.Id
                    ORDER BY uh.LastPlayed DESC
                    ";
                    
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


