using Microsoft.AspNetCore.Mvc;
using MediatR;
using Application.Features.Users.Queries;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UsersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // API: GET http://localhost:5104/api/Users
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _mediator.Send(new GetAllUsersQuery());
                return Ok(users); 
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống Backend: {ex.Message}");
            }
        }

        // API: GET http://localhost:5104/api/Users/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var user = await _mediator.Send(new GetProfileQuery(id));
                if (user == null) return NotFound("User not found.");
                return Ok(user);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống Backend: {ex.Message}");
            }
        }
    }
}