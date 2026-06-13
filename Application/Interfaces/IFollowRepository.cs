using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface IFollowRepository
    {
        Task FollowAsync(int userId, int artistId);
        Task UnfollowAsync(int userId, int artistId);
        Task<bool> IsFollowingAsync(int userId, int artistId);
        Task<IEnumerable<FollowedArtistDTO>> GetFollowedArtistsAsync(int userId);

        Task FollowUserAsync(int followerId, int followedUserId);
        Task UnfollowUserAsync(int followerId, int followedUserId);
        Task<bool> IsFollowingUserAsync(int followerId, int followedUserId);
        Task<IEnumerable<UserFollowDTO>> GetFollowingUsersAsync(int userId);
        Task<IEnumerable<UserFollowDTO>> GetFollowersAsync(int userId);
    }
}
