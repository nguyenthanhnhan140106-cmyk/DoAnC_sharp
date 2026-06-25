using System.Collections.Generic;

namespace Application.DTOs
{
    public class AlbumDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }
        public string ArtistName { get; set; } = string.Empty;                
        public List<SongDTO> Songs { get; set; } = new List<SongDTO>();
    }
}