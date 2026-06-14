using System;

namespace Application.DTOs
{
    public class MediaShareDTO
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public int? SongId { get; set; }
        public int? PlaylistId { get; set; }
        public DateTime SharedAt { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string MediaTitle { get; set; } = string.Empty;
        public string? MediaCover { get; set; }
        public string MediaType { get; set; } = string.Empty;
    }
}
