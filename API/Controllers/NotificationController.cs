using System.Threading.Tasks;
using Application.DTOs;
using MediatR;
using Application.Features.Notifications.Commands;
using Application.Features.Notifications.Queries;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using API.Hubs;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationController(IMediator mediator, IHubContext<NotificationHub> hubContext)
        {
            _mediator = mediator;
            _hubContext = hubContext;
        }

        // 🟢 Endpoint đón nhận yêu cầu share nhạc/album/playlist: POST /api/notification/share-media
        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpPost("share-media")]
        public async Task<IActionResult> ShareMedia([FromBody] ShareMediaRequest request)
        {
            if (request == null || request.ReceiverId <= 0 || request.MediaId <= 0 || string.IsNullOrEmpty(request.MediaType))
            {
                return BadRequest(new { Message = "Dữ liệu truyền lên không hợp lệ nhen!" });
            }

            var userIdClaim = User.FindFirst("id")?.Value;
            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int currentUserId))
            {
                request.SenderId = currentUserId;
            }

            var result = await _mediator.Send(new ShareMediaCommand(request));
            
            if (result)
            {
                // Bắn SignalR event để Frontend fetch lại notifications
                await _hubContext.Clients.User(request.ReceiverId.ToString()).SendAsync("ReceiveNotification");
                if (request.SenderId > 0)
                {
                    await _hubContext.Clients.User(request.SenderId.ToString()).SendAsync("ReceiveNotification");
                }

                return Ok(new { Message = "Đã chia sẻ thành công rực rỡ!" });
            }

            return StatusCode(500, new { Message = "Có lỗi xảy ra khi lưu thông báo vào database." });
        }

        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpGet("my-notifications")]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                return Unauthorized(new { Message = "Vui lòng đăng nhập." });

            var notifications = await _mediator.Send(new GetMyNotificationsQuery(currentUserId));
            return Ok(notifications);
        }

        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                return Unauthorized(new { Message = "Vui lòng đăng nhập." });

            var success = await _mediator.Send(new MarkNotificationAsReadCommand(id, currentUserId));
            if (success) return Ok(new { Message = "Đã đánh dấu là đã đọc." });
            
            return BadRequest(new { Message = "Không thể cập nhật thông báo." });
        }

        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                return Unauthorized(new { Message = "Vui lòng đăng nhập." });

            var updatedCount = await _mediator.Send(new MarkAllNotificationsAsReadCommand(currentUserId));
            return Ok(new { Message = $"Đã đánh dấu {updatedCount} thông báo là đã đọc." });
        }
    }
}