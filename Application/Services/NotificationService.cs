using System.Text.Json;
using Application.DTOs;
using Dapper;
using MySqlConnector;

namespace Application.Services;

public class NotificationService
{
    private readonly string _connectionString;

    public NotificationService(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<int> CreateAsync(int userId, string type, object payload)
    {
        using var conn = new MySqlConnection(_connectionString);
        var json = JsonSerializer.Serialize(payload);

        const string sql = @"
            INSERT INTO notifications (UserId, Type, Payload, IsRead, CreatedAt)
            VALUES (@UserId, @Type, @Payload, 0, NOW());
            SELECT LAST_INSERT_ID();";

        return await conn.ExecuteScalarAsync<int>(sql, new
        {
            UserId = userId,
            Type = type,
            Payload = json
        });
    }

    public async Task<IEnumerable<NotificationDTO>> GetByUserAsync(int userId)
    {
        using var conn = new MySqlConnection(_connectionString);

        const string sql = @"
            SELECT Id, UserId, Type, Payload, IsRead, CreatedAt
            FROM notifications
            WHERE UserId = @UserId
            ORDER BY CreatedAt DESC;";

        var rows = await conn.QueryAsync(sql, new { UserId = userId });

        return rows.Select(row =>
        {
            string title = "Thông báo";
            string description = "Bạn có thông báo mới.";
            string? coverUrl = null;

            try
            {
                using var doc = JsonDocument.Parse((string)row.Payload);
                var root = doc.RootElement;

                if (root.TryGetProperty("title", out var titleProp))
                    title = titleProp.GetString() ?? title;

                if (root.TryGetProperty("description", out var descProp))
                    description = descProp.GetString() ?? description;

                if (root.TryGetProperty("coverUrl", out var coverProp))
                    coverUrl = coverProp.GetString();
            }
            catch
            {
                description = Convert.ToString(row.Payload) ?? description;
            }

            return new NotificationDTO
            {
                Id = row.Id,
                UserId = row.UserId,
                Type = row.Type,
                Title = title,
                Description = description,
                CoverUrl = coverUrl,
                IsRead = row.IsRead,
                CreatedAt = row.CreatedAt
            };
        });
    }

    public async Task<int> CountUnreadAsync(int userId)
    {
        using var conn = new MySqlConnection(_connectionString);
        const string sql = "SELECT COUNT(*) FROM notifications WHERE UserId = @UserId AND IsRead = 0;";
        return await conn.ExecuteScalarAsync<int>(sql, new { UserId = userId });
    }

    public async Task<bool> MarkAsReadAsync(int id)
    {
        using var conn = new MySqlConnection(_connectionString);
        const string sql = "UPDATE notifications SET IsRead = 1 WHERE Id = @Id;";
        return await conn.ExecuteAsync(sql, new { Id = id }) > 0;
    }

    public async Task<int> MarkAllAsReadAsync(int userId)
    {
        using var conn = new MySqlConnection(_connectionString);
        const string sql = "UPDATE notifications SET IsRead = 1 WHERE UserId = @UserId AND IsRead = 0;";
        return await conn.ExecuteAsync(sql, new { UserId = userId });
    }
}
