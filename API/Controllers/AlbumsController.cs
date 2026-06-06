using System.Threading.Tasks;
using Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // 🟢 Đường dẫn gốc: http://localhost:5000/api/albums
    public class AlbumsController : ControllerBase
    {
        private readonly AlbumService _albumService;

        public AlbumsController(AlbumService albumService)
        {
            _albumService = albumService;
        }

        // 🟢 1. HÀM MỚI BỔ SUNG: Lấy toàn bộ danh sách Album đổ ra trang chủ
        // Đường dẫn gọi: GET http://localhost:5000/api/albums
        [HttpGet]
        public async Task<IActionResult> GetAllAlbums()
        {
            // Gọi xuống Service để xử lý câu lệnh SQL bốc danh sách album
            var albums = await _albumService.GetAllAlbumsAsync();
            
            return Ok(albums); // Trả về mảng JSON chứa các album cho React
        }

        // 2. HÀM CŨ: Lấy chi tiết 1 album kèm 10 bài hát bên trong khi click vào card
        // Đường dẫn gọi: GET http://localhost:5000/api/albums/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAlbumDetails(int id)
        {
            var album = await _albumService.GetAlbumDetailsAsync(id);
            
            if (album == null)
            {
                return NotFound(new { message = $"Không tìm thấy Album với mã Id = {id} nhen Nam!" });
            }

            return Ok(album); 
        }
    }
}