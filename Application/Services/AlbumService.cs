using System.Linq;
using System.Threading.Tasks;
using Application.DTOs;
using Dapper;
using MySqlConnector;

namespace Application.Services
{
    public class AlbumService
    {
        private readonly string _connectionString;

        public AlbumService(string connectionString)
        {
            _connectionString = connectionString;
        }

        // 🟢 Bổ sung hàm này vào bên trong file AlbumService.cs của cậu
        public async Task<IEnumerable<AlbumDTO>> GetAllAlbumsAsync()
        {
            using var conn = new MySqlConnection(_connectionString);
            
            // Câu lệnh SQL bốc thông tin Album kết hợp lấy Tên ca sĩ sở hữu từ bảng artists
            var sql = @"
                SELECT a.Id, a.Title, a.CoverUrl, art.Name AS ArtistName 
                FROM albums a
                JOIN artists art ON a.ArtistId = art.Id
                ORDER BY a.Id DESC;";
                
            return await conn.QueryAsync<AlbumDTO>(sql);
        }

        public async Task<AlbumDTO?> GetAlbumDetailsAsync(int albumId)
        {
            using var conn = new MySqlConnection(_connectionString);
            
            // Lệnh SQL kép: Câu 1 lấy thông tin Album, Câu 2 lấy 10 bài hát của Album đó
            var sql = @"
                SELECT a.Id, a.Title, a.CoverUrl, art.Name AS ArtistName 
                FROM albums a
                JOIN artists art ON a.ArtistId = art.Id
                WHERE a.Id = @Id;

                SELECT s.Id, s.Title, s.Artist, s.CoverUrl, s.AudioUrl, s.Category
                FROM songs s
                JOIN album_songs als ON s.Id = als.SongId
                WHERE als.AlbumId = @Id
                ORDER BY als.OrderNumber ASC;";

            // Thực thi SQL kép chạy ngầm qua đường ống kết nối
            using var multi = await conn.QueryMultipleAsync(sql, new { Id = albumId });
            
            // Đọc tập dữ liệu thứ nhất (Thông tin Album)
            var album = await multi.ReadFirstOrDefaultAsync<AlbumDTO>();
            
            if (album != null)
            {
                // Đọc tập dữ liệu thứ hai (Danh sách bài hát) rồi gán thẳng vào Object Album
                var songs = await multi.ReadAsync<SongDTO>();
                album.Songs = songs.ToList();
            }

            return album;
        }
    }
}