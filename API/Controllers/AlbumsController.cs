using System.Threading.Tasks;
using Application.Features.Albums.Queries;
using Application.Features.Songs.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlbumsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AlbumsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAlbums()
        {
            var albums = await _mediator.Send(new GetAllAlbumsQuery());
            return Ok(albums);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAlbumDetails(int id)
        {
            var album = await _mediator.Send(new GetAlbumByIdQuery(id));
            if (album == null)
                return NotFound(new { message = $"Không tìm thấy Album với mã Id = {id}" });
            return Ok(album);
        }
    }
}