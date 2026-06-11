using System;
using System.Threading.Tasks;
using Domain.Entities;
using Dapper;
using MySqlConnector;
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
            using var conn = new MySqlConnection(_connectionString);
            
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
    }
}