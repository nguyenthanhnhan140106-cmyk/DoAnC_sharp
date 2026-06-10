using Application.DTOs;

namespace Application.Interfaces
{
    public interface IHistoryRepository
    {
        Task AddToHistoryAsync(int userId, int songId);
        Task<IEnumerable<SongDTO>> GetRecentAsync(int userId, int limit = 10);
    }
}