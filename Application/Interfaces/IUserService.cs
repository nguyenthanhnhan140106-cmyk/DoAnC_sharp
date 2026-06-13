using Application.DTOs;

namespace Application.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<Application.DTOs.UserResponseDTO>> GetAllUsersAsync();
        Task<Application.DTOs.UserResponseDTO?> GetUserByIdAsync(int id);
    }
}
