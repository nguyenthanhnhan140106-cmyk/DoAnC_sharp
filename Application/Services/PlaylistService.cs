using Application.Interfaces;
using Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class PlaylistService : IPlaylistService
    {
        private readonly IAppDbContext _context;

        public PlaylistService(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PlaylistDTO>> GetAllPlaylistsAsync()
        {
            return await _context.Playlists
                .Include(p => p.User) // Include bảng User để lấy tên người tạo
                .Select(p => new PlaylistDTO
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    UserId = p.UserId,
                    CreatorName = p.User != null ? p.User.Username : "Ẩn danh"
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<PlaylistDTO>> GetPlaylistsByUserIdAsync(int userId)
        {
            return await _context.Playlists
                .Where(p => p.UserId == userId)
                .Include(p => p.User)
                .Select(p => new PlaylistDTO
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    UserId = p.UserId,
                    CreatorName = p.User != null ? p.User.Username : "Ẩn danh"
                })
                .ToListAsync();
        }
    }
}