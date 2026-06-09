using Application.DTOs;

namespace Application.Interfaces
{
    public interface IHistoryService
    {
        Task AddToHistoryAsync(int userId, int songId);

        Task<IEnumerable<SongDTO>> GetRecentAsync(
            int userId,
            int limit = 10
        );
    }
}