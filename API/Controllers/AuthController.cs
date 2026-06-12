using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;
using Application.DTOs;
using System.Text.Json.Serialization;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IOtpService _otpService;
        private readonly IEmailService _emailService;

        public AuthController(IAuthService authService, IOtpService otpService, IEmailService emailService)
        {
            _authService = authService;
            _otpService = otpService;
            _emailService = emailService;
        }

        // --- CÁC API ĐÃ CÓ ---
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDTO request)
        {
            var result = await _authService.RegisterAsync(request);
            if (!result.Success) return BadRequest(new { Message = result.Message }); 
            return Ok(new { Message = result.Message });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
        {
            var token = await _authService.LoginAsync(request);
            if (token == null) return Unauthorized(new { Message = "Tên đăng nhập hoặc mật khẩu không đúng." });
            return Ok(new { Token = token });
        }

        // --- CÁC API MỚI CHO OTP ---
        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] OtpRequest request)
        {
    // Đã sửa: Truyền request.Email thay vì biến email không tồn tại
            var success = await _authService.SendOtpAsync(request.Email);
            if (!success) return BadRequest(new { Message = "Không thể gửi mã OTP." });
            return Ok(new { Message = "Mã đã được gửi đến email của bạn." });
        }
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
        {
            var isValid = await _otpService.VerifyOtp(request.Email, request.Otp);
            if (!isValid) return BadRequest(new { Message = "Mã không hợp lệ hoặc đã hết hạn." });
            return Ok(new { Message = "Xác thực thành công!" });
        }
    }

    // Các DTO hỗ trợ (Bạn có thể để trong file riêng hoặc để ở đây nếu muốn gọn)
}
