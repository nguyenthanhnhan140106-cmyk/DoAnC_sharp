using MediatR;
using Application.DTOs;
using System.Collections.Generic;

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
    public record AddSongToPlaylistCommand(int PlaylistId, int SongId) : IRequest<bool>;
    public record DeletePlaylistCommand(int Id) : IRequest<bool>;
    public record RemoveSongFromPlaylistCommand(int PlaylistId, int SongId) : IRequest<bool>;
}
