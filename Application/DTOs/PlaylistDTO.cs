namespace Application.DTOs
{
    public class PlaylistDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }
        public int UserId { get; set; } // ID của người tạo playlist
        public string CreatorName { get; set; } = string.Empty; // Tên người tạo để hiện lên giao diện
        public DateTime CreatedAt { get; set; }
        public List<SongDTO> Songs { get; set; } = new();
    }
}