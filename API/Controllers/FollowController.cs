using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Application.Features.Follows.Commands;
using Application.Features.Follows.Queries;
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using API.Hubs;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FollowController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IHubContext<NotificationHub> _hubContext;

        public FollowController(IMediator mediator, IHubContext<NotificationHub> hubContext)
        {
            _mediator = mediator;
            _hubContext = hubContext;
        }

        private int GetUserId()
        {
            var idClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            return idClaim != null ? int.Parse(idClaim.Value) : 0;
        }

        
        [HttpPost("{artistId:int}")]
        public async Task<IActionResult> Follow(int artistId)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();
            await _mediator.Send(new FollowArtistCommand(userId, artistId));
            return Ok(new { message = "Added to your library" });
        }

        
        [HttpDelete("{artistId:int}")]
        public async Task<IActionResult> Unfollow(int artistId)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();
            await _mediator.Send(new UnfollowArtistCommand(userId, artistId));
            return Ok(new { message = "Removed from your library" });
        }

        
        [HttpGet("check/{artistId:int}")]
        public async Task<IActionResult> Check(int artistId)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();
            var isFollowing = await _mediator.Send(new CheckArtistFollowQuery(userId, artistId));
            return Ok(new { isFollowing });
        }

        
        [HttpGet("following")]
        public async Task<IActionResult> GetFollowing()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var artists = await _mediator.Send(new GetFollowingArtistsQuery(userId));
            return Ok(artists);
        }

        
        [HttpPost("user/{targetUserId:int}")]
        public async Task<IActionResult> FollowUser(int targetUserId)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();
            if (userId == targetUserId) return BadRequest("Cannot follow yourself.");

            var followerName = User.FindFirst("name")?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value ?? "Một người dùng";

            var result = await _mediator.Send(new FollowUserCommand(userId, targetUserId, followerName));
            if (result)
            {
                await _hubContext.Clients.User(targetUserId.ToString()).SendAsync("ReceiveNotification");
            }

            return Ok(new { Message = "Followed user successfully" });
        }

        
        [HttpDelete("user/{targetUserId:int}")]
        public async Task<IActionResult> UnfollowUser(int targetUserId)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            await _mediator.Send(new UnfollowUserCommand(userId, targetUserId));
            return Ok(new { Message = "Unfollowed user successfully" });
        }

        
        [HttpGet("user/{targetUserId:int}/status")]
        public async Task<IActionResult> CheckUserFollowStatus(int targetUserId)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var isFollowing = await _mediator.Send(new CheckUserFollowQuery(userId, targetUserId));
            return Ok(new { IsFollowing = isFollowing });
        }

        
        [HttpGet("user/following")]
        public async Task<IActionResult> GetFollowingUsers()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var users = await _mediator.Send(new GetFollowingUsersQuery(userId));
            return Ok(users);
        }

        
        [HttpGet("user/{targetUserId:int}/followers")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserFollowers(int targetUserId)
        {
            var users = await _mediator.Send(new GetUserFollowersQuery(targetUserId));
            return Ok(users);
        }

        
        [HttpGet("user/{targetUserId:int}/following")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserFollowing(int targetUserId)
        {
            var users = await _mediator.Send(new GetFollowingUsersQuery(targetUserId));
            return Ok(users);
        }

        
        [HttpGet("user/{targetUserId:int}/following-artists")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserFollowingArtists(int targetUserId)
        {
            var artists = await _mediator.Send(new GetFollowingArtistsQuery(targetUserId));
            return Ok(artists);
        }
    }
}
