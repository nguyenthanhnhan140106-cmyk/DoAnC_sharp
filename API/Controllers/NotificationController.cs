using System.Threading.Tasks;
using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly NotificationService _notificationService = null!;

        public NotificationController(NotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // 🟢 Endpoint đón nhận yêu cầu share nhạc: POST /api/notification/share-song
        [HttpPost("share-song")]
        public async Task<IActionResult> ShareSong([FromBody] ShareSongRequest request)
        {
            if (request == null || request.ReceiverId <= 0 || request.SongId <= 0)
            {
                return BadRequest(new { Message = "Dữ liệu truyền lên không hợp lệ nhen!" });
            }

            var result = await _notificationService.ShareSongAsync(request);
            
            if (result)
            {
                return Ok(new { Message = "Đã chia sẻ bài hát thành công rực rỡ!" });
            }

            return StatusCode(500, new { Message = "Có lỗi xảy ra khi lưu thông báo vào database." });
        }
    }
}