namespace Domain.Entities
{
    public class PlaylistSong
    {
        public int PlaylistId { get; set; }
        public int SongId { get; set; }
        public DateTime AddedAt { get; set; }
        public Playlist? Playlist { get; set; }
        public Song? Song { get; set; }
    }
}
