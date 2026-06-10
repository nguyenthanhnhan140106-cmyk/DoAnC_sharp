using API.Hubs;
using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/media-shares")]
    public class MediaSharesController : ControllerBase
    {
        private readonly ShareMediaService _shareMediaService;
        private readonly IHubContext<NotificationHub> _hubContext;

        public MediaSharesController(
            ShareMediaService shareMediaService,
            IHubContext<NotificationHub> hubContext)
        {
            _shareMediaService = shareMediaService;
            _hubContext = hubContext;
        }

        [HttpPost]
        public async Task<IActionResult> Share([FromBody] ShareMediaRequestDTO dto)
        {
            try
            {
                var senderUserId = GetCurrentUserId();
                if (senderUserId <= 0) return Unauthorized(new { message = "Bạn cần đăng nhập." });

                var result = await _shareMediaService.ShareAsync(senderUserId, dto);

                await _hubContext.Clients
                    .Group($"user-{result.Share.ReceiverUserId}")
                    .SendAsync("ReceiveNotification", result.Notification);

                return Ok(result.Share);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi chia sẻ media: {ex.Message}" });
            }
        }

        [HttpGet("received")]
        public async Task<IActionResult> GetReceived()
        {
            var userId = GetCurrentUserId();
            if (userId <= 0) return Unauthorized(new { message = "Bạn cần đăng nhập." });

            var data = await _shareMediaService.GetReceivedAsync(userId);
            return Ok(data);
        }

        [HttpGet("sent")]
        public async Task<IActionResult> GetSent()
        {
            var userId = GetCurrentUserId();
            if (userId <= 0) return Unauthorized(new { message = "Bạn cần đăng nhập." });

            var data = await _shareMediaService.GetSentAsync(userId);
            return Ok(data);
        }

        private int GetCurrentUserId()
        {
            var rawId = User.FindFirst("id")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return int.TryParse(rawId, out var id) ? id : 0;
        }
    }
}
