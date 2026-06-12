namespace Application.Interfaces
{
    public interface IOtpService
    {
        // Dùng để lưu OTP từ AuthService
        Task SaveOtpAsync(string email, string otp, TimeSpan expiry);
        
        // Dùng để kiểm tra OTP
        Task<bool> VerifyOtp(string email, string otp);
    }
}
