using System;
using System.Threading.Tasks;
using Domain.Entities;
using Dapper;
using Microsoft.Data.SqlClient;
using Application.Interfaces; // 🟢 Dòng khai báo sống còn để tìm thấy Interface

namespace Infrastructure.Repositories
{
    public class NotificationRepository : INotificationRepository // Kế thừa Interface
    {
        private readonly string _connectionString;

        public NotificationRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task<bool> InsertNotificationAsync(Notification notification)
        {
            using var conn = new SqlConnection(_connectionString);
            
            // 🟢 Lưu ý: Cập nhật chữ 'notifications' (có chữ s) cho khớp với bảng tạo tự động trong Program.cs
            var sql = @"
                INSERT INTO notifications (UserId, Type, Payload, IsRead) 
                VALUES (@UserId, @Type, @Payload, @IsRead);";
            
            var rowsAffected = await conn.ExecuteAsync(sql, new {
                notification.UserId,
                notification.Type,
                notification.Payload,
                notification.IsRead
            });

            return rowsAffected > 0;
        }
        public async Task<IEnumerable<Notification>> GetNotificationsByUserIdAsync(int userId)
        {
            using var conn = new SqlConnection(_connectionString);
            var sql = "SELECT * FROM notifications WHERE UserId = @UserId ORDER BY Id DESC";
            return await conn.QueryAsync<Notification>(sql, new { UserId = userId });
        }

        public async Task<bool> MarkAsReadAsync(int notificationId, int userId)
        {
            using var conn = new SqlConnection(_connectionString);
            var sql = "UPDATE notifications SET IsRead = 1 WHERE Id = @Id AND UserId = @UserId";
            var rowsAffected = await conn.ExecuteAsync(sql, new { Id = notificationId, UserId = userId });
            return rowsAffected > 0;
        }

        public async Task<int> MarkAllAsReadAsync(int userId)
        {
            using var conn = new SqlConnection(_connectionString);
            var sql = "UPDATE notifications SET IsRead = 1 WHERE UserId = @UserId AND IsRead = 0";
            return await conn.ExecuteAsync(sql, new { UserId = userId });
        }
    }
}
