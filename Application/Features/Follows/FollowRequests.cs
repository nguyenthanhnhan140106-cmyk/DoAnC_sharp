using MediatR;
using Application.DTOs;
using System.Collections.Generic;

namespace Application.Features.Follows.Commands
{
    public record FollowArtistCommand(int UserId, int ArtistId) : IRequest<bool>;
    public record UnfollowArtistCommand(int UserId, int ArtistId) : IRequest<bool>;
    public record FollowUserCommand(int UserId, int TargetUserId, string FollowerName) : IRequest<bool>;
    public record UnfollowUserCommand(int UserId, int TargetUserId) : IRequest<bool>;
}

namespace Application.Features.Follows.Queries
{
    public record CheckArtistFollowQuery(int UserId, int ArtistId) : IRequest<bool>;
    public record GetFollowingArtistsQuery(int UserId) : IRequest<IEnumerable<FollowedArtistDTO>>;
    public record CheckUserFollowQuery(int UserId, int TargetUserId) : IRequest<bool>;
    public record GetFollowingUsersQuery(int UserId) : IRequest<IEnumerable<UserFollowDTO>>;
    public record GetUserFollowersQuery(int UserId) : IRequest<IEnumerable<UserFollowDTO>>;
}
