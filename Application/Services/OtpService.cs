using Application.Interfaces;
using Domain.Entities;
using System;
using System.Threading.Tasks;

namespace Application.Services
{
    public class OtpService : IOtpService
    {
        private readonly IOtpRepository _otpRepository;

        public OtpService(IOtpRepository otpRepository)
        {
            _otpRepository = otpRepository;
        }

        // Triển khai đúng phương thức SaveOtpAsync theo Interface
        public async Task SaveOtpAsync(string email, string otp, TimeSpan expiry)
        {
            await _otpRepository.DeleteExistingOtps(email);
            
            var userOtp = new UserOtp 
            { 
                Email = email, 
                OtpCode = BCrypt.Net.BCrypt.HashPassword(otp), 
                ExpiryTime = DateTime.UtcNow.Add(expiry),
                IsUsed = false
            };
            
            await _otpRepository.AddOtp(userOtp);
        }

        // Nếu bạn vẫn muốn giữ GenerateAndSaveOtp, hãy đảm bảo tham số expiry tồn tại
        public async Task<string> GenerateAndSaveOtp(string email)
        {
            var otp = new Random().Next(100000, 999999).ToString();
            // Gọi hàm SaveOtpAsync ngay tại đây để tái sử dụng logic
            await SaveOtpAsync(email, otp, TimeSpan.FromMinutes(15));
            return otp;
        }

        public async Task<bool> VerifyOtp(string email, string otp)
        {
            var record = await _otpRepository.GetValidOtp(email);
            
            if (record == null) return false;

            bool isValid = BCrypt.Net.BCrypt.Verify(otp, record.OtpCode);
            
            if (isValid)
            {
                record.IsUsed = true;
                await _otpRepository.UpdateOtp(record);
            }
            
            return isValid;
        }
    }
}
