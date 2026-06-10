using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;
using Application.DTOs;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlaylistsController : ControllerBase
    {
        private readonly IPlaylistService _playlistService;

        public PlaylistsController(IPlaylistService playlistService)
        {
            _playlistService = playlistService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPlaylists()
        {
            var playlists = await _playlistService.GetAllPlaylistsAsync();
            return Ok(playlists);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPlaylistById(int id)
        {
            var playlist = await _playlistService.GetPlaylistByIdAsync(id);
            return playlist == null ? NotFound() : Ok(playlist);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserPlaylists(int userId)
        {
            var playlists = await _playlistService.GetPlaylistsByUserIdAsync(userId);
            return Ok(playlists);
        }

        [HttpPost("user/{userId}")]
        public async Task<IActionResult> CreatePlaylist(int userId, [FromBody] Application.DTOs.CreatePlaylistDTO dto)
        {
            try
            {
                var playlist = await _playlistService.CreatePlaylistAsync(userId, dto);
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
            var success = await _playlistService.AddSongToPlaylistAsync(id, songId);
            if (!success) return BadRequest("Không thể thêm bài hát vào Playlist (có thể bài hát đã tồn tại hoặc Playlist không đúng)");
            return Ok(new { message = "Thêm bài hát thành công" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlaylist(int id)
        {
            var success = await _playlistService.DeletePlaylistAsync(id);
            if (!success) return NotFound("Không tìm thấy Playlist để xóa hoặc có lỗi xảy ra");
            return Ok(new { message = "Xóa Playlist thành công" });
        }

        [HttpDelete("{id}/songs/{songId}")]
        public async Task<IActionResult> RemoveSongFromPlaylist(int id, int songId)
        {
            var success = await _playlistService.RemoveSongFromPlaylistAsync(id, songId);
            if (!success) return BadRequest("Không thể xóa bài hát khỏi Playlist");
            return Ok(new { message = "Xóa bài hát thành công" });
        }

        [HttpGet("user/{userId}/contains/{songId}")]
        public async Task<IActionResult> GetPlaylistsContainingSong(int userId, int songId)
        {
            var playlistIds = await _playlistService.GetPlaylistsContainingSongAsync(userId, songId);
            return Ok(playlistIds);
        }
    }
}