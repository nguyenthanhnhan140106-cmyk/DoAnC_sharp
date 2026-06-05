// Domain/Entities/AlbumSong.cs
namespace Domain.Entities
{
    public class AlbumSong
    {
        public int AlbumId { get; set; }
        public int SongId { get; set; }
        public int OrderNumber { get; set; }

        // Navigation
        public Album? Album { get; set; }
        public Song? Song { get; set; }
    }
}
