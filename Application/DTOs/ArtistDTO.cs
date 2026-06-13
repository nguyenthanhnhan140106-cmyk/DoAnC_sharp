namespace Application.DTOs
{
    public class ArtistDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Bio { get; set; } 
        public int WorldRank { get; set; }
        public int Followers { get; set; }
        public int MonthlyListeners { get; set; }
        public bool IsVerified { get; set; }
        public string? BannerUrl { get; set; }
    }
}