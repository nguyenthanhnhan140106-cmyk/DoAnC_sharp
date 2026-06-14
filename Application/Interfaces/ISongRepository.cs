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
        Task<int> CreateAsync(Song song);       // Trả về ID của bài hát vừa tạo
        Task<bool> UpdateAsync(Song song);     // Trả về true nếu cập nhật thành công
        Task<bool> DeleteAsync(int id);       // Trả về true nếu xóa thành công
        Task AddTagsToSongAsync(int songId, List<string> tags); // Thêm hàm lưu tag
    }
}