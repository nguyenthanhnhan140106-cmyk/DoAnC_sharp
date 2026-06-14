using Application.DTOs;

namespace Application.Interfaces
{
    public interface IPlaylistService
    {
        Task<IEnumerable<PlaylistDTO>> GetAllPlaylistsAsync();
        Task<IEnumerable<PlaylistDTO>> GetPlaylistsByUserIdAsync(int userId);
        Task<PlaylistDTO> CreatePlaylistAsync(int userId, CreatePlaylistDTO dto);
        Task<PlaylistDTO?> GetPlaylistByIdAsync(int id);
        Task<bool> AddSongToPlaylistAsync(int playlistId, int songId);
        Task<bool> RemoveSongFromPlaylistAsync(int playlistId, int songId);
        Task<bool> DeletePlaylistAsync(int id);
        Task<bool> TogglePlaylistPrivacyAsync(int id, bool isPublic);
        Task<IEnumerable<int>> GetPlaylistsContainingSongAsync(int userId, int songId);
    }
}