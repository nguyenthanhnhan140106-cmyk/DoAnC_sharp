// API/Controllers/SongsController.cs
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
        private readonly Application.Interfaces.ICloudinaryService _cloudinaryService;

        public SongsController(IMediator mediator, Application.Interfaces.ICloudinaryService cloudinaryService)
        {
            _mediator = mediator;
            _cloudinaryService = cloudinaryService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll() =>
            Ok(await _mediator.Send(new GetAllSongsQuery()));

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var song = await _mediator.Send(new GetSongByIdQuery(id));
            return song == null ? NotFound() : Ok(song);
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
            var userIdClaim = User.FindFirst("id")?.Value;
            int? userId = null;
            if (int.TryParse(userIdClaim, out int uid)) userId = uid;

            // Upload files to Cloudinary
            string? audioUrl = null;
            if (request.AudioFile != null)
            {
                using var stream = request.AudioFile.OpenReadStream();
                audioUrl = await _cloudinaryService.UploadAudioAsync(stream, request.AudioFile.FileName);
            }

            string? videoUrl = null;
            if (request.VideoFile != null)
            {
                using var stream = request.VideoFile.OpenReadStream();
                videoUrl = await _cloudinaryService.UploadVideoAsync(stream, request.VideoFile.FileName);
            }

            string? coverUrl = null;
            if (request.CoverFile != null)
            {
                using var stream = request.CoverFile.OpenReadStream();
                coverUrl = await _cloudinaryService.UploadImageAsync(stream, request.CoverFile.FileName);
            }

            var dto = new CreateSongDTO
            {
                Title = request.Title,
                Artist = request.Artist,
                CategoryId = request.CategoryId,
                CategoryName = request.CategoryName,
                LyricsUrl = request.LyricsUrl,
                ArtistId = request.ArtistId,
                UploaderId = userId,
                AudioUrl = audioUrl,
                VideoUrl = videoUrl,
                CoverUrl = coverUrl
            };

            var song = await _mediator.Send(new CreateSongCommand(dto));
            return CreatedAtAction(nameof(GetById), new { id = song.Id }, song);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSongDTO dto)
        {
            var song = await _mediator.Send(new UpdateSongCommand(id, dto));
            return song == null ? NotFound() : Ok(song);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _mediator.Send(new DeleteSongCommand(id));
            return result ? NoContent() : NotFound();
        }

        [HttpGet("user/{uploaderId}")]
        public async Task<IActionResult> GetByUploader(int uploaderId)
        {
            var songs = await _mediator.Send(new GetSongsByUploaderQuery(uploaderId));
            return Ok(songs);
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
