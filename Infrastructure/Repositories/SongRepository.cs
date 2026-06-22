using System.Data;
using Application.Interfaces;
using Domain.Entities;
using Dapper;
using Microsoft.Data.SqlClient;
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

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        public async Task<IEnumerable<Song>> GetAllSongsAsync()
        {
            // Sử dụng s.* đã tự động bốc được VideoUrl từ database lên Entity
            const string query = @"
                SELECT s.*, 
                       c.Name as CategoryName,
                       COALESCE(a.WorldRank, 0) as WorldRank, 
                       COALESCE(a.Followers, 0) as Followers, 
                       COALESCE(a.MonthlyListeners, 0) as MonthlyListeners, 
                       a.Bio, 
                       COALESCE(a.IsVerified, 1) as IsVerified
                FROM songs s
                LEFT JOIN artists a ON s.ArtistId = a.Id
                LEFT JOIN categories c ON s.CategoryId = c.Id";

            using var connection = CreateConnection();
            return await connection.QueryAsync<Song>(query);
        }

        public async Task<IEnumerable<Song>> SearchAsync(string keyword)
        {
            const string query = @"
                SELECT s.*, 
                       c.Name as CategoryName,
                       COALESCE(a.WorldRank, 0) as WorldRank, 
                       COALESCE(a.Followers, 0) as Followers, 
                       COALESCE(a.MonthlyListeners, 0) as MonthlyListeners, 
                       a.Bio, 
                       COALESCE(a.IsVerified, 1) as IsVerified
                FROM songs s
                LEFT JOIN artists a ON s.ArtistId = a.Id
                LEFT JOIN categories c ON s.CategoryId = c.Id
                WHERE s.Title LIKE CONCAT('%', @Keyword, '%') OR s.Artist LIKE CONCAT('%', @Keyword, '%')";

            using var connection = CreateConnection();
            return await connection.QueryAsync<Song>(query, new { Keyword = keyword });
        }

        public async Task<IEnumerable<Song>> GetByCategoryAsync(string category)
        {
            const string query = @"
                SELECT s.*, 
                       c.Name as CategoryName,
                       COALESCE(a.WorldRank, 0) as WorldRank, 
                       COALESCE(a.Followers, 0) as Followers, 
                       COALESCE(a.MonthlyListeners, 0) as MonthlyListeners, 
                       a.Bio, 
                       COALESCE(a.IsVerified, 1) as IsVerified
                FROM songs s
                LEFT JOIN artists a ON s.ArtistId = a.Id
                LEFT JOIN categories c ON s.CategoryId = c.Id
                WHERE c.Slug = @Category OR c.Name = @Category";

            using var connection = CreateConnection();
            return await connection.QueryAsync<Song>(query, new { Category = category });
        }

        public async Task<Song?> GetByIdAsync(int id)
        {
            const string query = @"
                SELECT s.*, 
                       c.Name as CategoryName,
                       COALESCE(a.WorldRank, 0) as WorldRank, 
                       COALESCE(a.Followers, 0) as Followers, 
                       COALESCE(a.MonthlyListeners, 0) as MonthlyListeners, 
                       a.Bio, 
                       COALESCE(a.IsVerified, 1) as IsVerified
                FROM songs s
                LEFT JOIN artists a ON s.ArtistId = a.Id
                LEFT JOIN categories c ON s.CategoryId = c.Id
                WHERE s.Id = @Id";

            using var connection = CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<Song>(query, new { Id = id });
        }

        public async Task<IEnumerable<Song>> GetByArtistIdAsync(int artistId)
        {
            using var connection = CreateConnection();
            var artistName = await connection.QueryFirstOrDefaultAsync<string>("SELECT Name FROM artists WHERE Id = @Id", new { Id = artistId });

            const string query = @"
                SELECT s.*, 
                       c.Name as CategoryName,
                       COALESCE(a.WorldRank, 0) as WorldRank, 
                       COALESCE(a.Followers, 0) as Followers, 
                       COALESCE(a.MonthlyListeners, 0) as MonthlyListeners, 
                       a.Bio, 
                       COALESCE(a.IsVerified, 1) as IsVerified
                FROM songs s
                LEFT JOIN artists a ON s.ArtistId = a.Id
                LEFT JOIN categories c ON s.CategoryId = c.Id
                WHERE s.ArtistId = @ArtistId OR (s.Artist LIKE CONCAT('%', @ArtistName, '%') AND @ArtistName IS NOT NULL AND @ArtistName <> '')";

            return await connection.QueryAsync<Song>(query, new { ArtistId = artistId, ArtistName = artistName });
        }

        public async Task<IEnumerable<Song>> GetByUploaderIdAsync(int uploaderId)
        {
            const string query = @"
                SELECT s.*, 
                       c.Name as CategoryName,
                       COALESCE(a.WorldRank, 0) as WorldRank, 
                       COALESCE(a.Followers, 0) as Followers, 
                       COALESCE(a.MonthlyListeners, 0) as MonthlyListeners, 
                       a.Bio, 
                       COALESCE(a.IsVerified, 1) as IsVerified
                FROM songs s
                LEFT JOIN artists a ON s.ArtistId = a.Id
                LEFT JOIN categories c ON s.CategoryId = c.Id
                WHERE s.UploaderId = @UploaderId";

            using var connection = CreateConnection();
            return await connection.QueryAsync<Song>(query, new { UploaderId = uploaderId });
        }

        public async Task<int> CreateAsync(Song song)
        {
                        const string query = @"
                INSERT INTO songs (Title, Artist, CoverUrl, AudioUrl, VideoUrl, CategoryId, LyricsUrl, ArtistBanner, ArtistId, UploaderId, CreatedAt) 
                VALUES (@Title, @Artist, @CoverUrl, @AudioUrl, @VideoUrl, @CategoryId, @LyricsUrl, @ArtistBanner, @ArtistId, @UploaderId, @CreatedAt);
                SELECT SCOPE_IDENTITY();";


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
                    CategoryId = @CategoryId,
                    LyricsUrl = @LyricsUrl,
                    ArtistBanner = @ArtistBanner,
                    ArtistId = @ArtistId,
                    UploaderId = @UploaderId
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
                await connection.ExecuteAsync("IF NOT EXISTS (SELECT 1 FROM media_tags WHERE SongId = @SongId AND Tag = @Tag) INSERT INTO media_tags (SongId, Tag) VALUES (@SongId, @Tag)", new { SongId = songId, Tag = tag });
            }
        }
    }
}

