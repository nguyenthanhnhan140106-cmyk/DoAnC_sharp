namespace Application.DTOs
{
    public class ShareMediaRequestDTO
    {
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public int? SongId { get; set; }
        public int? AlbumId { get; set; }
        public string? Message { get; set; }
    }

    public class MediaShareDTO
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public int ReceiverId { get; set; }
        public int? SongId { get; set; }
        public int? AlbumId { get; set; }
        public string MediaType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }
        public string? Message { get; set; }
        public DateTime SharedAt { get; set; }
    }
}
