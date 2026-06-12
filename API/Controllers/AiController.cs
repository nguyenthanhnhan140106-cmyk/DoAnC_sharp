using Application.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Application.DTOs;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // → POST http://localhost:5000/api/ai/chat
    public class AiController : ControllerBase
    {
        private readonly AiService _aiService;

        public AiController(AiService aiService)
        {
            _aiService = aiService;
        }

        /// <summary>
        /// POST /api/ai/chat
        /// Body: { "message": "...", "history": [ { "role": "user"|"bot", "text": "..." } ] }
        /// </summary>
        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest(new { error = "Tin nhắn không được để trống." });

            var result = await _aiService.ChatAsync(request);
            return Ok(result);
        }

        /// <summary>
        /// POST /api/ai/auto-tag/{songId}
        /// Phân loại tự động (Auto-tagging) bài hát
        /// </summary>
        [HttpPost("auto-tag/{songId}")]
        public async Task<IActionResult> AutoTag(int songId)
        {
            try
            {
                var tags = await _aiService.AutoTagSongAsync(songId);
                return Ok(new { success = true, tags });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }
    }
}
