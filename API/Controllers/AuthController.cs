using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;
using Application.DTOs;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        // DI sẽ tự lấy IAuthService đã đăng ký trong Program.cs
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDTO request)
        {
            // Gọi service và nhận kết quả Tuple
            if (request == null) return BadRequest("Dữ liệu gửi lên trống.");
            var result = await _authService.RegisterAsync(request);
            
            // Dùng thuộc tính .Success của Tuple thay vì toán tử !
               if (!result.Success) return BadRequest(new { Message = result.Message }); 
            return Ok(new { Message = result.Message });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
        {
            var token = await _authService.LoginAsync(request);
            if (token == null) 
                return Unauthorized(new { Message = "Tên đăng nhập hoặc mật khẩu không đúng." });
            
            return Ok(new { Token = token });
        }
    }
}
