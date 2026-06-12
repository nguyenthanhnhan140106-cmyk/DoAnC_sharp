using Application.DTOs;

namespace Application.Interfaces
{
    public interface IAuthService
    {
        Task<bool> SendOtpAsync(string email);
        // Cập nhật kiểu trả về thành Tuple để khớp với AuthService
        Task<(bool Success, string Message)> RegisterAsync(RegisterRequestDTO request);
        Task<string?> VerifyOtpAndGetToken(string email, string otp);

        Task<string?> LoginAsync(LoginRequestDTO request);
    }
}
