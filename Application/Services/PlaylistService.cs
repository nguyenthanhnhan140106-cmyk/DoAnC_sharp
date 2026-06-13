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
                SELECT p.Id, p.Name, p.Description, p.CoverUrl, p.CreatedAt, p.UserId,
                       COALESCE(u.Username, 'Ẩn danh') AS CreatorName
                FROM playlists p
                LEFT JOIN users u ON p.UserId = u.Id"
            );
        }

        public async Task<IEnumerable<PlaylistDTO>> GetPlaylistsByUserIdAsync(int userId)
        {
            using var conn = new MySqlConnection(_connectionString);
            return await conn.QueryAsync<PlaylistDTO>(@"
                SELECT p.Id, p.Name, p.Description, p.CoverUrl, p.CreatedAt, p.UserId,
                       COALESCE(u.Username, 'Ẩn danh') AS CreatorName
                FROM playlists p
                LEFT JOIN users u ON p.UserId = u.Id
                WHERE p.UserId = @UserId",
                new { UserId = userId }
            );
        }

        public async Task<PlaylistDTO> CreatePlaylistAsync(int userId, CreatePlaylistDTO dto)
        {
            using var conn = new MySqlConnection(_connectionString);
            var sql = @"
                INSERT INTO playlists (Name, Description, CoverUrl, UserId, CreatedAt)
                VALUES (@Name, @Description, @CoverUrl, @UserId, NOW());
                SELECT LAST_INSERT_ID();";
            
            var id = await conn.ExecuteScalarAsync<int>(sql, new {
                dto.Name,
                dto.Description,
                dto.CoverUrl,
                UserId = userId
            });

            return await GetPlaylistByIdAsync(id) ?? throw new Exception("Tạo Playlist thất bại");
        }

        public async Task<PlaylistDTO?> GetPlaylistByIdAsync(int id)
        {
            using var conn = new MySqlConnection(_connectionString);
            var playlist = await conn.QueryFirstOrDefaultAsync<PlaylistDTO>(@"
                SELECT p.Id, p.Name, p.Description, p.CoverUrl, p.CreatedAt, p.UserId,
                       COALESCE(u.Username, 'Ẩn danh') AS CreatorName
                FROM playlists p
                LEFT JOIN users u ON p.UserId = u.Id
                WHERE p.Id = @Id", new { Id = id });

            if (playlist == null) return null;

            var songs = await conn.QueryAsync<SongDTO>(@"
                SELECT s.Id, s.Title, s.Artist, s.CoverUrl, s.AudioUrl, s.VideoUrl, s.CategoryId, c.Name as CategoryName, s.ArtistBanner, s.ArtistId, ps.AddedAt
                FROM songs s
                JOIN playlist_songs ps ON s.Id = ps.SongId
                LEFT JOIN categories c ON s.CategoryId = c.Id
                WHERE ps.PlaylistId = @PlaylistId
                ORDER BY ps.AddedAt ASC", new { PlaylistId = id });

            playlist.Songs = songs.ToList();
            return playlist;
        }

        public async Task<bool> AddSongToPlaylistAsync(int playlistId, int songId)
        {
            using var conn = new MySqlConnection(_connectionString);
            try
            {
                var sql = @"
                    INSERT IGNORE INTO playlist_songs (PlaylistId, SongId, AddedAt) VALUES (@PlaylistId, @SongId, NOW());
                    UPDATE playlists p 
                    JOIN songs s ON s.Id = @SongId 
                    SET p.CoverUrl = s.CoverUrl 
                    WHERE p.Id = @PlaylistId;";
                var rows = await conn.ExecuteAsync(sql, new { PlaylistId = playlistId, SongId = songId });
                return rows > 0;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeletePlaylistAsync(int id)
        {
            using var conn = new MySqlConnection(_connectionString);
            
            try 
            {
                await conn.ExecuteAsync("DELETE FROM playlist_songs WHERE PlaylistId = @Id", new { Id = id });
                var rows = await conn.ExecuteAsync("DELETE FROM playlists WHERE Id = @Id", new { Id = id });
                return rows > 0;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> RemoveSongFromPlaylistAsync(int playlistId, int songId)
        {
            using var conn = new MySqlConnection(_connectionString);
            try
            {
                var sql = "DELETE FROM playlist_songs WHERE PlaylistId = @PlaylistId AND SongId = @SongId";
                var rows = await conn.ExecuteAsync(sql, new { PlaylistId = playlistId, SongId = songId });
                
                // Cập nhật lại CoverUrl nếu cần
                var remainingSongs = await conn.QueryAsync<int>("SELECT SongId FROM playlist_songs WHERE PlaylistId = @PlaylistId LIMIT 1", new { PlaylistId = playlistId });
                if (!remainingSongs.Any()) {
                    await conn.ExecuteAsync("UPDATE playlists SET CoverUrl = NULL WHERE Id = @PlaylistId", new { PlaylistId = playlistId });
                } else {
                    await conn.ExecuteAsync(@"
                        UPDATE playlists p 
                        JOIN songs s ON s.Id = @RemainingSongId 
                        SET p.CoverUrl = s.CoverUrl 
                        WHERE p.Id = @PlaylistId", 
                        new { PlaylistId = playlistId, RemainingSongId = remainingSongs.First() }
                    );
                }
                
                return rows > 0;
            }
            catch
            {
                return false;
            }
        }

        public async Task<IEnumerable<int>> GetPlaylistsContainingSongAsync(int userId, int songId)
        {
            using var conn = new MySqlConnection(_connectionString);
            var sql = @"
                SELECT ps.PlaylistId 
                FROM playlist_songs ps
                JOIN playlists p ON ps.PlaylistId = p.Id
                WHERE p.UserId = @UserId AND ps.SongId = @SongId";
            return await conn.QueryAsync<int>(sql, new { UserId = userId, SongId = songId });
        }
    }
}