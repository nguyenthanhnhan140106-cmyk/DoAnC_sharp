using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Dapper;
using Microsoft.Data.SqlClient;

namespace Infrastructure.Repositories
{
    public class MediaShareRepository : IMediaShareRepository
    {
        private readonly string _connectionString;

        public MediaShareRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task<bool> InsertMediaShareAsync(MediaShare mediaShare)
        {
            using var conn = new SqlConnection(_connectionString);
            var sql = @"
                INSERT INTO media_shares (SenderId, ReceiverId, SongId, PlaylistId, SharedAt)
                VALUES (@SenderId, @ReceiverId, @SongId, @PlaylistId, GETDATE())";
            
            var rows = await conn.ExecuteAsync(sql, mediaShare);
            return rows > 0;
        }

        public async Task<IEnumerable<MediaShareDTO>> GetSharedWithMeAsync(int receiverId)
        {
            using var conn = new SqlConnection(_connectionString);
            var sql = @"
                SELECT ms.Id, ms.SenderId, ms.ReceiverId, ms.SongId, ms.PlaylistId, ms.SharedAt,
                       COALESCE(u.DisplayName, u.Username) as SenderName,
                       CASE 
                           WHEN ms.SongId IS NOT NULL THEN s.Title 
                           WHEN ms.PlaylistId IS NOT NULL THEN p.Name 
                       END as MediaTitle,
                       CASE 
                           WHEN ms.SongId IS NOT NULL THEN s.CoverUrl 
                           WHEN ms.PlaylistId IS NOT NULL THEN p.CoverUrl 
                       END as MediaCover,
                       CASE 
                           WHEN ms.SongId IS NOT NULL THEN 'song'
                           WHEN ms.PlaylistId IS NOT NULL THEN 'playlist'
                       END as MediaType
                FROM media_shares ms
                JOIN users u ON ms.SenderId = u.Id
                LEFT JOIN songs s ON ms.SongId = s.Id
                LEFT JOIN playlists p ON ms.PlaylistId = p.Id
                WHERE ms.ReceiverId = @ReceiverId
                ORDER BY ms.SharedAt DESC";
            
            return await conn.QueryAsync<MediaShareDTO>(sql, new { ReceiverId = receiverId });
        }

        public async Task<IEnumerable<MediaShareDTO>> GetSharedByMeAsync(int senderId)
        {
            using var conn = new SqlConnection(_connectionString);
            var sql = @"
                SELECT ms.Id, ms.SenderId, ms.ReceiverId, ms.SongId, ms.PlaylistId, ms.SharedAt,
                       COALESCE(u.DisplayName, u.Username) as ReceiverName,
                       CASE 
                           WHEN ms.SongId IS NOT NULL THEN s.Title 
                           WHEN ms.PlaylistId IS NOT NULL THEN p.Name 
                       END as MediaTitle,
                       CASE 
                           WHEN ms.SongId IS NOT NULL THEN s.CoverUrl 
                           WHEN ms.PlaylistId IS NOT NULL THEN p.CoverUrl 
                       END as MediaCover,
                       CASE 
                           WHEN ms.SongId IS NOT NULL THEN 'song'
                           WHEN ms.PlaylistId IS NOT NULL THEN 'playlist'
                       END as MediaType
                FROM media_shares ms
                JOIN users u ON ms.ReceiverId = u.Id
                LEFT JOIN songs s ON ms.SongId = s.Id
                LEFT JOIN playlists p ON ms.PlaylistId = p.Id
                WHERE ms.SenderId = @SenderId
                ORDER BY ms.SharedAt DESC";
            
            return await conn.QueryAsync<MediaShareDTO>(sql, new { SenderId = senderId });
        }

        public async Task<bool> IsAlreadySharedAsync(int senderId, int receiverId, int mediaId, string mediaType)
        {
            using var conn = new SqlConnection(_connectionString);
            var sql = mediaType == "song"
                ? "SELECT COUNT(1) FROM media_shares WHERE SenderId=@SenderId AND ReceiverId=@ReceiverId AND SongId=@MediaId"
                : "SELECT COUNT(1) FROM media_shares WHERE SenderId=@SenderId AND ReceiverId=@ReceiverId AND PlaylistId=@MediaId";
            
            var count = await conn.ExecuteScalarAsync<int>(sql, new { SenderId = senderId, ReceiverId = receiverId, MediaId = mediaId });
            return count > 0;
        }
    }
}
