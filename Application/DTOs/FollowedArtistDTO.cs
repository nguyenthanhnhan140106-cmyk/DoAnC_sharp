namespace Application.DTOs
{
    public class FollowedArtistDTO
    {
        public int ArtistId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }
    }
}
