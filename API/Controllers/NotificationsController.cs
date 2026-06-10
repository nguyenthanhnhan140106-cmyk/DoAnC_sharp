using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/notifications")]
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationService _notificationService;

        public NotificationsController(NotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMine()
        {
            var userId = GetCurrentUserId();
            if (userId <= 0) return Unauthorized(new { message = "Bạn cần đăng nhập." });

            var data = await _notificationService.GetByUserAsync(userId);
            return Ok(data);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> CountUnread()
        {
            var userId = GetCurrentUserId();
            if (userId <= 0) return Unauthorized(new { message = "Bạn cần đăng nhập." });

            var count = await _notificationService.CountUnreadAsync(userId);
            return Ok(new { count });
        }

        [HttpPut("{id:int}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0) return Unauthorized(new { message = "Bạn cần đăng nhập." });

            var ok = await _notificationService.MarkAsReadAsync(userId, id);
            return ok ? NoContent() : NotFound(new { message = "Không tìm thấy thông báo." });
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetCurrentUserId();
            if (userId <= 0) return Unauthorized(new { message = "Bạn cần đăng nhập." });

            var affected = await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(new { affected });
        }

        private int GetCurrentUserId()
        {
            var rawId = User.FindFirst("id")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return int.TryParse(rawId, out var id) ? id : 0;
        }
    }
}
