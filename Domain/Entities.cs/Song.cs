// Domain/Entities/Song.cs
using System;

namespace Domain.Entities
{
    public class Song
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public string? ArtistBanner { get; set; }
        public string? CoverUrl { get; set; }
        public string? AudioUrl { get; set; }   // URL file nhạc
        public string? VideoUrl { get; set; }    // URL video YouTube
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? LyricsUrl { get; set; }     // Dữ liệu lời bài hát (JSON chuỗi)
        public DateTime CreatedAt { get; set; } // 🟢 Giữ nguyên gốc không gán gượng ép DateTime.UtcNow ở đây nhen Nam

        // 🟢 BỔ SUNG CÁC THUỘC TÍNH ĐÓN DỮ LIỆU NGHỆ SĨ THẬT (HỨNG LỆNH JOIN DAPPER)
        public int? ArtistId { get; set; }       // Khóa ngoại liên kết sang bảng artists
        public int? UploaderId { get; set; }     // Khóa ngoại liên kết sang bảng users
        public int WorldRank { get; set; }       // Thứ hạng thế giới (#36, #120,...)
        public int Followers { get; set; }       // Số lượng người theo dõi
        public int MonthlyListeners { get; set; } // Số lượt nghe hàng tháng
        public string? Bio { get; set; }         // Tiểu sử ca sĩ (N/A hoặc chữ thật)
        public bool IsVerified { get; set; } = true; // Tích xanh xác minh nghệ sĩ
    }
}
