using Application.Interfaces;
using Application.DTOs;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services
{
    public class SongService : ISongService
    {
        private readonly ISongRepository _songRepository;

        // Đã chuyển đổi hoàn toàn từ DbContext sang Repository xài Dapper
        public SongService(ISongRepository songRepository)
        {
            _songRepository = songRepository;
        }

        public async Task<IEnumerable<SongDTO>> GetAllSongsAsync()
        {
            var songs = await _songRepository.GetAllSongsAsync();
            return songs.Select(s => ToDTO(s));
        }

        public async Task<IEnumerable<SongDTO>> SearchAsync(string keyword)
        {
            var songs = await _songRepository.SearchAsync(keyword);
            return songs.Select(s => ToDTO(s));
        }

        public async Task<IEnumerable<SongDTO>> GetByCategoryAsync(string category)
        {
            var songs = await _songRepository.GetByCategoryAsync(category);
            return songs.Select(s => ToDTO(s));
        }

        public async Task<SongDTO?> GetByIdAsync(int id)
        {
            var song = await _songRepository.GetByIdAsync(id);
            if (song == null) return null;
            return ToDTO(song);
        }

        public async Task<SongDTO> CreateAsync(CreateSongDTO dto)
        {
            var song = new Song
            {
                Title     = dto.Title,
                Artist    = dto.Artist,
                CoverUrl  = dto.CoverUrl,
                AudioUrl  = dto.AudioUrl,
                Category  = dto.Category,
                ArtistId  = dto.ArtistId,
                CreatedAt = DateTime.UtcNow // 🟢 Gán thời gian tạo tại đây khi khởi tạo bài mới thông qua API
            };

            // Dapper thực hiện lệnh Insert và nạp lại ID thực tế từ database vào thực thể
            var newId = await _songRepository.CreateAsync(song);
            song.Id = newId; 

            return ToDTO(song);
        }

        public async Task<SongDTO?> UpdateAsync(int id, UpdateSongDTO dto)
        {
            // Bốc dữ liệu hiện tại lên để kiểm tra trước khi sửa
            var song = await _songRepository.GetByIdAsync(id);
            if (song == null) return null;

            if (dto.Title    != null) song.Title    = dto.Title;
            if (dto.Artist   != null) song.Artist   = dto.Artist;
            if (dto.CoverUrl != null) song.CoverUrl = dto.CoverUrl;
            if (dto.AudioUrl != null) song.AudioUrl = dto.AudioUrl;
            if (dto.Category != null) song.Category = dto.Category;
            if (dto.ArtistId != null) song.ArtistId = dto.ArtistId; 

            // Thực thi lệnh UPDATE bằng Dapper SQL thuần
            await _songRepository.UpdateAsync(song);
            return ToDTO(song);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            // Trả về kết quả xóa trực tiếp từ tầng Dapper
            return await _songRepository.DeleteAsync(id);
        }

        // ── 🟢 Mapper chuyển đổi dữ liệu an toàn sang DTO trả về cho React ──────────────────
        private static SongDTO ToDTO(Song s) => new()
        {
            Id               = s.Id,
            Title            = s.Title,
            Artist           = s.Artist,
            CoverUrl         = s.CoverUrl,
            AudioUrl         = s.AudioUrl,
            Category         = s.Category,
            CreatedAt        = s.CreatedAt, // Nhận thời gian chuẩn từ DB đổ lên qua Dapper
            
            // Ánh xạ toàn bộ các thuộc tính nghệ sĩ từ thực thể Song sang DTO
            ArtistId         = s.ArtistId,
            WorldRank        = s.WorldRank,
            Followers        = s.Followers,
            MonthlyListeners = s.MonthlyListeners,
            Bio              = s.Bio,
            ArtistBanner     = s.ArtistBanner,
            IsVerified       = s.IsVerified
        };
    }
}