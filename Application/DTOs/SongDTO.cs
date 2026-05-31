// Application/DTOs/SongDTO.cs
namespace Application.DTOs
{
    public class SongDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }
        public string? AudioUrl { get; set; }
        public string? Category { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateSongDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }
        public string? AudioUrl { get; set; }
        public string? Category { get; set; }
    }

    public class UpdateSongDTO
    {
        public string? Title { get; set; }
        public string? Artist { get; set; }
        public string? CoverUrl { get; set; }
        public string? AudioUrl { get; set; }
        public string? Category { get; set; }
    }
}