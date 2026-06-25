using MediatR;
using Application.DTOs;
using Application.Features.Follows.Commands;
using Application.Features.Follows.Queries;
using Application.Interfaces;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Features.Follows.Handlers
{
    public class FollowHandlers : 
        IRequestHandler<FollowArtistCommand, bool>,
        IRequestHandler<UnfollowArtistCommand, bool>,
        IRequestHandler<FollowUserCommand, bool>,
        IRequestHandler<UnfollowUserCommand, bool>,
        IRequestHandler<CheckArtistFollowQuery, bool>,
        IRequestHandler<GetFollowingArtistsQuery, IEnumerable<FollowedArtistDTO>>,
        IRequestHandler<CheckUserFollowQuery, bool>,
        IRequestHandler<GetFollowingUsersQuery, IEnumerable<UserFollowDTO>>,
        IRequestHandler<GetUserFollowersQuery, IEnumerable<UserFollowDTO>>
    {
        private readonly IFollowRepository _followRepo;
        private readonly INotificationRepository _notificationRepo;

        public FollowHandlers(IFollowRepository followRepo, INotificationRepository notificationRepo)
        {
            _followRepo = followRepo;
            _notificationRepo = notificationRepo;
        }

        public async Task<bool> Handle(FollowArtistCommand request, CancellationToken cancellationToken)
        {
            await _followRepo.FollowAsync(request.UserId, request.ArtistId);
            return true;
        }

        public async Task<bool> Handle(UnfollowArtistCommand request, CancellationToken cancellationToken)
        {
            await _followRepo.UnfollowAsync(request.UserId, request.ArtistId);
            return true;
        }

        public async Task<bool> Handle(FollowUserCommand request, CancellationToken cancellationToken)
        {
            await _followRepo.FollowUserAsync(request.UserId, request.TargetUserId);

            var payloadData = new
            {
                Message = $"{request.FollowerName} đã bắt đầu theo dõi bạn.",
                CreatedAt = System.DateTime.UtcNow
            };

            var notification = new Notification
            {
                UserId = request.TargetUserId,
                Type = "NewFollower",
                Payload = JsonSerializer.Serialize(payloadData),
                IsRead = false
            };
            await _notificationRepo.InsertNotificationAsync(notification);

            return true;
        }

        public async Task<bool> Handle(UnfollowUserCommand request, CancellationToken cancellationToken)
        {
            await _followRepo.UnfollowUserAsync(request.UserId, request.TargetUserId);
            return true;
        }

        public async Task<bool> Handle(CheckArtistFollowQuery request, CancellationToken cancellationToken)
        {
            return await _followRepo.IsFollowingAsync(request.UserId, request.ArtistId);
        }

        public async Task<IEnumerable<FollowedArtistDTO>> Handle(GetFollowingArtistsQuery request, CancellationToken cancellationToken)
        {
            return await _followRepo.GetFollowedArtistsAsync(request.UserId);
        }

        public async Task<bool> Handle(CheckUserFollowQuery request, CancellationToken cancellationToken)
        {
            return await _followRepo.IsFollowingUserAsync(request.UserId, request.TargetUserId);
        }

        public async Task<IEnumerable<UserFollowDTO>> Handle(GetFollowingUsersQuery request, CancellationToken cancellationToken)
        {
            return await _followRepo.GetFollowingUsersAsync(request.UserId);
        }

        public async Task<IEnumerable<UserFollowDTO>> Handle(GetUserFollowersQuery request, CancellationToken cancellationToken)
        {
            return await _followRepo.GetFollowersAsync(request.UserId);
        }
    }
}
