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
    }
}
