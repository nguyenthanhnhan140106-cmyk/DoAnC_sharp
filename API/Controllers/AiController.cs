using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Features.AI.Queries;
using Application.Features.AI.Commands;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class AiController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AiController(IMediator mediator)
        {
            _mediator = mediator;
        }
        
        [HttpPost("chat")]
        public async Task Chat([FromBody] ChatRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                Response.StatusCode = 400;
                await Response.WriteAsJsonAsync(new { error = "Tin nhắn không được để trống." });
                return;
            }

            Response.ContentType = "text/event-stream";
            
            var query = new ChatQuery(request.History ?? new System.Collections.Generic.List<MessageDTO>(), request.Message);
            var stream = _mediator.CreateStream(query);

            await foreach (var chunk in stream)
            {
                var dataStr = chunk.Replace("\n", "\\n"); 
                await Response.WriteAsync($"data: {dataStr}\n\n");
                await Response.Body.FlushAsync();
            }

            await Response.WriteAsync("data: [DONE]\n\n");
            await Response.Body.FlushAsync();
        }

        [HttpPost("auto-tag/{songId}")]
        public async Task<IActionResult> AutoTag(int songId)
        {
            try
            {
                var command = new AutoTagCommand(songId);
                var tags = await _mediator.Send(command);
                return Ok(new { success = true, tags });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }
    }
}
