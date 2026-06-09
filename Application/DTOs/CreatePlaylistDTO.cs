namespace Application.DTOs
{
    public class CreatePlaylistDTO
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }
    }
}
