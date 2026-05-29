using Application.DTOs;

namespace Application.Interfaces
{
    public interface IArtistService
    {
        Task<IEnumerable<ArtistDTO>> GetAllArtistsAsync();
        Task<ArtistDTO?> GetArtistByIdAsync(int id);
    }
}