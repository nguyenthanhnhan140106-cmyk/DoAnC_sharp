using Application.DTOs;

namespace Application.Interfaces
{
    public interface IAuthService
    {
        // Cập nhật kiểu trả về thành Tuple để khớp với AuthService
        Task<(bool Success, string Message)> RegisterAsync(RegisterRequestDTO request);

        Task<string?> LoginAsync(LoginRequestDTO request);
    }
}
