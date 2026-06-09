using Application.DTOs;

namespace Application.Interfaces
{
    public interface IUserService
    {
     Task<IEnumerable<Application.DTOs.UserResponseDTO>> GetAllUsersAsync();
    }
}
