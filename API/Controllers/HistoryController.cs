using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Yêu cầu phải đăng nhập
    public class HistoryController : ControllerBase
    {
        private readonly IHistoryService _historyService;

        public HistoryController(IHistoryService historyService)
        {
            _historyService = historyService;
        }

        private int UserId
        {
            get
            {
                var idClaim = User.FindFirst("id")?.Value ?? User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(idClaim, out var userId))
                {
                    return userId;
                }
                throw new UnauthorizedAccessException("Người dùng chưa xác thực");
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