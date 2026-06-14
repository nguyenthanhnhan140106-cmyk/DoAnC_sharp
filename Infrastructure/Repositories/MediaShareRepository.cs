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
                       u.Username as SenderName,
                       s.Title as MediaTitle,
                       s.CoverUrl as MediaCover,
                       'song' as MediaType
                FROM media_shares ms
                JOIN users u ON ms.SenderId = u.Id
                LEFT JOIN songs s ON ms.SongId = s.Id
                WHERE ms.ReceiverId = @ReceiverId
                ORDER BY ms.SharedAt DESC";
            
            return await conn.QueryAsync<MediaShareDTO>(sql, new { ReceiverId = receiverId });
        }
    }
}
