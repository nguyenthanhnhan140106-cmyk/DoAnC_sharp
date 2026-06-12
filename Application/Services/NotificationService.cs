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
                    ? $"{request.SenderName} đã chia sẻ bài hát '{request.SongTitle}' cho bạn." 
                    : $"{request.SenderName}: {request.Message}",
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

            var success = await _notificationRepository.InsertNotificationAsync(notification);

            if (success && request.SenderId > 0)
            {
                var senderPayload = new
                {
                    Message = $"Bạn đã chia sẻ bài hát '{request.SongTitle}' cho {request.ReceiverName}.",
                    SongTitle = request.SongTitle,
                    SongCover = request.SongCover,
                    ReceiverName = request.ReceiverName,
                    CreatedAt = DateTime.UtcNow
                };
                
                var senderNotification = new Notification
                {
                    UserId = request.SenderId,
                    Type = "System",
                    Payload = JsonSerializer.Serialize(senderPayload),
                    IsRead = false
                };
                
                await _notificationRepository.InsertNotificationAsync(senderNotification);
            }

            return success;
        }

        public async Task<System.Collections.Generic.IEnumerable<Notification>> GetNotificationsByUserIdAsync(int userId)
        {
            return await _notificationRepository.GetNotificationsByUserIdAsync(userId);
        }

        public async Task<bool> MarkAsReadAsync(int notificationId, int userId)
        {
            return await _notificationRepository.MarkAsReadAsync(notificationId, userId);
        }

        public async Task<int> MarkAllAsReadAsync(int userId)
        {
            return await _notificationRepository.MarkAllAsReadAsync(userId);
        }
    }
}