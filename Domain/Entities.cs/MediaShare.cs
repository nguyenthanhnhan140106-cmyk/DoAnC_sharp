namespace Domain.Entities
{
    public class MediaShare
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public int? SongId { get; set; }
        public int? PlaylistId { get; set; }
        public DateTime SharedAt { get; set; }
        public User? Sender { get; set; }
        public User? Receiver { get; set; }
        public Song? Song { get; set; }
        public Playlist? Playlist { get; set; }
    }
}
