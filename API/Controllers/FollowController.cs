using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Application.Features.Follows.Commands;
using Application.Features.Follows.Queries;
using System.Security.Claims;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FollowController : ControllerBase
    {
        private readonly IMediator _mediator;

        public FollowController(IMediator mediator)
        {
            _mediator = mediator;
        }

        private int GetUserId()
        {
            var idClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            return idClaim != null ? int.Parse(idClaim.Value) : 0;
        }

        // POST /api/follow/{artistId} — Follow một Artist
        [HttpPost("{artistId:int}")]
        public async Task<IActionResult> Follow(int artistId)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();
            await _mediator.Send(new FollowArtistCommand(userId, artistId));
            return Ok(new { message = "Added to your library" });
        }

        // DELETE /api/follow/{artistId} — Unfollow
        [HttpDelete("{artistId:int}")]
        public async Task<IActionResult> Unfollow(int artistId)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();
            await _mediator.Send(new UnfollowArtistCommand(userId, artistId));
            return Ok(new { message = "Removed from your library" });
        }

        // GET /api/follow/check/{artistId} — Kiểm tra đang follow chưa
        [HttpGet("check/{artistId:int}")]
        public async Task<IActionResult> Check(int artistId)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();
            var isFollowing = await _mediator.Send(new CheckArtistFollowQuery(userId, artistId));
            return Ok(new { isFollowing });
        }

        // GET /api/follow/following — Lấy danh sách Artist đang follow
        [HttpGet("following")]
        public async Task<IActionResult> GetFollowing()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var artists = await _mediator.Send(new GetFollowingArtistsQuery(userId));
            return Ok(artists);
        }

        // POST /api/follow/user/{targetUserId} — Follow một User khác
        [HttpPost("user/{targetUserId:int}")]
        public async Task<IActionResult> FollowUser(int targetUserId)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();
            if (userId == targetUserId) return BadRequest("Cannot follow yourself.");

            await _mediator.Send(new FollowUserCommand(userId, targetUserId));
            return Ok(new { Message = "Followed user successfully" });
        }

        // DELETE /api/follow/user/{targetUserId} — Unfollow một User khác
        [HttpDelete("user/{targetUserId:int}")]
        public async Task<IActionResult> UnfollowUser(int targetUserId)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            await _mediator.Send(new UnfollowUserCommand(userId, targetUserId));
            return Ok(new { Message = "Unfollowed user successfully" });
        }

        // GET /api/follow/user/{targetUserId}/status
        [HttpGet("user/{targetUserId:int}/status")]
        public async Task<IActionResult> CheckUserFollowStatus(int targetUserId)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var isFollowing = await _mediator.Send(new CheckUserFollowQuery(userId, targetUserId));
            return Ok(new { IsFollowing = isFollowing });
        }

        // GET /api/follow/user/following — Lấy danh sách user đang theo dõi (Của tôi)
        [HttpGet("user/following")]
        public async Task<IActionResult> GetFollowingUsers()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var users = await _mediator.Send(new GetFollowingUsersQuery(userId));
            return Ok(users);
        }

        // GET /api/follow/user/{targetUserId}/followers — Lấy danh sách người theo dõi của 1 user
        [HttpGet("user/{targetUserId:int}/followers")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserFollowers(int targetUserId)
        {
            var users = await _mediator.Send(new GetUserFollowersQuery(targetUserId));
            return Ok(users);
        }

        // GET /api/follow/user/{targetUserId}/following — Lấy danh sách user mà targetUserId đang theo dõi
        [HttpGet("user/{targetUserId:int}/following")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserFollowing(int targetUserId)
        {
            var users = await _mediator.Send(new GetFollowingUsersQuery(targetUserId));
            return Ok(users);
        }

        // GET /api/follow/user/{targetUserId}/following-artists — Lấy danh sách artist mà targetUserId đang theo dõi
        [HttpGet("user/{targetUserId:int}/following-artists")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserFollowingArtists(int targetUserId)
        {
            var artists = await _mediator.Send(new GetFollowingArtistsQuery(targetUserId));
            return Ok(artists);
        }
    }
}
