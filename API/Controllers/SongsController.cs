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

        public SongsController(IMediator mediator)
        {
            _mediator = mediator;
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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSongDTO dto)
        {
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
    }
}
