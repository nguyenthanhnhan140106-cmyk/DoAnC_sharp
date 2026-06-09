using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HistoryController : ControllerBase
    {
        private readonly IHistoryService _historyService;

        public HistoryController(IHistoryService historyService)
        {
            _historyService = historyService;
        }

        // Lấy UserId từ token JWT nếu có, không có thì dùng user mặc định 1
        private int UserId
        {
            get
            {
                if (int.TryParse(User.FindFirst("sub")?.Value, out var userId))
                {
                    return userId;
                }
                return 1;
            }
        }

        // POST: api/history/played/5
        [HttpPost("played/{songId}")]
        public async Task<IActionResult> AddToHistory(int songId)
        {
            await _historyService.AddToHistoryAsync(UserId, songId);
            return Ok(new { message = "Đã thêm vào lịch sử nghe", songId });
        }

        // GET: api/history/recent?limit=10
        [HttpGet("recent")]
        public async Task<IActionResult> GetRecent([FromQuery] int limit = 10)
        {
            var songs = await _historyService.GetRecentAsync(UserId, limit);
            return Ok(songs);
        }
    }
}