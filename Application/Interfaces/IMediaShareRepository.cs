using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface IMediaShareRepository
    {
        Task<bool> InsertMediaShareAsync(MediaShare mediaShare);
        Task<IEnumerable<MediaShareDTO>> GetSharedWithMeAsync(int receiverId);
        Task<IEnumerable<MediaShareDTO>> GetSharedByMeAsync(int senderId);
        Task<bool> IsAlreadySharedAsync(int senderId, int receiverId, int mediaId, string mediaType);
    }
}
