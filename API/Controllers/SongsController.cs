
using Application.DTOs;
using Application.Features.Songs.Queries;
using Application.Features.Songs.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SongsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IHttpClientFactory _httpClientFactory;

        public SongsController(IMediator mediator, IHttpClientFactory httpClientFactory)
        {
            _mediator = mediator;
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var songs = await _mediator.Send(new GetAllSongsQuery());
            return Ok(ApiResponse<IEnumerable<SongDTO>>.Ok(songs));
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var song = await _mediator.Send(new GetSongByIdQuery(id));
            if (song == null) return NotFound(ApiResponse.Fail("Không tìm thấy bài hát"));
            return Ok(ApiResponse<SongDTO>.Ok(song));
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return Ok(new List<SongDTO>());
            return Ok(await _mediator.Send(new SearchSongsQuery(q)));
        }

        [HttpGet("category/{category}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByCategory(string category) =>
            Ok(await _mediator.Send(new GetSongsByCategoryQuery(category)));

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreateSongFormRequest request)
        {
            
            const long maxFileSize = 100 * 1024 * 1024;
            if (request.AudioFile?.Length > maxFileSize)
                return BadRequest(new { success = false, message = "File audio vượt quá giới hạn 100MB." });
            if (request.VideoFile?.Length > maxFileSize)
                return BadRequest(new { success = false, message = "File video vượt quá giới hạn 100MB." });
            if (request.CoverFile?.Length > maxFileSize)
                return BadRequest(new { success = false, message = "Ảnh bìa vượt quá giới hạn 100MB." });

            var userIdClaim = User.FindFirst("id")?.Value;
            int? userId = null;
            if (int.TryParse(userIdClaim, out int uid)) userId = uid;

            var command = new Application.Features.Songs.Commands.UploadSongCommand(
                Title: request.Title,
                Artist: request.Artist,
                CategoryId: request.CategoryId,
                CategoryName: request.CategoryName,
                LyricsUrl: request.LyricsUrl,
                ArtistId: request.ArtistId,
                UploaderId: userId,
                AudioStream: request.AudioFile?.OpenReadStream(),
                AudioFileName: request.AudioFile?.FileName,
                VideoStream: request.VideoFile?.OpenReadStream(),
                VideoFileName: request.VideoFile?.FileName,
                CoverStream: request.CoverFile?.OpenReadStream(),
                CoverFileName: request.CoverFile?.FileName
            );

            var song = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = song.Id }, song);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSongDTO dto)
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                return Unauthorized("Vui lòng đăng nhập.");

            var songToUpdate = await _mediator.Send(new GetSongByIdQuery(id));
            if (songToUpdate == null) return NotFound();
            if (songToUpdate.UploaderId != currentUserId) return Unauthorized("Bạn không có quyền sửa bài hát này.");

            var song = await _mediator.Send(new UpdateSongCommand(id, dto));
            return song == null ? NotFound() : Ok(song);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                return Unauthorized("Vui lòng đăng nhập.");

            var songToDelete = await _mediator.Send(new GetSongByIdQuery(id));
            if (songToDelete == null) return NotFound();
            if (songToDelete.UploaderId != currentUserId) return Unauthorized("Bạn không có quyền xóa bài hát này.");

            var result = await _mediator.Send(new DeleteSongCommand(id));
            return result ? NoContent() : NotFound();
        }

        [HttpGet("user/{uploaderId}")]
        public async Task<IActionResult> GetByUploader(int uploaderId)
        {
            var songs = await _mediator.Send(new GetSongsByUploaderQuery(uploaderId));
            return Ok(songs);
        }

        [HttpGet("{id}/stream")]
        [AllowAnonymous]
        public async Task<IActionResult> StreamAudio(int id)
        {
            var song = await _mediator.Send(new GetSongByIdQuery(id));
            if (song == null || string.IsNullOrEmpty(song.AudioUrl)) return NotFound(ApiResponse.Fail("Không tìm thấy luồng âm thanh."));

            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync(song.AudioUrl, HttpCompletionOption.ResponseHeadersRead);
            if (!response.IsSuccessStatusCode) return NotFound();

            var stream = await response.Content.ReadAsStreamAsync();
            var contentType = response.Content.Headers.ContentType?.MediaType ?? "audio/mpeg";

            return File(stream, contentType, enableRangeProcessing: true);
        }

        [HttpGet("{id}/video-stream")]
        [AllowAnonymous]
        public async Task<IActionResult> StreamVideo(int id)
        {
            var song = await _mediator.Send(new GetSongByIdQuery(id));
            if (song == null || string.IsNullOrEmpty(song.VideoUrl)) return NotFound(ApiResponse.Fail("Không tìm thấy luồng video."));

            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync(song.VideoUrl, HttpCompletionOption.ResponseHeadersRead);
            if (!response.IsSuccessStatusCode) return NotFound();

            var stream = await response.Content.ReadAsStreamAsync();
            var contentType = response.Content.Headers.ContentType?.MediaType ?? "video/mp4";

            return File(stream, contentType, enableRangeProcessing: true);
        }
    }

    public class CreateSongFormRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? LyricsUrl { get; set; }
        public int? ArtistId { get; set; }

        public IFormFile? AudioFile { get; set; }
        public IFormFile? VideoFile { get; set; }
        public IFormFile? CoverFile { get; set; }
    }
}
