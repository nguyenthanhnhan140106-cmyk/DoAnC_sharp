namespace Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty; // Tuyệt đối không lưu mật khẩu thô
        public string? AvatarUrl { get; set; } // Ảnh đại diện người dùng
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
