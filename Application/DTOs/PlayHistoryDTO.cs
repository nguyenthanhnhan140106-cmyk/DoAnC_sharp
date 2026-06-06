using System;

namespace Application.DTOs
{
    public class PlayHistoryDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int SongId { get; set; }
        public DateTime PlayedAt { get; set; }
    }
}
