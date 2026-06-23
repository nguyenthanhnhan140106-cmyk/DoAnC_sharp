using Domain.Entities;

namespace Application.Interfaces
{
    public interface ISongRepository
    {
        Task<IEnumerable<Song>> GetAllSongsAsync();
        Task<IEnumerable<Song>> SearchAsync(string keyword);
        Task<IEnumerable<Song>> GetByCategoryAsync(string category);
        Task<Song?> GetByIdAsync(int id);
        Task<IEnumerable<Song>> GetByArtistIdAsync(int artistId);
        Task<IEnumerable<Song>> GetByUploaderIdAsync(int uploaderId);
        Task<int> CreateAsync(Song song);
        Task<bool> UpdateAsync(Song song);
        Task<bool> DeleteAsync(int id);
        Task AddTagsToSongAsync(int songId, List<string> tags); 
    }
}