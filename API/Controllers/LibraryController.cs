using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("api/library")]
    [Authorize]
    public class LibraryController : ControllerBase
    {
        private readonly ILibraryRepository _library;

        public LibraryController(ILibraryRepository library)
        {
            _library = library;
        }

        private int GetCurrentUserId()
        {
            var idClaim = User.FindFirst("id")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : 0;
        }

        
        [HttpGet("albums")]
        public async Task<IActionResult> GetSavedAlbums()
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var albums = await _library.GetSavedAlbumsAsync(userId);
            return Ok(albums);
        }

        
        [HttpGet("albums/{albumId}/status")]
        public async Task<IActionResult> GetAlbumStatus(int albumId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var isSaved = await _library.IsAlbumSavedAsync(userId, albumId);
            return Ok(new { isSaved });
        }

        
        [HttpPost("albums/{albumId}")]
        public async Task<IActionResult> SaveAlbum(int albumId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            await _library.SaveAlbumAsync(userId, albumId);
            return Ok(new { message = "Album đã được thêm vào thư viện." });
        }

        
        [HttpDelete("albums/{albumId}")]
        public async Task<IActionResult> RemoveAlbum(int albumId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            await _library.RemoveAlbumAsync(userId, albumId);
            return Ok(new { message = "Album đã được xóa khỏi thư viện." });
        }
    }
}
