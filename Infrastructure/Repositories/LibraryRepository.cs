using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Dapper;
using Microsoft.Data.SqlClient;

namespace Infrastructure.Repositories
{
    public class LibraryRepository : ILibraryRepository
    {
        private readonly string _connectionString;

        public LibraryRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task SaveAlbumAsync(int userId, int albumId)
        {
            using var conn = new SqlConnection(_connectionString);
            const string sql = @"
                IF NOT EXISTS (SELECT 1 FROM user_saved_albums WHERE UserId = @UserId AND AlbumId = @AlbumId)
                BEGIN
                    INSERT INTO user_saved_albums (UserId, AlbumId, SavedAt)
                    VALUES (@UserId, @AlbumId, GETUTCDATE())
                END";
            await conn.ExecuteAsync(sql, new { UserId = userId, AlbumId = albumId });
        }

        public async Task RemoveAlbumAsync(int userId, int albumId)
        {
            using var conn = new SqlConnection(_connectionString);
            const string sql = @"
                DELETE FROM user_saved_albums
                WHERE UserId = @UserId AND AlbumId = @AlbumId";
            await conn.ExecuteAsync(sql, new { UserId = userId, AlbumId = albumId });
        }

        public async Task<bool> IsAlbumSavedAsync(int userId, int albumId)
        {
            using var conn = new SqlConnection(_connectionString);
            const string sql = @"
                SELECT COUNT(1) FROM user_saved_albums
                WHERE UserId = @UserId AND AlbumId = @AlbumId";
            var count = await conn.ExecuteScalarAsync<int>(sql, new { UserId = userId, AlbumId = albumId });
            return count > 0;
        }

        public async Task<IEnumerable<AlbumDTO>> GetSavedAlbumsAsync(int userId)
        {
            using var conn = new SqlConnection(_connectionString);
            const string sql = @"
                SELECT a.Id, a.Title, a.CoverUrl,
                       COALESCE(art.Name, 'Various Artists') AS ArtistName
                FROM user_saved_albums usa
                INNER JOIN albums a ON usa.AlbumId = a.Id
                LEFT JOIN artists art ON a.ArtistId = art.Id
                WHERE usa.UserId = @UserId
                ORDER BY usa.SavedAt DESC";
            return await conn.QueryAsync<AlbumDTO>(sql, new { UserId = userId });
        }
    }
}

