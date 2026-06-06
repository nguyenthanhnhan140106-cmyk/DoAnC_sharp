namespace Domain.Entities
{
    public class PlayHistory
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int SongId { get; set; }
        public DateTime PlayedAt { get; set; }

        public User? User { get; set; }
        public Song? Song { get; set; }
    }
}
