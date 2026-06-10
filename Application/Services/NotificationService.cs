using System.Text.Json;
using Application.DTOs;
using Dapper;
using MySqlConnector;

namespace Application.Services
{
    public class NotificationService
    {
        private readonly string _connectionString;

        public NotificationService(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task EnsureTablesAsync()
        {
            using var conn = new MySqlConnection(_connectionString);
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

        public async Task<int> CreateAsync(CreateNotificationDTO dto)
        {
            await EnsureTablesAsync();

            using var conn = new MySqlConnection(_connectionString);
            var sql = @"
                INSERT INTO notifications (UserId, Type, Payload, IsRead, CreatedAt)
                VALUES (@UserId, @Type, @Payload, FALSE, NOW());
                SELECT LAST_INSERT_ID();";

            return await conn.ExecuteScalarAsync<int>(sql, dto);
        }

        public async Task<IEnumerable<NotificationDTO>> GetByUserAsync(int userId)
        {
            await EnsureTablesAsync();

            using var conn = new MySqlConnection(_connectionString);
            var rows = await conn.QueryAsync<NotificationRow>(@"
                SELECT Id, UserId, Type, Payload, IsRead, CreatedAt
                FROM notifications
                WHERE UserId = @UserId
                ORDER BY CreatedAt DESC, Id DESC;",
                new { UserId = userId });

            return rows.Select(ToDTO).ToList();
        }

        public async Task<int> CountUnreadAsync(int userId)
        {
            await EnsureTablesAsync();

            using var conn = new MySqlConnection(_connectionString);
            return await conn.ExecuteScalarAsync<int>(@"
                SELECT COUNT(*)
                FROM notifications
                WHERE UserId = @UserId AND IsRead = FALSE;",
                new { UserId = userId });
        }

        public async Task<bool> MarkAsReadAsync(int id)
        {
            await EnsureTablesAsync();

            using var conn = new MySqlConnection(_connectionString);
            var affected = await conn.ExecuteAsync(@"
                UPDATE notifications
                SET IsRead = TRUE
                WHERE Id = @Id;",
                new { Id = id });

            return affected > 0;
        }

        public async Task<int> MarkAllAsReadAsync(int userId)
        {
            await EnsureTablesAsync();

            using var conn = new MySqlConnection(_connectionString);
            return await conn.ExecuteAsync(@"
                UPDATE notifications
                SET IsRead = TRUE
                WHERE UserId = @UserId AND IsRead = FALSE;",
                new { UserId = userId });
        }

        private static NotificationDTO ToDTO(NotificationRow row)
        {
            string title = GetTitle(row.Type);
            string description = "Bạn có thông báo mới.";
            string? coverUrl = null;

            try
            {
                using var doc = JsonDocument.Parse(row.Payload ?? "{}");
                var root = doc.RootElement;

                var mediaTitle = GetString(root, "title");
                var artist = GetString(root, "artist");
                var senderName = GetString(root, "senderName");
                var message = GetString(root, "message");
                coverUrl = GetString(root, "coverUrl");

                if (row.Type == "media_share")
                {
                    title = "Có media mới được chia sẻ";
                    description = $"{senderName ?? "User"} đã chia sẻ \"{mediaTitle ?? "một bài hát/album"}\"";

                    if (!string.IsNullOrWhiteSpace(artist))
                    {
                        description += $" - {artist}";
                    }

                    if (!string.IsNullOrWhiteSpace(message))
                    {
                        description += $". Lời nhắn: {message}";
                    }
                }
                else if (row.Type == "follow")
                {
                    title = "Có người theo dõi bạn";
                    description = $"{senderName ?? "Một người dùng"} đã follow bạn.";
                }
                else if (row.Type == "playlist_share")
                {
                    title = "Playlist được chia sẻ";
                    description = $"{senderName ?? "User"} đã chia sẻ playlist \"{mediaTitle ?? "mới"}\".";
                }
            }
            catch
            {
                // Nếu payload không phải JSON hợp lệ, vẫn trả notification để UI không lỗi.
            }

            return new NotificationDTO
            {
                Id = row.Id,
                UserId = row.UserId,
                Type = row.Type,
                Payload = row.Payload ?? string.Empty,
                Title = title,
                Description = description,
                CoverUrl = coverUrl,
                IsRead = row.IsRead,
                CreatedAt = row.CreatedAt
            };
        }

        private static string GetTitle(string type) => type switch
        {
            "media_share" => "Có media mới được chia sẻ",
            "follow" => "Có người theo dõi bạn",
            "playlist_share" => "Playlist được chia sẻ",
            _ => "Thông báo"
        };

        private static string? GetString(JsonElement root, string name)
        {
            return root.TryGetProperty(name, out var value) && value.ValueKind != JsonValueKind.Null
                ? value.GetString()
                : null;
        }

        private class NotificationRow
        {
            public int Id { get; set; }
            public int UserId { get; set; }
            public string Type { get; set; } = string.Empty;
            public string Payload { get; set; } = string.Empty;
            public bool IsRead { get; set; }
            public DateTime CreatedAt { get; set; }
        }
    }
}
