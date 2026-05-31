using Application.Interfaces;
using Application.DTOs;
using Dapper;
using MySqlConnector;

namespace Application.Services
{
    public class PlaylistService : IPlaylistService
    {
        private readonly string _connectionString;

        public PlaylistService(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task<IEnumerable<PlaylistDTO>> GetAllPlaylistsAsync()
        {
            using var conn = new MySqlConnection(_connectionString);
            return await conn.QueryAsync<PlaylistDTO>(@"
                SELECT p.Id, p.Name, p.Description, p.UserId,
                       COALESCE(u.Username, 'Ẩn danh') AS CreatorName
                FROM playlists p
                LEFT JOIN users u ON p.UserId = u.Id"
            );
        }

        public async Task<IEnumerable<PlaylistDTO>> GetPlaylistsByUserIdAsync(int userId)
        {
            using var conn = new MySqlConnection(_connectionString);
            return await conn.QueryAsync<PlaylistDTO>(@"
                SELECT p.Id, p.Name, p.Description, p.UserId,
                       COALESCE(u.Username, 'Ẩn danh') AS CreatorName
                FROM playlists p
                LEFT JOIN users u ON p.UserId = u.Id
                WHERE p.UserId = @UserId",
                new { UserId = userId }
            );
        }
    }
}