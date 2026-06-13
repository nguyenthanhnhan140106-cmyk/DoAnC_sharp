using MediatR;
using Application.DTOs;
using Domain.Entities;
using System.Collections.Generic;

namespace Application.Features.Notifications.Commands
{
    public record ShareMediaCommand(ShareMediaRequest Request) : IRequest<bool>;
    public record MarkNotificationAsReadCommand(int NotificationId, int UserId) : IRequest<bool>;
    public record MarkAllNotificationsAsReadCommand(int UserId) : IRequest<int>;
}

namespace Application.Features.Notifications.Queries
{
    public record GetMyNotificationsQuery(int UserId) : IRequest<IEnumerable<Notification>>;
}
