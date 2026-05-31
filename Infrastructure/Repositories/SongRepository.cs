using System.Data;
using Application.Interfaces;
using Domain.Entities;
using Dapper;
using MySqlConnector;
using Microsoft.Extensions.Configuration;

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
            const string query = "SELECT * FROM songs";
            using var connection = CreateConnection();
            return await connection.QueryAsync<Song>(query);
        }

        public async Task<IEnumerable<Song>> GetByCategoryAsync(string category)
        {
            const string query = "SELECT * FROM songs WHERE Category = @Category";
            using var connection = CreateConnection();
            return await connection.QueryAsync<Song>(query, new { Category = category });
        }

        public async Task<Song?> GetByIdAsync(int id)
        {
            const string query = "SELECT * FROM songs WHERE Id = @Id";
            using var connection = CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<Song>(query, new { Id = id });
        }

        public async Task<int> CreateAsync(Song song)
        {
            // Thêm bài hát mới và lấy ngay ID tự động tăng (LAST_INSERT_ID) vừa tạo ra
            const string query = @"
                INSERT INTO songs (Title, Artist, CoverUrl, AudioUrl, Category, CreatedAt) 
                VALUES (@Title, @Artist, @CoverUrl, @AudioUrl, @Category, @CreatedAt);
                SELECT LAST_INSERT_ID();";

            using var connection = CreateConnection();
            return await connection.ExecuteScalarAsync<int>(query, song);
        }

        public async Task<bool> UpdateAsync(Song song)
        {
            const string query = @"
                UPDATE songs 
                SET Title = @Title, Artist = @Artist, CoverUrl = @CoverUrl, 
                    AudioUrl = @AudioUrl, Category = @Category 
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