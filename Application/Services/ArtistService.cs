using Application.Interfaces;
using Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class ArtistService : IArtistService
    {
        private readonly IAppDbContext _context;

        public ArtistService(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ArtistDTO>> GetAllArtistsAsync()
        {
            return await _context.Artists
                .Select(a => new ArtistDTO
                {
                    Id = a.Id,
                    Name = a.Name,
                    Bio = a.Bio,
                    ImageUrl = a.ImageUrl
                })
                .ToListAsync();
        }

        public async Task<ArtistDTO?> GetArtistByIdAsync(int id)
        {
            return await _context.Artists
                .Where(a => a.Id == id)
                .Select(a => new ArtistDTO
                {
                    Id = a.Id,
                    Name = a.Name,
                    Bio = a.Bio,
                    ImageUrl = a.ImageUrl
                })
                .FirstOrDefaultAsync();
        }
    }
}