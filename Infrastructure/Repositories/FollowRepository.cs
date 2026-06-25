using Application.DTOs;
using Application.Interfaces;
using Dapper;
using Domain.Entities;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Repositories
{
    public class FollowRepository : IFollowRepository
    {
        private readonly string _connectionString;

        public FollowRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
        }

        private SqlConnection CreateConnection() => new SqlConnection(_connectionString);

        public async Task FollowAsync(int userId, int artistId)
        {
            using var conn = CreateConnection();
            await conn.ExecuteAsync(
                "IF NOT EXISTS (SELECT 1 FROM follows WHERE UserId = @UserId AND ArtistId = @ArtistId) " +
                "BEGIN " +
                "    INSERT INTO follows (UserId, ArtistId) VALUES (@UserId, @ArtistId); " +
                "    UPDATE artists SET Followers = Followers + 1 WHERE Id = @ArtistId; " +
                "END",
                new { UserId = userId, ArtistId = artistId });
        }

        public async Task UnfollowAsync(int userId, int artistId)
        {
            using var conn = CreateConnection();
            await conn.ExecuteAsync(
                "DELETE FROM follows WHERE UserId = @UserId AND ArtistId = @ArtistId; " +
                "UPDATE artists SET Followers = CASE WHEN Followers > 0 THEN Followers - 1 ELSE 0 END WHERE Id = @ArtistId;",
                new { UserId = userId, ArtistId = artistId });
        }

        public async Task<bool> IsFollowingAsync(int userId, int artistId)
        {
            using var conn = CreateConnection();
            var count = await conn.ExecuteScalarAsync<int>(
                "SELECT COUNT(*) FROM follows WHERE UserId = @UserId AND ArtistId = @ArtistId",
                new { UserId = userId, ArtistId = artistId });
            return count > 0;
        }

        public async Task<IEnumerable<FollowedArtistDTO>> GetFollowedArtistsAsync(int userId)
        {
            using var conn = CreateConnection();
            
            const string sql = @"
                SELECT 
                    a.Id AS ArtistId,
                    a.Name,
                    (SELECT TOP 1 s.CoverUrl FROM songs s WHERE s.ArtistId = a.Id ORDER BY s.CreatedAt DESC) AS CoverUrl
                FROM follows f
                INNER JOIN artists a ON f.ArtistId = a.Id
                WHERE f.UserId = @UserId
                ORDER BY f.CreatedAt DESC";
            return await conn.QueryAsync<FollowedArtistDTO>(sql, new { UserId = userId });
        }

        public async Task FollowUserAsync(int followerId, int followedUserId)
        {
            using var conn = CreateConnection();
            await conn.ExecuteAsync(
                "IF NOT EXISTS (SELECT 1 FROM user_follows WHERE FollowerId = @FollowerId AND FollowedUserId = @FollowedUserId) " +
                "BEGIN " +
                "    INSERT INTO user_follows (FollowerId, FollowedUserId) VALUES (@FollowerId, @FollowedUserId); " +
                "END",
                new { FollowerId = followerId, FollowedUserId = followedUserId });
        }

        public async Task UnfollowUserAsync(int followerId, int followedUserId)
        {
            using var conn = CreateConnection();
            await conn.ExecuteAsync(
                "DELETE FROM user_follows WHERE FollowerId = @FollowerId AND FollowedUserId = @FollowedUserId",
                new { FollowerId = followerId, FollowedUserId = followedUserId });
        }

        public async Task<bool> IsFollowingUserAsync(int followerId, int followedUserId)
        {
            using var conn = CreateConnection();
            var count = await conn.ExecuteScalarAsync<int>(
                "SELECT COUNT(*) FROM user_follows WHERE FollowerId = @FollowerId AND FollowedUserId = @FollowedUserId",
                new { FollowerId = followerId, FollowedUserId = followedUserId });
            return count > 0;
        }

        public async Task<IEnumerable<UserFollowDTO>> GetFollowingUsersAsync(int userId)
        {
            using var conn = CreateConnection();
            const string sql = @"
                SELECT 
                    u.Id AS UserId,
                    u.Username,
                    u.AvatarUrl
                FROM user_follows uf
                INNER JOIN users u ON uf.FollowedUserId = u.Id
                WHERE uf.FollowerId = @UserId
                ORDER BY uf.CreatedAt DESC";
            return await conn.QueryAsync<UserFollowDTO>(sql, new { UserId = userId });
        }

        public async Task<IEnumerable<UserFollowDTO>> GetFollowersAsync(int userId)
        {
            using var conn = CreateConnection();
            const string sql = @"
                SELECT 
                    u.Id AS UserId,
                    u.Username,
                    u.AvatarUrl
                FROM user_follows uf
                INNER JOIN users u ON uf.FollowerId = u.Id
                WHERE uf.FollowedUserId = @UserId
                ORDER BY uf.CreatedAt DESC";
            return await conn.QueryAsync<UserFollowDTO>(sql, new { UserId = userId });
        }
    }
}

