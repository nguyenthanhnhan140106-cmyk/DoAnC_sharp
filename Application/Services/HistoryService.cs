using Application.DTOs;
using Application.Interfaces;

namespace Application.Services
{
    public class HistoryService : IHistoryService
    {
        private readonly IHistoryRepository _historyRepository;

        public HistoryService(IHistoryRepository historyRepository)
        {
            _historyRepository = historyRepository;
        }

        public async Task AddToHistoryAsync(int userId, int songId)
        {
            await _historyRepository.AddToHistoryAsync(userId, songId);
        }

        public async Task<IEnumerable<SongDTO>> GetRecentAsync(int userId, int limit)
        {
            var songs = await _historyRepository.GetRecentAsync(userId, limit);
            return songs;
        }
    }
}