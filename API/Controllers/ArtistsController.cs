using Microsoft.AspNetCore.Mvc;
using Application.DTOs;
using Application.Features.Artists.Queries;
using Application.Features.Songs.Queries;
using MediatR;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArtistsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ArtistsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetArtists()
        {
            var artists = await _mediator.Send(new GetAllArtistsQuery());
            return Ok(artists);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetArtist(int id)
        {
            var artist = await _mediator.Send(new GetArtistByIdQuery(id));
            if (artist == null) return NotFound("Không tìm thấy nghệ sĩ này");
            return Ok(artist);
        }

        [HttpGet("{id}/songs")]
        public async Task<IActionResult> GetSongsByArtist(int id)
        {
            var songs = await _mediator.Send(new GetSongsByArtistQuery(id));
            return Ok(songs);
        }
    }
}