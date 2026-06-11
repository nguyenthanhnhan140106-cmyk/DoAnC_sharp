using System;
using System.Text.Json;
using System.Threading.Tasks;
using Application.DTOs;
using Domain.Entities;
using Application.Interfaces; // 🟢 Chỉ gọi Interface trong cùng tầng Application

namespace Application.Services
{
    public class NotificationService
    {
        // 🟢 Đổi từ class NotificationRepository thành interface INotificationRepository
        private readonly INotificationRepository _notificationRepository;

        public NotificationService(INotificationRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task<bool> ShareSongAsync(ShareSongRequest request)
        {
            var payloadData = new
            {
                SongId = request.SongId,
                SongTitle = request.SongTitle,
                SongCover = request.SongCover,
                SenderName = request.SenderName,
                Message = string.IsNullOrWhiteSpace(request.Message) 
                    ? $"Đã chia sẻ bài hát {request.SongTitle} cho bạn." 
                    : request.Message,
                CreatedAt = DateTime.UtcNow
            };

            string jsonPayload = JsonSerializer.Serialize(payloadData);

            var notification = new Notification
            {
                UserId = request.ReceiverId, 
                Type = "SharedMedia",        
                Payload = jsonPayload,       
                IsRead = false
            };

            return await _notificationRepository.InsertNotificationAsync(notification);
        }
    }
}