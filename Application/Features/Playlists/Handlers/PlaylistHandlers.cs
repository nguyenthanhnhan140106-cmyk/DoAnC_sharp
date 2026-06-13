using MediatR;
using Application.DTOs;
using Application.Features.Playlists.Commands;
using Application.Features.Playlists.Queries;
using Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Playlists.Handlers
{
    public class PlaylistHandlers : 
        IRequestHandler<GetAllPlaylistsQuery, IEnumerable<PlaylistDTO>>,
        IRequestHandler<GetPlaylistByIdQuery, PlaylistDTO?>,
        IRequestHandler<GetUserPlaylistsQuery, IEnumerable<PlaylistDTO>>,
        IRequestHandler<GetPlaylistsContainingSongQuery, IEnumerable<int>>,
        IRequestHandler<CreatePlaylistCommand, PlaylistDTO>,
        IRequestHandler<AddSongToPlaylistCommand, bool>,
        IRequestHandler<DeletePlaylistCommand, bool>,
        IRequestHandler<RemoveSongFromPlaylistCommand, bool>
    {
        private readonly IPlaylistService _playlistService; // temporarily wrapping Service since it has complex raw SQL logic

        public PlaylistHandlers(IPlaylistService playlistService)
        {
            _playlistService = playlistService;
        }

        public async Task<IEnumerable<PlaylistDTO>> Handle(GetAllPlaylistsQuery request, CancellationToken cancellationToken)
        {
            return await _playlistService.GetAllPlaylistsAsync();
        }

        public async Task<PlaylistDTO?> Handle(GetPlaylistByIdQuery request, CancellationToken cancellationToken)
        {
            return await _playlistService.GetPlaylistByIdAsync(request.Id);
        }

        public async Task<IEnumerable<PlaylistDTO>> Handle(GetUserPlaylistsQuery request, CancellationToken cancellationToken)
        {
            return await _playlistService.GetPlaylistsByUserIdAsync(request.UserId);
        }

        public async Task<IEnumerable<int>> Handle(GetPlaylistsContainingSongQuery request, CancellationToken cancellationToken)
        {
            return await _playlistService.GetPlaylistsContainingSongAsync(request.UserId, request.SongId);
        }

        public async Task<PlaylistDTO> Handle(CreatePlaylistCommand request, CancellationToken cancellationToken)
        {
            return await _playlistService.CreatePlaylistAsync(request.UserId, request.Dto);
        }

        public async Task<bool> Handle(AddSongToPlaylistCommand request, CancellationToken cancellationToken)
        {
            return await _playlistService.AddSongToPlaylistAsync(request.PlaylistId, request.SongId);
        }

        public async Task<bool> Handle(DeletePlaylistCommand request, CancellationToken cancellationToken)
        {
            return await _playlistService.DeletePlaylistAsync(request.Id);
        }

        public async Task<bool> Handle(RemoveSongFromPlaylistCommand request, CancellationToken cancellationToken)
        {
            return await _playlistService.RemoveSongFromPlaylistAsync(request.PlaylistId, request.SongId);
        }
    }
}
