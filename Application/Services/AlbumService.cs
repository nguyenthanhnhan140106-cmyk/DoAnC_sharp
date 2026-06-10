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

        // Lấy toàn bộ danh sách Album
        public async Task<IEnumerable<AlbumDTO>> GetAllAlbumsAsync()
        {
            using var conn = new MySqlConnection(_connectionString);
            
            var sql = @"
                SELECT a.Id, a.Title, a.CoverUrl, 
                       COALESCE(art.Name, 'Various Artists') AS ArtistName 
                FROM albums a
                LEFT JOIN artists art ON a.ArtistId = art.Id
                ORDER BY a.Id DESC;";
                
            return await conn.QueryAsync<AlbumDTO>(sql);
        }

        // Lấy chi tiết 1 album kèm danh sách bài hát
        public async Task<AlbumDTO?> GetAlbumDetailsAsync(int albumId)
        {
            using var conn = new MySqlConnection(_connectionString);
            
            var sql = @"
                SELECT a.Id, a.Title, a.CoverUrl, 
                       COALESCE(art.Name, 'Various Artists') AS ArtistName 
                FROM albums a
                LEFT JOIN artists art ON a.ArtistId = art.Id
                WHERE a.Id = @Id;

                SELECT s.Id, s.Title, s.Artist, s.CoverUrl, s.AudioUrl, s.Category, s.VideoUrl, s.ArtistBanner, s.ArtistId
                FROM songs s
                JOIN album_songs als ON s.Id = als.SongId
                WHERE als.AlbumId = @Id
                ORDER BY als.OrderNumber ASC;";

            using var multi = await conn.QueryMultipleAsync(sql, new { Id = albumId });
            
            var album = await multi.ReadFirstOrDefaultAsync<AlbumDTO>();
            if (album == null) return null;
            
            album.Songs = (await multi.ReadAsync<SongDTO>()).ToList();
            return album;
        }
    }
}
