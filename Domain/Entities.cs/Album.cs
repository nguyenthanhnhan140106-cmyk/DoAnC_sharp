// Domain/Entities/Album.cs
namespace Domain.Entities
{
    public class Album
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }
        public int ArtistId { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation (tùy chọn, Dapper thường không cần)
        public Artist? Artist { get; set; }
        public ICollection<AlbumSong>? AlbumSongs { get; set; }
    }
}
