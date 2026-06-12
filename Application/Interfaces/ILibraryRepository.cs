using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface ILibraryRepository
    {
        Task SaveAlbumAsync(int userId, int albumId);
        Task RemoveAlbumAsync(int userId, int albumId);
        Task<bool> IsAlbumSavedAsync(int userId, int albumId);
        Task<IEnumerable<AlbumDTO>> GetSavedAlbumsAsync(int userId);
    }
}
