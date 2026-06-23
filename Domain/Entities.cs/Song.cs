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
        public string? AudioUrl { get; set; }
        public string? VideoUrl { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? LyricsUrl { get; set; }
        public DateTime CreatedAt { get; set; }

        public int? ArtistId { get; set; }
        public int? UploaderId { get; set; }
        public int WorldRank { get; set; }
        public int Followers { get; set; }
        public int MonthlyListeners { get; set; }
        public string? Bio { get; set; }
        public bool IsVerified { get; set; } = true;
    }
}
