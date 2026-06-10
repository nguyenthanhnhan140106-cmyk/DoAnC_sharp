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

        public async Task<(MediaShareResponseDTO Share, NotificationDTO Notification)> ShareAsync(int senderUserId, ShareMediaRequestDTO dto)
        {
            ValidateRequest(senderUserId, dto);

            using var conn = new MySqlConnection(_connectionString);
            await conn.OpenAsync();
            using var tx = await conn.BeginTransactionAsync();

            var sender = await conn.QuerySingleOrDefaultAsync<ShareUserDTO>(
                "SELECT Id, Username, Email FROM users WHERE Id = @Id;",
                new { Id = senderUserId }, tx);

            if (sender == null)
                throw new ArgumentException("Không tìm thấy tài khoản người gửi. Bạn hãy đăng nhập lại.");

            var receiver = await conn.QuerySingleOrDefaultAsync<ShareUserDTO>(
                "SELECT Id, Username, Email FROM users WHERE Id = @Id;",
                new { Id = dto.ReceiverUserId }, tx);

            if (receiver == null)
                throw new ArgumentException("Người nhận không tồn tại trong hệ thống.");

            string mediaType;
            string mediaTitle;
            string? artist = null;
            string? coverUrl = null;

            if (dto.SongId.HasValue)
            {
                var song = await conn.QuerySingleOrDefaultAsync<dynamic>(@"
                    SELECT Id, Title, Artist, CoverUrl
                    FROM songs
                    WHERE Id = @SongId;",
                    new { dto.SongId }, tx);

                if (song == null)
                    throw new ArgumentException("Bài hát/video không tồn tại.");

                mediaType = "song";
                mediaTitle = song.Title;
                artist = song.Artist;
                coverUrl = song.CoverUrl;
            }
            else
            {
                var playlist = await conn.QuerySingleOrDefaultAsync<dynamic>(@"
                    SELECT Id, Name
                    FROM playlists
                    WHERE Id = @PlaylistId;",
                    new { dto.PlaylistId }, tx);

                if (playlist == null)
                    throw new ArgumentException("Playlist không tồn tại.");

                mediaType = "playlist";
                mediaTitle = playlist.Name;
            }

            var shareId = await conn.ExecuteScalarAsync<int>(@"
                INSERT INTO media_shares
                    (SenderUserId, ReceiverUserId, SongId, PlaylistId, Message, SharedAt)
                VALUES
                    (@SenderUserId, @ReceiverUserId, @SongId, @PlaylistId, @Message, NOW());
                SELECT LAST_INSERT_ID();",
                new
                {
                    SenderUserId = senderUserId,
                    dto.ReceiverUserId,
                    dto.SongId,
                    dto.PlaylistId,
                    Message = string.IsNullOrWhiteSpace(dto.Message) ? null : dto.Message.Trim()
                }, tx);

            var payload = JsonSerializer.Serialize(new
            {
                shareId,
                senderUserId,
                senderUsername = sender.Username,
                receiverUserId = receiver.Id,
                mediaType,
                songId = dto.SongId,
                playlistId = dto.PlaylistId,
                mediaTitle,
                artist,
                coverUrl,
                message = dto.Message
            });

            var notificationTitle = "Bạn có chia sẻ mới";
            var notificationMessage = $"{sender.Username} đã chia sẻ {mediaTitle} cho bạn.";

            var notificationId = await conn.ExecuteScalarAsync<int>(@"
                INSERT INTO notifications
                    (UserId, Type, Title, Message, Payload, IsRead, CreatedAt)
                VALUES
                    (@UserId, @Type, @Title, @Message, @Payload, 0, NOW());
                SELECT LAST_INSERT_ID();",
                new
                {
                    UserId = dto.ReceiverUserId,
                    Type = "media_share",
                    Title = notificationTitle,
                    Message = notificationMessage,
                    Payload = payload
                }, tx);

            await tx.CommitAsync();

            var share = new MediaShareResponseDTO
            {
                Id = shareId,
                SenderUserId = senderUserId,
                SenderUsername = sender.Username,
                ReceiverUserId = receiver.Id,
                ReceiverUsername = receiver.Username,
                SongId = dto.SongId,
                PlaylistId = dto.PlaylistId,
                MediaType = mediaType,
                MediaTitle = mediaTitle,
                Artist = artist,
                CoverUrl = coverUrl,
                Message = string.IsNullOrWhiteSpace(dto.Message) ? null : dto.Message.Trim(),
                SharedAt = DateTime.Now
            };

            var notification = new NotificationDTO
            {
                Id = notificationId,
                UserId = dto.ReceiverUserId,
                Type = "media_share",
                Title = notificationTitle,
                Message = notificationMessage,
                Payload = payload,
                IsRead = false,
                CreatedAt = DateTime.Now
            };

            return (share, notification);
        }

        public async Task<IEnumerable<MediaShareResponseDTO>> GetReceivedAsync(int userId)
        {
            using var conn = new MySqlConnection(_connectionString);

            return await conn.QueryAsync<MediaShareResponseDTO>(@"
                SELECT
                    ms.Id,
                    ms.SenderUserId,
                    sender.Username AS SenderUsername,
                    ms.ReceiverUserId,
                    receiver.Username AS ReceiverUsername,
                    ms.SongId,
                    ms.PlaylistId,
                    CASE WHEN ms.SongId IS NOT NULL THEN 'song' ELSE 'playlist' END AS MediaType,
                    COALESCE(s.Title, p.Name, 'Không rõ') AS MediaTitle,
                    s.Artist,
                    s.CoverUrl,
                    ms.Message,
                    ms.SharedAt
                FROM media_shares ms
                INNER JOIN users sender ON sender.Id = ms.SenderUserId
                INNER JOIN users receiver ON receiver.Id = ms.ReceiverUserId
                LEFT JOIN songs s ON s.Id = ms.SongId
                LEFT JOIN playlists p ON p.Id = ms.PlaylistId
                WHERE ms.ReceiverUserId = @UserId
                ORDER BY ms.SharedAt DESC, ms.Id DESC;",
                new { UserId = userId });
        }

        public async Task<IEnumerable<MediaShareResponseDTO>> GetSentAsync(int userId)
        {
            using var conn = new MySqlConnection(_connectionString);

            return await conn.QueryAsync<MediaShareResponseDTO>(@"
                SELECT
                    ms.Id,
                    ms.SenderUserId,
                    sender.Username AS SenderUsername,
                    ms.ReceiverUserId,
                    receiver.Username AS ReceiverUsername,
                    ms.SongId,
                    ms.PlaylistId,
                    CASE WHEN ms.SongId IS NOT NULL THEN 'song' ELSE 'playlist' END AS MediaType,
                    COALESCE(s.Title, p.Name, 'Không rõ') AS MediaTitle,
                    s.Artist,
                    s.CoverUrl,
                    ms.Message,
                    ms.SharedAt
                FROM media_shares ms
                INNER JOIN users sender ON sender.Id = ms.SenderUserId
                INNER JOIN users receiver ON receiver.Id = ms.ReceiverUserId
                LEFT JOIN songs s ON s.Id = ms.SongId
                LEFT JOIN playlists p ON p.Id = ms.PlaylistId
                WHERE ms.SenderUserId = @UserId
                ORDER BY ms.SharedAt DESC, ms.Id DESC;",
                new { UserId = userId });
        }

        private static void ValidateRequest(int senderUserId, ShareMediaRequestDTO dto)
        {
            if (dto == null)
                throw new ArgumentException("Dữ liệu chia sẻ không hợp lệ.");

            if (senderUserId <= 0)
                throw new ArgumentException("Bạn cần đăng nhập trước khi chia sẻ.");

            if (dto.ReceiverUserId <= 0)
                throw new ArgumentException("Bạn cần chọn người nhận.");

            if (senderUserId == dto.ReceiverUserId)
                throw new ArgumentException("Không thể chia sẻ cho chính mình.");

            var hasSong = dto.SongId.HasValue && dto.SongId.Value > 0;
            var hasPlaylist = dto.PlaylistId.HasValue && dto.PlaylistId.Value > 0;

            if (hasSong == hasPlaylist)
                throw new ArgumentException("Chỉ được chọn một loại media: bài hát/video hoặc playlist.");
        }
    }
}
