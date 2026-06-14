using Application.Interfaces;
using Application.DTOs;
using Dapper;
using Microsoft.Data.SqlClient;

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
            using var conn = new SqlConnection(_connectionString);
            return await conn.QueryAsync<ArtistDTO>(
                "SELECT Id, Name, Bio, WorldRank, Followers, MonthlyListeners, IsVerified, BannerUrl FROM artists"
            );
        }

        public async Task<ArtistDTO?> GetArtistByIdAsync(int id)
        {
            using var conn = new SqlConnection(_connectionString);
            return await conn.QueryFirstOrDefaultAsync<ArtistDTO>(
                "SELECT Id, Name, Bio, WorldRank, Followers, MonthlyListeners, IsVerified, BannerUrl FROM artists WHERE Id = @Id",
                new { Id = id }
            );
        }
    }
}
