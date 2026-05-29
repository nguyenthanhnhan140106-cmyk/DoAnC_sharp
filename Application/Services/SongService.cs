using Application.Interfaces;
using Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class SongService : ISongService
    {
        private readonly IAppDbContext _context;

        public SongService(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SongDTO>> GetAllSongsAsync()
        {
            // Bốc dữ liệu từ bảng songs lên và map thẳng sang SongDTO
            return await _context.Songs
                .Select(s => new SongDTO
                {
                    Id = s.Id,
                    Title = s.Title,
                    Artist = s.Artist,
                    CoverUrl = s.CoverUrl
                })
                .ToListAsync();
        }
    }
}