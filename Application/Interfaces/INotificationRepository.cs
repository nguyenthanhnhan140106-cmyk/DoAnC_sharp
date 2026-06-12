using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface INotificationRepository
    {
        Task<bool> InsertNotificationAsync(Notification notification);
        Task<IEnumerable<Notification>> GetNotificationsByUserIdAsync(int userId);
        Task<bool> MarkAsReadAsync(int notificationId, int userId);
        Task<int> MarkAllAsReadAsync(int userId);
    }
}