using Domain.Entities;
namespace Application.Interfaces
{
    public interface IOtpRepository
    {
        Task DeleteExistingOtps(string email);
        Task AddOtp(UserOtp userOtp);
        Task<UserOtp?> GetValidOtp(string email);
        Task UpdateOtp(UserOtp userOtp);
    }
}
