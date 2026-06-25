using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Application.Features.History.Commands;
using Application.Features.History.Queries;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] 
    public class HistoryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public HistoryController(IMediator mediator)
        {
            _mediator = mediator;
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

        
        [HttpPost("played/{songId}")]
        public async Task<IActionResult> AddToHistory(int songId)
        {
            await _mediator.Send(new AddToHistoryCommand(UserId, songId));
            return Ok(new { message = "Đã thêm vào lịch sử nghe", songId });
        }

        
        [HttpGet("recent")]
        public async Task<IActionResult> GetRecent([FromQuery] int limit = 10)
        {
            var songs = await _mediator.Send(new GetRecentHistoryQuery(UserId, limit));
            return Ok(songs);
        }
    }
}