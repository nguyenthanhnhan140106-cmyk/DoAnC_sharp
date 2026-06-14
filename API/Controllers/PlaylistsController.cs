using Microsoft.AspNetCore.Mvc;
using MediatR;
using Application.DTOs;
using Application.Features.Playlists.Commands;
using Application.Features.Playlists.Queries;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlaylistsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PlaylistsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetPlaylists()
        {
            var playlists = await _mediator.Send(new GetAllPlaylistsQuery());
            return Ok(playlists);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPlaylistById(int id)
        {
            var playlist = await _mediator.Send(new GetPlaylistByIdQuery(id));
            if (playlist == null) return NotFound();

            if (!playlist.IsPublic)
            {
                var userIdClaim = User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId) || currentUserId != playlist.UserId)
                {
                    return Unauthorized("Playlist này đã được cài đặt riêng tư.");
                }
            }

            return Ok(playlist);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserPlaylists(int userId)
        {
            var playlists = await _mediator.Send(new GetUserPlaylistsQuery(userId));
            return Ok(playlists);
        }

        [HttpPost("user/{userId}")]
        public async Task<IActionResult> CreatePlaylist(int userId, [FromBody] Application.DTOs.CreatePlaylistDTO dto)
        {
            try
            {
                var playlist = await _mediator.Send(new CreatePlaylistCommand(userId, dto));
                return CreatedAtAction(nameof(GetPlaylistById), new { id = playlist.Id }, playlist);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{id}/songs/{songId}")]
        public async Task<IActionResult> AddSongToPlaylist(int id, int songId)
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                return Unauthorized("Vui lòng đăng nhập.");

            var success = await _mediator.Send(new AddSongToPlaylistCommand(id, songId, currentUserId));
            if (!success) return BadRequest("Không thể thêm bài hát vào Playlist (có thể bài hát đã tồn tại hoặc Playlist không đúng)");
            return Ok(new { message = "Thêm bài hát thành công" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlaylist(int id)
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                return Unauthorized("Vui lòng đăng nhập.");

            var success = await _mediator.Send(new DeletePlaylistCommand(id, currentUserId));
            if (!success) return NotFound("Không tìm thấy Playlist để xóa hoặc có lỗi xảy ra");
            return Ok(new { message = "Xóa Playlist thành công" });
        }

        [HttpDelete("{id}/songs/{songId}")]
        public async Task<IActionResult> RemoveSongFromPlaylist(int id, int songId)
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                return Unauthorized("Vui lòng đăng nhập.");

            var success = await _mediator.Send(new RemoveSongFromPlaylistCommand(id, songId, currentUserId));
            if (!success) return BadRequest("Không thể xóa bài hát khỏi Playlist");
            return Ok(new { message = "Xóa bài hát thành công" });
        }

        [HttpPut("{id}/privacy")]
        public async Task<IActionResult> TogglePlaylistPrivacy(int id, [FromBody] bool isPublic)
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                return Unauthorized("Vui lòng đăng nhập.");

            var success = await _mediator.Send(new TogglePlaylistPrivacyCommand(id, currentUserId, isPublic));
            if (!success) return BadRequest("Không thể cập nhật trạng thái riêng tư");
            return Ok(new { message = "Cập nhật thành công" });
        }

        [HttpGet("user/{userId}/contains/{songId}")]
        public async Task<IActionResult> GetPlaylistsContainingSong(int userId, int songId)
        {
            var playlistIds = await _mediator.Send(new GetPlaylistsContainingSongQuery(userId, songId));
            return Ok(playlistIds);
        }
    }
}