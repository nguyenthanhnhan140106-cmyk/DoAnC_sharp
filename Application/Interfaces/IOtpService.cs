namespace Application.Interfaces
{
    public interface IOtpService
    {
        Task SaveOtpAsync(string email, string otp, TimeSpan expiry);
        
        Task<bool> VerifyOtp(string email, string otp);
    }
}
