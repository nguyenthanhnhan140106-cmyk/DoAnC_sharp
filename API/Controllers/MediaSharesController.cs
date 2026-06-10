using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/media-shares")]
    public class MediaSharesController : ControllerBase
    {
        private readonly ShareMediaService _shareMediaService;

        public MediaSharesController(ShareMediaService shareMediaService)
        {
            _shareMediaService = shareMediaService;
        }

        [HttpPost]
        public async Task<IActionResult> Share([FromBody] ShareMediaRequestDTO dto)
        {
            try
            {
                var result = await _shareMediaService.ShareAsync(dto);
                return Ok(result);
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

        [HttpGet("received/{userId:int}")]
        public async Task<IActionResult> GetReceived(int userId)
        {
            var data = await _shareMediaService.GetReceivedAsync(userId);
            return Ok(data);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _shareMediaService.GetByIdAsync(id);
            return data == null
                ? NotFound(new { message = "Không tìm thấy chia sẻ." })
                : Ok(data);
        }
    }
}
