using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;
using Application.DTOs;
using MediatR;
using Application.Features.Auth.Commands;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IAuthService _authService;
        private readonly IOtpService _otpService;
        private readonly IEmailService _emailService;

        public AuthController(IMediator mediator, IAuthService authService, IOtpService otpService, IEmailService emailService)
        {
            _mediator = mediator;
            _authService = authService;
            _otpService = otpService;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterCommand request)
        {
            try 
            {
                var result = await _mediator.Send(request);
                if (!result.Success) return BadRequest(new { Message = result.Message }); 
                return Ok(new { Message = result.Message });
            }
            catch (FluentValidation.ValidationException ex)
            {
                var errors = ex.Errors.Select(e => new { error = e.ErrorMessage }).ToList();
                return BadRequest(new { errors = errors });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Đã xảy ra lỗi hệ thống: " + ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginCommand request)
        {
            var token = await _mediator.Send(request);
            if (token == null) return Unauthorized(new { Message = "Tên đăng nhập hoặc mật khẩu không đúng." });
            return Ok(new { Token = token });
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] OtpRequest request)
        {
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

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] OtpRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest(new { Message = "Email không được để trống." });

            var exists = await _authService.CheckEmailExistsAsync(request.Email);
            if (!exists)
                return BadRequest(new { Message = "Email không tồn tại trong hệ thống." });

            var success = await _authService.SendOtpAsync(request.Email);
            if (!success) return BadRequest(new { Message = "Không thể gửi mã OTP." });
            return Ok(new { Message = "Mã khôi phục đã được gửi đến email của bạn." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Otp) || string.IsNullOrWhiteSpace(request.NewPassword))
                return BadRequest(new { Message = "Vui lòng điền đầy đủ thông tin." });

            var result = await _authService.ResetPasswordAsync(request.Email, request.Otp, request.NewPassword);
            if (!result.Success)
                return BadRequest(new { Message = result.Message });

            return Ok(new { Message = result.Message });
        }

        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpGet("search-users")]
        public async Task<IActionResult> SearchUsers([FromQuery] string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword)) 
                return BadRequest(new { Message = "Từ khóa không được để trống." });
            
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                return Unauthorized(new { Message = "Vui lòng đăng nhập." });

            var users = await _authService.SearchUsersAsync(keyword, currentUserId);
            return Ok(users);
        }
    }

}
