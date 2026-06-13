using MediatR;
using Application.DTOs;
using Application.Features.Notifications.Commands;
using Application.Features.Notifications.Queries;
using Application.Interfaces;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Notifications.Handlers
{
    public class NotificationHandlers : 
        IRequestHandler<ShareMediaCommand, bool>,
        IRequestHandler<MarkNotificationAsReadCommand, bool>,
        IRequestHandler<MarkAllNotificationsAsReadCommand, int>,
        IRequestHandler<GetMyNotificationsQuery, IEnumerable<Notification>>
    {
        private readonly INotificationRepository _notificationRepository;

        public NotificationHandlers(INotificationRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task<bool> Handle(ShareMediaCommand requestCmd, CancellationToken cancellationToken)
        {
            var request = requestCmd.Request;
            var payloadData = new
            {
                MediaType = request.MediaType,
                MediaId = request.MediaId,
                MediaTitle = request.MediaTitle,
                MediaCover = request.MediaCover,
                SenderName = request.SenderName,
                Message = string.IsNullOrWhiteSpace(request.Message) 
                    ? $"{request.SenderName} đã chia sẻ {(request.MediaType == "song" ? "bài hát" : request.MediaType == "album" ? "album" : "playlist")} '{request.MediaTitle}' cho bạn." 
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
                    Message = $"Bạn đã chia sẻ {(request.MediaType == "song" ? "bài hát" : request.MediaType == "album" ? "album" : "playlist")} '{request.MediaTitle}' cho {request.ReceiverName}.",
                    MediaTitle = request.MediaTitle,
                    MediaCover = request.MediaCover,
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

        public async Task<bool> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
        {
            return await _notificationRepository.MarkAsReadAsync(request.NotificationId, request.UserId);
        }

        public async Task<int> Handle(MarkAllNotificationsAsReadCommand request, CancellationToken cancellationToken)
        {
            return await _notificationRepository.MarkAllAsReadAsync(request.UserId);
        }

        public async Task<IEnumerable<Notification>> Handle(GetMyNotificationsQuery request, CancellationToken cancellationToken)
        {
            return await _notificationRepository.GetNotificationsByUserIdAsync(request.UserId);
        }
    }
}
