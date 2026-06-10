using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using MySqlConnector;

namespace Infrastructure.Repositories
{
    public class HistoryRepository : IHistoryRepository
    {
        private readonly string _connectionString;

        public HistoryRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task AddToHistoryAsync(int userId, int songId)
        {
            try
            {
                using (var conn = new MySqlConnection(_connectionString))
                {
                    await conn.OpenAsync();
                    using (var cmd = conn.CreateCommand())
                    {
                        cmd.CommandText = @"
                            INSERT INTO user_history (UserId, SongId, PlayedAt)
                            VALUES (@userId, @songId, NOW())";
                        cmd.Parameters.AddWithValue("@userId", userId);
                        cmd.Parameters.AddWithValue("@songId", songId);
                        await cmd.ExecuteNonQueryAsync();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding to history: {ex.Message}");
                throw;
            }
        }

        public async Task<IEnumerable<SongDTO>> GetRecentAsync(int userId, int limit = 10)
        {
            var songs = new List<SongDTO>();

            try
            {
                using (var conn = new MySqlConnection(_connectionString))
                {
                    await conn.OpenAsync();
                    using (var cmd = conn.CreateCommand())
                    {
                        cmd.CommandText = @"
                            SELECT DISTINCT s.Id, s.Title, s.Artist, s.CoverUrl, s.AudioUrl
                            FROM user_history uh
                            INNER JOIN songs s ON uh.SongId = s.Id
                            WHERE uh.UserId = @userId
                            ORDER BY uh.PlayedAt DESC
                            LIMIT @limit";
                        cmd.Parameters.AddWithValue("@userId", userId);
                        cmd.Parameters.AddWithValue("@limit", limit);

                        using (var reader = await cmd.ExecuteReaderAsync())
                        {
                            var idOrd = reader.GetOrdinal("Id");
                            var titleOrd = reader.GetOrdinal("Title");
                            var artistOrd = reader.GetOrdinal("Artist");
                            var coverOrd = reader.GetOrdinal("CoverUrl");
                            var audioOrd = reader.GetOrdinal("AudioUrl");

                            while (await reader.ReadAsync())
                            {
                                songs.Add(new SongDTO
                                {
                                    Id = reader.IsDBNull(idOrd) ? 0 : reader.GetInt32(idOrd),
                                    Title = reader.IsDBNull(titleOrd) ? string.Empty : reader.GetString(titleOrd),
                                    Artist = reader.IsDBNull(artistOrd) ? string.Empty : reader.GetString(artistOrd),
                                    CoverUrl = reader.IsDBNull(coverOrd) ? string.Empty : reader.GetString(coverOrd),
                                    AudioUrl = reader.IsDBNull(audioOrd) ? string.Empty : reader.GetString(audioOrd)
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting recent songs: {ex.Message}");
                throw;
            }

            return songs;
        }
    }
}
