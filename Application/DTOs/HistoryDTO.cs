namespace Application.DTOs
{
    public class HistoryDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int SongId { get; set; }
        public DateTime PlayedAt { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public string CoverUrl { get; set; } = string.Empty;
        public string AudioUrl { get; set; } = string.Empty;
    }
}