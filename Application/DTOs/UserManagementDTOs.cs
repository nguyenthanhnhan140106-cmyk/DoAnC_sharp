namespace Application.DTOs
{
    public class UserEntity
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
    }

    public class UserResponseDTO
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
    }

    public static class UserMapper
    {
        public static UserResponseDTO ToResponseDTO(this UserEntity entity)
        {
            return new UserResponseDTO
            {
                Id = entity.Id,
                Username = entity.Username,
                Email = entity.Email,
                AvatarUrl = entity.AvatarUrl,
                FollowersCount = entity.FollowersCount,
                FollowingCount = entity.FollowingCount
            };
        }
    }
}
