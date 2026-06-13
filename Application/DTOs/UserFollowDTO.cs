namespace Application.DTOs
{
    public class UserFollowDTO
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
    }
}
