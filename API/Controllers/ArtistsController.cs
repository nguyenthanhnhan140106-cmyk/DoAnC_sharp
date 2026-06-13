using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;
using Application.DTOs;
using MediatR;
using Application.Features.Songs.Queries;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArtistsController : ControllerBase
    {
        private readonly IArtistService _artistService;

        public ArtistsController(IArtistService artistService)
        {
            _artistService = artistService;
        }

        [HttpGet]
        public async Task<IActionResult> GetArtists()
        {
            var artists = await _artistService.GetAllArtistsAsync();
            return Ok(artists);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetArtist(int id)
        {
            var artist = await _artistService.GetArtistByIdAsync(id);
            if (artist == null) return NotFound("Không tìm thấy nghệ sĩ này");
            return Ok(artist);
        }

        [HttpGet("{id}/songs")]
        public async Task<IActionResult> GetSongsByArtist(int id, [FromServices] IMediator mediator)
        {
            var songs = await mediator.Send(new GetSongsByArtistQuery(id));
            return Ok(songs);
        }
    }
}