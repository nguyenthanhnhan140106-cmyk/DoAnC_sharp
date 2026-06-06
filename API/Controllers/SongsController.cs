// API/Controllers/SongsController.cs
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SongsController : ControllerBase
    {
        private readonly ISongService _songService;

        public SongsController(ISongService songService)
        {
            _songService = songService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _songService.GetAllSongsAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var song = await _songService.GetByIdAsync(id);
            return song == null ? NotFound() : Ok(song);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return Ok(new List<SongDTO>());
            return Ok(await _songService.SearchAsync(q));
        }

        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetByCategory(string category) =>
            Ok(await _songService.GetByCategoryAsync(category));

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSongDTO dto)
        {
            var song = await _songService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = song.Id }, song);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSongDTO dto)
        {
            var song = await _songService.UpdateAsync(id, dto);
            return song == null ? NotFound() : Ok(song);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _songService.DeleteAsync(id);
            return result ? NoContent() : NotFound();
        }
    }
}