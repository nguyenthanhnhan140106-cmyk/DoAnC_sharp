using Application.DTOs;

namespace Application.Interfaces
{
    public interface IPlaylistService
    {
        Task<IEnumerable<PlaylistDTO>> GetAllPlaylistsAsync();
        Task<IEnumerable<PlaylistDTO>> GetPlaylistsByUserIdAsync(int userId); // Lấy playlist của riêng user đó
    }
}