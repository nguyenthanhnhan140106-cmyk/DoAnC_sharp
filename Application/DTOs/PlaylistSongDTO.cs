using System;

namespace Application.DTOs
{
    public class PlaylistSongDTO
    {
        public int PlaylistId { get; set; }
        public int SongId { get; set; }
        public DateTime AddedAt { get; set; }
    }
}
