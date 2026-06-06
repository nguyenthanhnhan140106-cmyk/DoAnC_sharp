namespace Application.DTOs
{
    public class FollowDTO
    {
        public int FollowerId { get; set; }
        public int? TargetArtistId { get; set; }
        public int? TargetUserId { get; set; }
    }
}
