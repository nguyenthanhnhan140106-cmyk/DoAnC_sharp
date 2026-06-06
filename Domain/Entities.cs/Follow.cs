namespace Domain.Entities
{
    public class Follow
    {
        public int FollowerId { get; set; }
        public int? TargetArtistId { get; set; }
        public int? TargetUserId { get; set; }

        public User? Follower { get; set; }
        public Artist? TargetArtist { get; set; }
        public User? TargetUser { get; set; }
    }
}
