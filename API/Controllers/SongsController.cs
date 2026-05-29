using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SongsController : ControllerBase
    {
        private readonly ISongService _songService;

        // Inject ISongService vào thông qua cơ chế Dependency Injection
        public SongsController(ISongService songService)
        {
            _songService = songService;
        }

        // API: GET http://localhost:5104/api/Songs
        [HttpGet]
        public async Task<IActionResult> GetSongs()
        {
            try
            {
                var songs = await _songService.GetAllSongsAsync();
                return Ok(songs); // Trả về mã 200 kèm danh sách bài hát dạng JSON
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống Backend: {ex.Message}");
            }
        }
    }
}