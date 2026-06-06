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
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        private IDbConnection CreateConnection() => new MySqlConnection(_connectionString);

        public async Task<IEnumerable<Song>> GetAllSongsAsync()
        {
            // 🟢 Thay thế bằng LEFT JOIN để bốc toàn bộ thông tin nghệ sĩ thật lên một lần
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
            // 🟢 Đảm bảo các bài hát lấy theo danh mục (friday, vsound, rap) cũng được JOIN thông tin nghệ sĩ
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
            // 🟢 Lấy chi tiết một bài hát theo ID cũng kèm theo dữ liệu nghệ sĩ thật
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

        public async Task<int> CreateAsync(Song song)
        {
            // 🟢 Bổ sung thêm cột ArtistBanner và ArtistId vào lệnh INSERT để khớp với database mới
            const string query = @"
                INSERT INTO songs (Title, Artist, CoverUrl, AudioUrl, Category, ArtistBanner, ArtistId, CreatedAt) 
                VALUES (@Title, @Artist, @CoverUrl, @AudioUrl, @Category, @ArtistBanner, @ArtistId, @CreatedAt);
                SELECT LAST_INSERT_ID();";

            using var connection = CreateConnection();
            return await connection.ExecuteScalarAsync<int>(query, song);
        }

        public async Task<bool> UpdateAsync(Song song)
        {
            // 🟢 Bổ sung thêm việc cập nhật ArtistBanner và ArtistId khi có chỉnh sửa bài hát
            const string query = @"
                UPDATE songs 
                SET Title = @Title, 
                    Artist = @Artist, 
                    CoverUrl = @CoverUrl, 
                    AudioUrl = @AudioUrl, 
                    Category = @Category,
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
    }
}