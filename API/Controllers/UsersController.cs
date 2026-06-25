using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Application.DTOs;
using Application.Features.Users.Queries;
using Application.Features.Users.Commands;
using Application.Interfaces;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly string _connectionString;

        public UsersController(IMediator mediator, ICloudinaryService cloudinaryService, IConfiguration configuration)
        {
            _mediator = mediator;
            _cloudinaryService = cloudinaryService;
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _mediator.Send(new GetAllUsersQuery());
                return Ok(users); 
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống Backend: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var user = await _mediator.Send(new GetProfileQuery(id));
                if (user == null) return NotFound("User not found.");
                return Ok(user);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống Backend: {ex.Message}");
            }
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileDTO dto)
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                return Unauthorized(new { Message = "Vui lòng đăng nhập." });

            if (currentUserId != id)
                return Forbid();

            try
            {
                var command = new UpdateProfileCommand(id, dto.DisplayName, dto.Bio, dto.AvatarUrl);
                var updated = await _mediator.Send(command);
                if (updated == null) return NotFound(new { Message = "Không tìm thấy người dùng." });
                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống Backend: {ex.Message}");
            }
        }

        
        [Authorize]
        [HttpPost("{id}/avatar")]
        public async Task<IActionResult> UploadAvatar(int id, IFormFile file)
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                return Unauthorized(new { Message = "Vui lòng đăng nhập." });

            if (currentUserId != id)
                return Forbid();

            if (file == null || file.Length == 0)
                return BadRequest(new { Message = "File không hợp lệ." });

            var allowedTypes = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var ext = System.IO.Path.GetExtension(file.FileName).ToLower();
            if (!allowedTypes.Contains(ext))
                return BadRequest(new { Message = "Chỉ chấp nhận định dạng: .jpg, .jpeg, .png, .webp, .gif" });

            try
            {
                using var stream = file.OpenReadStream();
                var avatarUrl = await _cloudinaryService.UploadImageAsync(stream, file.FileName);

                using var conn = new SqlConnection(_connectionString);
                await conn.ExecuteAsync(
                    "UPDATE users SET AvatarUrl = @AvatarUrl WHERE Id = @Id",
                    new { AvatarUrl = avatarUrl, Id = id });

                return Ok(new { AvatarUrl = avatarUrl });
            }
            catch (System.Exception ex)
            {
                Console.WriteLine("=== AVATAR UPLOAD EXCEPTION ===");
                Console.WriteLine(ex.ToString());
                return StatusCode(500, $"Lỗi upload avatar: {ex.Message}");
            }
        }
    }
}

