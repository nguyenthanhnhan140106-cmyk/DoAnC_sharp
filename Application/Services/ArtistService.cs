using Application.Interfaces;
using Application.DTOs;
using Dapper;
using MySqlConnector;

namespace Application.Services
{
    public class ArtistService : IArtistService
    {
        private readonly string _connectionString;

        public ArtistService(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task<IEnumerable<ArtistDTO>> GetAllArtistsAsync()
        {
            using var conn = new MySqlConnection(_connectionString);
            return await conn.QueryAsync<ArtistDTO>(
                "SELECT Id, Name, Bio, ImageUrl FROM artists"
            );
        }

        public async Task<ArtistDTO?> GetArtistByIdAsync(int id)
        {
            using var conn = new MySqlConnection(_connectionString);
            return await conn.QueryFirstOrDefaultAsync<ArtistDTO>(
                "SELECT Id, Name, Bio, ImageUrl FROM artists WHERE Id = @Id",
                new { Id = id }
            );
        }
    }
}