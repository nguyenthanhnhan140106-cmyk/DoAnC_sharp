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

        public async Task<IEnumerable<NotificationDTO>> GetByUserAsync(int userId)
        {
            using var conn = new MySqlConnection(_connectionString);

            return await conn.QueryAsync<NotificationDTO>(@"
                SELECT Id, UserId, Type, Title, Message, Payload, IsRead, CreatedAt
                FROM notifications
                WHERE UserId = @UserId
                ORDER BY CreatedAt DESC, Id DESC;",
                new { UserId = userId });
        }

        public async Task<int> CountUnreadAsync(int userId)
        {
            using var conn = new MySqlConnection(_connectionString);

            return await conn.ExecuteScalarAsync<int>(@"
                SELECT COUNT(*)
                FROM notifications
                WHERE UserId = @UserId AND IsRead = 0;",
                new { UserId = userId });
        }

        public async Task<bool> MarkAsReadAsync(int userId, int notificationId)
        {
            using var conn = new MySqlConnection(_connectionString);

            var affected = await conn.ExecuteAsync(@"
                UPDATE notifications
                SET IsRead = 1
                WHERE Id = @NotificationId AND UserId = @UserId;",
                new { NotificationId = notificationId, UserId = userId });

            return affected > 0;
        }

        public async Task<int> MarkAllAsReadAsync(int userId)
        {
            using var conn = new MySqlConnection(_connectionString);

            return await conn.ExecuteAsync(@"
                UPDATE notifications
                SET IsRead = 1
                WHERE UserId = @UserId AND IsRead = 0;",
                new { UserId = userId });
        }
    }
}
