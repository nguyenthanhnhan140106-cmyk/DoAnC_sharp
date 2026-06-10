using System.Text.Json;
using Application.DTOs;
using Dapper;
using MySqlConnector;

namespace Application.Services
{
    public class ShareMediaService
    {
        private readonly string _connectionString;

        public ShareMediaService(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task EnsureTablesAsync()
        {
            using var conn = new MySqlConnection(_connectionString);

            await conn.ExecuteAsync(@"
                CREATE TABLE IF NOT EXISTS media_shares (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    SenderId INT NOT NULL,
                    ReceiverId INT NOT NULL,
                    SongId INT NULL,
                    AlbumId INT NULL,
                    Message VARCHAR(500) NULL,
                    SharedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_media_shares_receiver (ReceiverId),
                    INDEX idx_media_shares_sender (SenderId),
                    INDEX idx_media_shares_song (SongId),
                    INDEX idx_media_shares_album (AlbumId)
                );");

            await conn.ExecuteAsync(@"
                CREATE TABLE IF NOT EXISTS notifications (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    UserId INT NOT NULL,
                    Type VARCHAR(50) NOT NULL,
                    Payload TEXT NOT NULL,
                    IsRead BOOLEAN NOT NULL DEFAULT FALSE,
                    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_notifications_user_read (UserId, IsRead),
                    INDEX idx_notifications_created (CreatedAt)
                );");
        }

        public async Task<MediaShareDTO> ShareAsync(ShareMediaRequestDTO dto)
        {
            if (dto.SenderId <= 0)
                throw new ArgumentException("SenderId không hợp lệ.");

            if (dto.ReceiverId <= 0)
                throw new ArgumentException("ReceiverId không hợp lệ.");

            if (dto.SenderId == dto.ReceiverId)
                throw new ArgumentException("Không thể chia sẻ cho chính mình.");

            var hasSong = dto.SongId.HasValue;
            var hasAlbum = dto.AlbumId.HasValue;

            if (hasSong == hasAlbum)
                throw new ArgumentException("Chỉ được chia sẻ 1 bài hát hoặc 1 album.");

            await EnsureTablesAsync();

            using var conn = new MySqlConnection(_connectionString);
            await conn.OpenAsync();
            using var tx = await conn.BeginTransactionAsync();

            try
            {
                var media = hasSong
                    ? await conn.QueryFirstOrDefaultAsync<MediaInfo>(@"
                        SELECT Id, Title, Artist, CoverUrl, 'song' AS MediaType
                        FROM songs
                        WHERE Id = @Id;",
                        new { Id = dto.SongId }, tx)
                    : await conn.QueryFirstOrDefaultAsync<MediaInfo>(@"
                        SELECT a.Id,
                               a.Title,
                               COALESCE(ar.Name, 'Various Artists') AS Artist,
                               a.CoverUrl,
                               'album' AS MediaType
                        FROM albums a
                        LEFT JOIN artists ar ON a.ArtistId = ar.Id
                        WHERE a.Id = @Id;",
                        new { Id = dto.AlbumId }, tx);

                if (media == null)
                    throw new ArgumentException("Không tìm thấy bài hát/album để chia sẻ.");

                var shareId = await conn.ExecuteScalarAsync<int>(@"
                    INSERT INTO media_shares (SenderId, ReceiverId, SongId, AlbumId, Message, SharedAt)
                    VALUES (@SenderId, @ReceiverId, @SongId, @AlbumId, @Message, NOW());
                    SELECT LAST_INSERT_ID();",
                    new
                    {
                        dto.SenderId,
                        dto.ReceiverId,
                        dto.SongId,
                        dto.AlbumId,
                        Message = string.IsNullOrWhiteSpace(dto.Message) ? null : dto.Message.Trim()
                    }, tx);

                var payload = JsonSerializer.Serialize(new
                {
                    shareId,
                    senderId = dto.SenderId,
                    senderName = $"User {dto.SenderId}",
                    receiverId = dto.ReceiverId,
                    songId = dto.SongId,
                    albumId = dto.AlbumId,
                    mediaType = media.MediaType,
                    title = media.Title,
                    artist = media.Artist,
                    coverUrl = media.CoverUrl,
                    message = string.IsNullOrWhiteSpace(dto.Message) ? null : dto.Message.Trim()
                });

                await conn.ExecuteAsync(@"
                    INSERT INTO notifications (UserId, Type, Payload, IsRead, CreatedAt)
                    VALUES (@UserId, 'media_share', @Payload, FALSE, NOW());",
                    new { UserId = dto.ReceiverId, Payload = payload }, tx);

                await tx.CommitAsync();

                return new MediaShareDTO
                {
                    Id = shareId,
                    SenderId = dto.SenderId,
                    SenderName = $"User {dto.SenderId}",
                    ReceiverId = dto.ReceiverId,
                    SongId = dto.SongId,
                    AlbumId = dto.AlbumId,
                    MediaType = media.MediaType,
                    Title = media.Title,
                    Artist = media.Artist,
                    CoverUrl = media.CoverUrl,
                    Message = string.IsNullOrWhiteSpace(dto.Message) ? null : dto.Message.Trim(),
                    SharedAt = DateTime.Now
                };
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<MediaShareDTO>> GetReceivedAsync(int userId)
        {
            await EnsureTablesAsync();

            using var conn = new MySqlConnection(_connectionString);
            return await conn.QueryAsync<MediaShareDTO>(@"
                SELECT ms.Id,
                       ms.SenderId,
                       CONCAT('User ', ms.SenderId) AS SenderName,
                       ms.ReceiverId,
                       ms.SongId,
                       ms.AlbumId,
                       CASE WHEN ms.SongId IS NOT NULL THEN 'song' ELSE 'album' END AS MediaType,
                       COALESCE(s.Title, a.Title, 'Unknown media') AS Title,
                       COALESCE(s.Artist, ar.Name, 'Unknown Artist') AS Artist,
                       COALESCE(s.CoverUrl, a.CoverUrl) AS CoverUrl,
                       ms.Message,
                       ms.SharedAt
                FROM media_shares ms
                LEFT JOIN songs s ON ms.SongId = s.Id
                LEFT JOIN albums a ON ms.AlbumId = a.Id
                LEFT JOIN artists ar ON a.ArtistId = ar.Id
                WHERE ms.ReceiverId = @UserId
                ORDER BY ms.SharedAt DESC, ms.Id DESC;",
                new { UserId = userId });
        }

        public async Task<MediaShareDTO?> GetByIdAsync(int id)
        {
            await EnsureTablesAsync();

            using var conn = new MySqlConnection(_connectionString);
            return await conn.QueryFirstOrDefaultAsync<MediaShareDTO>(@"
                SELECT ms.Id,
                       ms.SenderId,
                       CONCAT('User ', ms.SenderId) AS SenderName,
                       ms.ReceiverId,
                       ms.SongId,
                       ms.AlbumId,
                       CASE WHEN ms.SongId IS NOT NULL THEN 'song' ELSE 'album' END AS MediaType,
                       COALESCE(s.Title, a.Title, 'Unknown media') AS Title,
                       COALESCE(s.Artist, ar.Name, 'Unknown Artist') AS Artist,
                       COALESCE(s.CoverUrl, a.CoverUrl) AS CoverUrl,
                       ms.Message,
                       ms.SharedAt
                FROM media_shares ms
                LEFT JOIN songs s ON ms.SongId = s.Id
                LEFT JOIN albums a ON ms.AlbumId = a.Id
                LEFT JOIN artists ar ON a.ArtistId = ar.Id
                WHERE ms.Id = @Id;",
                new { Id = id });
        }

        private class MediaInfo
        {
            public int Id { get; set; }
            public string Title { get; set; } = string.Empty;
            public string Artist { get; set; } = string.Empty;
            public string? CoverUrl { get; set; }
            public string MediaType { get; set; } = string.Empty;
        }
    }
}
