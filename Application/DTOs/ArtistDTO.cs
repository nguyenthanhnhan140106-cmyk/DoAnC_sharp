namespace Application.DTOs
{
    public class ArtistDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Bio { get; set; } 
        public string? ImageUrl { get; set; } 
    }
}