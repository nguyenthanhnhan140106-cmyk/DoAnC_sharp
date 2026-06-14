using MediatR;
using Application.DTOs;
using System.Collections.Generic;
using Application.Interfaces;

namespace Application.Features.Playlists.Queries
{
    public class GetAllPlaylistsQuery : IRequest<IEnumerable<PlaylistDTO>> { }
    public record GetPlaylistByIdQuery(int Id) : IRequest<PlaylistDTO?>;
    public record GetUserPlaylistsQuery(int UserId) : IRequest<IEnumerable<PlaylistDTO>>;
    public record GetPlaylistsContainingSongQuery(int UserId, int SongId) : IRequest<IEnumerable<int>>;
}

namespace Application.Features.Playlists.Commands
{
    public record CreatePlaylistCommand(int UserId, CreatePlaylistDTO Dto) : IRequest<PlaylistDTO>;
    
    public record AddSongToPlaylistCommand(int PlaylistId, int SongId, int UserId) : IRequest<bool>, IRequirePlaylistOwnership;
    
    public record DeletePlaylistCommand(int Id, int UserId) : IRequest<bool>, IRequirePlaylistOwnership
    {
        public int PlaylistId => Id;
    }
    
    public record RemoveSongFromPlaylistCommand(int PlaylistId, int SongId, int UserId) : IRequest<bool>, IRequirePlaylistOwnership;
    
    public record TogglePlaylistPrivacyCommand(int Id, int UserId, bool IsPublic) : IRequest<bool>, IRequirePlaylistOwnership
    {
        public int PlaylistId => Id;
    }
}
