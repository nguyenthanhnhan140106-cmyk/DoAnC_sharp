namespace Application.DTOs
{
    public class RegisterRequestDTO 
    {
        // Các thuộc tính cho việc đăng ký
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
