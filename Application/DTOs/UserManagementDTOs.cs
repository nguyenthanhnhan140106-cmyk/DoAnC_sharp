namespace Application.DTOs
{
    public class UserEntity
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? DisplayName { get; set; }
        public string? Bio { get; set; }
        public DateTime CreatedAt { get; set; }
        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
    }

    public class UserResponseDTO
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }
        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
    }

    public class UpdateProfileDTO
    {
        public string? DisplayName { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public static class UserMapper
    {
        public static UserResponseDTO ToResponseDTO(this UserEntity entity)
        {
            return new UserResponseDTO
            {
                Id = entity.Id,
                Username = entity.Username,
                DisplayName = entity.DisplayName,
                Email = entity.Email,
                AvatarUrl = entity.AvatarUrl,
                Bio = entity.Bio,
                FollowersCount = entity.FollowersCount,
                FollowingCount = entity.FollowingCount
            };
        }
    }
}
