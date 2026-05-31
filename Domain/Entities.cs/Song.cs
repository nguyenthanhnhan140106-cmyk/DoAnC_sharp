// Domain/Entities/Song.cs
namespace Domain.Entities
{
    public class Song
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }
        public string? AudioUrl { get; set; }   // URL file nhạc
        public string? Category { get; set; }   // "friday" | "vsound" | ...
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}