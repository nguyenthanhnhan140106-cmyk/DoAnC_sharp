using Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationService _notificationService;

        public NotificationsController(NotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet("user/{userId:int}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var data = await _notificationService.GetByUserAsync(userId);
            return Ok(data);
        }

        [HttpGet("user/{userId:int}/unread-count")]
        public async Task<IActionResult> CountUnread(int userId)
        {
            var count = await _notificationService.CountUnreadAsync(userId);
            return Ok(new { count });
        }

        [HttpPut("{id:int}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var ok = await _notificationService.MarkAsReadAsync(id);
            return ok
                ? NoContent()
                : NotFound(new { message = "Không tìm thấy thông báo." });
        }

        [HttpPut("user/{userId:int}/read-all")]
        public async Task<IActionResult> MarkAllAsRead(int userId)
        {
            var affected = await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(new { affected });
        }
    }
}
