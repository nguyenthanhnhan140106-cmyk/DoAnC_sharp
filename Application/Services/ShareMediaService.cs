using Application.DTOs;
using Dapper;
using MySqlConnector;

namespace Application.Services;

public class ShareMediaService
{
    private readonly string _connectionString;
    private readonly NotificationService _notificationService;

    public ShareMediaService(string connectionString, NotificationService notificationService)
    {
        _connectionString = connectionString;
        _notificationService = notificationService;
    }

    public async Task<MediaShareDTO> ShareAsync(ShareMediaRequestDTO dto, int senderUserId)
    {
        if (senderUserId <= 0)
            throw new ArgumentException("Không xác định được tài khoản người gửi.");

        if (dto.ReceiverUserId <= 0)
            throw new ArgumentException("Bạn hãy chọn người nhận.");

        if (senderUserId == dto.ReceiverUserId)
            throw new ArgumentException("Không thể chia sẻ cho chính mình.");

        if ((dto.SongId == null && dto.PlaylistId == null) || (dto.SongId != null && dto.PlaylistId != null))
            throw new ArgumentException("Chỉ được chia sẻ một bài hát hoặc một playlist.");

        using var conn = new MySqlConnection(_connectionString);

        var receiverExists = await conn.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM users WHERE Id = @Id;",
            new { Id = dto.ReceiverUserId });

        if (receiverExists == 0)
            throw new ArgumentException("Người nhận không tồn tại.");

        if (dto.SongId != null)
        {
            var songExists = await conn.ExecuteScalarAsync<int>(
                "SELECT COUNT(*) FROM songs WHERE Id = @Id;",
                new { Id = dto.SongId.Value });

            if (songExists == 0)
                throw new ArgumentException("Bài hát không tồn tại.");
        }

        if (dto.PlaylistId != null)
        {
            var playlistExists = await conn.ExecuteScalarAsync<int>(
                "SELECT COUNT(*) FROM playlists WHERE Id = @Id;",
                new { Id = dto.PlaylistId.Value });

            if (playlistExists == 0)
                throw new ArgumentException("Playlist không tồn tại.");
        }

        const string insertSql = @"
            INSERT INTO media_shares (SenderUserId, ReceiverUserId, SongId, PlaylistId, Message, SharedAt)
            VALUES (@SenderUserId, @ReceiverUserId, @SongId, @PlaylistId, @Message, NOW());
            SELECT LAST_INSERT_ID();";

        var id = await conn.ExecuteScalarAsync<int>(insertSql, new
        {
            SenderUserId = senderUserId,
            ReceiverUserId = dto.ReceiverUserId,
            dto.SongId,
            dto.PlaylistId,
            Message = string.IsNullOrWhiteSpace(dto.Message) ? null : dto.Message.Trim()
        });

        var result = await GetByIdAsync(id);
        if (result == null)
            throw new Exception("Không lấy được dữ liệu chia sẻ sau khi tạo.");

        await _notificationService.CreateAsync(dto.ReceiverUserId, "media_share", new
        {
            title = "Bạn được chia sẻ media mới",
            description = $"{result.SenderUsername} đã chia sẻ {(result.SongTitle ?? result.PlaylistName ?? "media")} cho bạn.",
            shareId = id,
            songId = dto.SongId,
            playlistId = dto.PlaylistId,
            coverUrl = result.CoverUrl
        });

        return result;
    }

    public async Task<MediaShareDTO?> GetByIdAsync(int id)
    {
        using var conn = new MySqlConnection(_connectionString);

        const string sql = @"
            SELECT
                ms.Id,
                ms.SenderUserId,
                COALESCE(u.Username, CONCAT('User ', ms.SenderUserId)) AS SenderUsername,
                ms.ReceiverUserId,
                ms.SongId,
                ms.PlaylistId,
                s.Title AS SongTitle,
                s.Artist AS Artist,
                s.CoverUrl AS CoverUrl,
                p.Name AS PlaylistName,
                ms.Message,
                ms.SharedAt
            FROM media_shares ms
            LEFT JOIN users u ON u.Id = ms.SenderUserId
            LEFT JOIN songs s ON s.Id = ms.SongId
            LEFT JOIN playlists p ON p.Id = ms.PlaylistId
            WHERE ms.Id = @Id;";

        return await conn.QueryFirstOrDefaultAsync<MediaShareDTO>(sql, new { Id = id });
    }

    public async Task<IEnumerable<MediaShareDTO>> GetReceivedAsync(int userId)
    {
        using var conn = new MySqlConnection(_connectionString);

        const string sql = @"
            SELECT
                ms.Id,
                ms.SenderUserId,
                COALESCE(u.Username, CONCAT('User ', ms.SenderUserId)) AS SenderUsername,
                ms.ReceiverUserId,
                ms.SongId,
                ms.PlaylistId,
                s.Title AS SongTitle,
                s.Artist AS Artist,
                s.CoverUrl AS CoverUrl,
                p.Name AS PlaylistName,
                ms.Message,
                ms.SharedAt
            FROM media_shares ms
            LEFT JOIN users u ON u.Id = ms.SenderUserId
            LEFT JOIN songs s ON s.Id = ms.SongId
            LEFT JOIN playlists p ON p.Id = ms.PlaylistId
            WHERE ms.ReceiverUserId = @UserId
            ORDER BY ms.SharedAt DESC;";

        return await conn.QueryAsync<MediaShareDTO>(sql, new { UserId = userId });
    }
}
