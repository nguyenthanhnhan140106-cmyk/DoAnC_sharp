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
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? LyricsUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? AddedAt { get; set; }
        public DateTime? PlayedAt { get; set; }

        public int? ArtistId { get; set; }
        public int? UploaderId { get; set; }
        public int? AlbumId { get; set; }
        public string? AlbumName { get; set; }
        public string VideoUrl { get; set; } = string.Empty;
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
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? LyricsUrl { get; set; }
        public int? ArtistId { get; set; }
        public int? UploaderId { get; set; }
    }

    public class UpdateSongDTO
    {
        public string? Title { get; set; }
        public string? Artist { get; set; }
        public string? CoverUrl { get; set; }
        public string? AudioUrl { get; set; }
        public string? VideoUrl { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? LyricsUrl { get; set; }
        public int? ArtistId { get; set; }
    }
}
