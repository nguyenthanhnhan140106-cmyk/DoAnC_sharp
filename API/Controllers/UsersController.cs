using Application.DTOs;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using System.Security.Claims;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly string _connectionString;

        public UsersController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var currentUserId = GetCurrentUserId();
            using var conn = new MySqlConnection(_connectionString);

            var users = await conn.QueryAsync<ShareUserDTO>(@"
                SELECT Id, Username, Email
                FROM users
                WHERE Id <> @CurrentUserId
                ORDER BY Username;",
                new { CurrentUserId = currentUserId });

            return Ok(users);
        }

        private int GetCurrentUserId()
        {
            var rawId = User.FindFirst("id")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return int.TryParse(rawId, out var id) ? id : 0;
        }
    }
}
