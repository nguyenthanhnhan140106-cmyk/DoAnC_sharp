using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface INotificationRepository
    {
        Task<bool> InsertNotificationAsync(Notification notification);
    }
}