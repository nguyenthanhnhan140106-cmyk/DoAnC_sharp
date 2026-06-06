// Application/Interfaces/ISongService.cs
using Application.DTOs;

namespace Application.Interfaces
{
    public interface ISongService
    {
        Task<IEnumerable<SongDTO>> GetAllSongsAsync();
        Task<IEnumerable<SongDTO>> SearchAsync(string keyword);
        Task<IEnumerable<SongDTO>> GetByCategoryAsync(string category);
        Task<SongDTO?> GetByIdAsync(int id);
        Task<SongDTO> CreateAsync(CreateSongDTO dto);
        Task<SongDTO?> UpdateAsync(int id, UpdateSongDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}