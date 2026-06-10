namespace Domain.Entities
{
    public class UserHistory
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int SongId { get; set; }
        public DateTime PlayedAt { get; set; }
    }
}