using System.Data;
using Application.Interfaces;
using Domain.Entities;
using Dapper;
using MySqlConnector;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class SongRepository : ISongRepository
    {
        private readonly string _connectionString;

        public SongRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
        }

        private IDbConnection CreateConnection() => new MySqlConnection(_connectionString);

        public async Task<IEnumerable<Song>> GetAllSongsAsync()
        {
            // Sử dụng s.* đã tự động bốc được VideoUrl từ database lên Entity
            const string query = @"
                SELECT s.*, 
                       COALESCE(a.WorldRank, 0) as WorldRank, 
                       COALESCE(a.Followers, 0) as Followers, 
                       COALESCE(a.MonthlyListeners, 0) as MonthlyListeners, 
                       a.Bio, 
                       COALESCE(a.IsVerified, 1) as IsVerified
                FROM songs s
                LEFT JOIN artists a ON s.ArtistId = a.Id";

            using var connection = CreateConnection();
            return await connection.QueryAsync<Song>(query);
        }

        public async Task<IEnumerable<Song>> SearchAsync(string keyword)
        {
            const string query = @"
                SELECT s.*, 
                       COALESCE(a.WorldRank, 0) as WorldRank, 
                       COALESCE(a.Followers, 0) as Followers, 
                       COALESCE(a.MonthlyListeners, 0) as MonthlyListeners, 
                       a.Bio, 
                       COALESCE(a.IsVerified, 1) as IsVerified
                FROM songs s
                LEFT JOIN artists a ON s.ArtistId = a.Id
                WHERE s.Title LIKE CONCAT('%', @Keyword, '%') OR s.Artist LIKE CONCAT('%', @Keyword, '%')";

            using var connection = CreateConnection();
            return await connection.QueryAsync<Song>(query, new { Keyword = keyword });
        }

        public async Task<IEnumerable<Song>> GetByCategoryAsync(string category)
        {
            const string query = @"
                SELECT s.*, 
                       COALESCE(a.WorldRank, 0) as WorldRank, 
                       COALESCE(a.Followers, 0) as Followers, 
                       COALESCE(a.MonthlyListeners, 0) as MonthlyListeners, 
                       a.Bio, 
                       COALESCE(a.IsVerified, 1) as IsVerified
                FROM songs s
                LEFT JOIN artists a ON s.ArtistId = a.Id
                WHERE s.Category = @Category";

            using var connection = CreateConnection();
            return await connection.QueryAsync<Song>(query, new { Category = category });
        }

        public async Task<Song?> GetByIdAsync(int id)
        {
            const string query = @"
                SELECT s.*, 
                       COALESCE(a.WorldRank, 0) as WorldRank, 
                       COALESCE(a.Followers, 0) as Followers, 
                       COALESCE(a.MonthlyListeners, 0) as MonthlyListeners, 
                       a.Bio, 
                       COALESCE(a.IsVerified, 1) as IsVerified
                FROM songs s
                LEFT JOIN artists a ON s.ArtistId = a.Id
                WHERE s.Id = @Id";

            using var connection = CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<Song>(query, new { Id = id });
        }

        public async Task<IEnumerable<Song>> GetByArtistIdAsync(int artistId)
        {
            const string query = @"
                SELECT s.*, 
                       COALESCE(a.WorldRank, 0) as WorldRank, 
                       COALESCE(a.Followers, 0) as Followers, 
                       COALESCE(a.MonthlyListeners, 0) as MonthlyListeners, 
                       a.Bio, 
                       COALESCE(a.IsVerified, 1) as IsVerified
                FROM songs s
                LEFT JOIN artists a ON s.ArtistId = a.Id
                WHERE s.ArtistId = @ArtistId";

            using var connection = CreateConnection();
            return await connection.QueryAsync<Song>(query, new { ArtistId = artistId });
        }

        public async Task<int> CreateAsync(Song song)
        {
                        const string query = @"
                INSERT INTO songs (Title, Artist, CoverUrl, AudioUrl, VideoUrl, Category, LyricsUrl, ArtistBanner, ArtistId, CreatedAt) 
                VALUES (@Title, @Artist, @CoverUrl, @AudioUrl, @VideoUrl, @Category, @LyricsUrl, @ArtistBanner, @ArtistId, @CreatedAt);
                SELECT LAST_INSERT_ID();";


            using var connection = CreateConnection();
            return await connection.ExecuteScalarAsync<int>(query, song);
        }

        public async Task<bool> UpdateAsync(Song song)
        {
            // 自由 🟢 BỔ SUNG: Thêm việc cập nhật VideoUrl = @VideoUrl vào câu lệnh UPDATE
            const string query = @"
                UPDATE songs 
                SET Title = @Title, 
                    Artist = @Artist, 
                    CoverUrl = @CoverUrl, 
                    AudioUrl = @AudioUrl, 
                    VideoUrl = @VideoUrl,
                    Category = @Category,
                    LyricsUrl = @LyricsUrl,
                    ArtistBanner = @ArtistBanner,
                    ArtistId = @ArtistId
                WHERE Id = @Id";

            using var connection = CreateConnection();
            var rowsAffected = await connection.ExecuteAsync(query, song);
            return rowsAffected > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            const string query = "DELETE FROM songs WHERE Id = @Id";
            using var connection = CreateConnection();
            var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
            return rowsAffected > 0;
        }

        public async Task AddTagsToSongAsync(int songId, List<string> tags)
        {
            using var connection = CreateConnection();
            foreach (var tag in tags)
            {
                await connection.ExecuteAsync("INSERT IGNORE INTO media_tags (SongId, Tag) VALUES (@SongId, @Tag)", new { SongId = songId, Tag = tag });
            }
        }
    }
}