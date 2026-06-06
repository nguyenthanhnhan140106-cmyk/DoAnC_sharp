// Application/DTOs/SongDTO.cs
using System;

namespace Application.DTOs
{
    public class SongDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }
        public string? AudioUrl { get; set; }
        public string? VideoUrl { get; set; }
        public string? Category { get; set; }
        public DateTime CreatedAt { get; set; }

        // 🟢 BỔ SUNG CÁC TRƯỜNG THÔNG TIN NGHỆ SĨ THẬT ĐỂ TRẢ VỀ FRONTEND DIALOG
        public int? ArtistId { get; set; }
        public int WorldRank { get; set; }
        public int Followers { get; set; }
        public int MonthlyListeners { get; set; }
        public string? Bio { get; set; }
        public string? ArtistBanner { get; set; }
        public bool IsVerified { get; set; } = true;
    }

    public class CreateSongDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }
        public string? AudioUrl { get; set; }
        public string? VideoUrl { get; set; }
        public string? Category { get; set; }
        public int? ArtistId { get; set; } // Thêm nếu sau này làm giao diện Admin tạo bài hát gắn với Ca sĩ
    }

    public class UpdateSongDTO
    {
        public string? Title { get; set; }
        public string? Artist { get; set; }
        public string? CoverUrl { get; set; }
        public string? AudioUrl { get; set; }
        public string? VideoUrl { get; set; }
        public string? Category { get; set; }
        public int? ArtistId { get; set; }
    }
}