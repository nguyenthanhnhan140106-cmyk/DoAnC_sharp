namespace Domain.Entities
{
    public class Playlist
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public User? User { get; set; } 
    }
}