using Application.DTOs;

namespace Application.Interfaces
{
    public interface ISongService
    {
        Task<IEnumerable<SongDTO>> GetAllSongsAsync();
    }
}