using Microsoft.AspNetCore.Mvc;
using Application.Services;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly AiService _aiService;

        public ChatbotController(AiService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest("Tin nhắn không được để trống.");
            }

            // Gọi service AI để xử lý câu hỏi
            var response = await _aiService.ChatAsync(request);

            if (!response.Success)
            {
                // Trả về lỗi nhưng vẫn kèm theo fallback reply nếu có
                return Ok(response);
            }

            return Ok(response);
        }
    }
}
