using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        // Inject IUserService vào để xử lý logic tài khoản hằng ngày
        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        // API: GET http://localhost:5104/api/Users
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                // Giả định trong IUserService của nhóm đã có hàm GetAllUsersAsync
                var users = await _userService.GetAllUsersAsync();
                return Ok(users); // Trả về danh sách tài khoản dạng JSON
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống Backend: {ex.Message}");
            }
        }
    }
}