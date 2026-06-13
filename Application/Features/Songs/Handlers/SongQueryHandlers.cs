using MediatR;
using Application.DTOs;
using Application.Features.Songs.Queries;
using Application.Interfaces;
using Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Songs.Handlers
{
    public class SongQueryHandlers : 
        IRequestHandler<GetAllSongsQuery, IEnumerable<SongDTO>>,
        IRequestHandler<GetSongByIdQuery, SongDTO?>,
        IRequestHandler<SearchSongsQuery, IEnumerable<SongDTO>>,
        IRequestHandler<GetSongsByCategoryQuery, IEnumerable<SongDTO>>,
        IRequestHandler<GetSongsByArtistQuery, IEnumerable<SongDTO>>
    {
        private readonly ISongRepository _songRepository;

        public SongQueryHandlers(ISongRepository songRepository)
        {
            _songRepository = songRepository;
        }

        public async Task<IEnumerable<SongDTO>> Handle(GetAllSongsQuery request, CancellationToken cancellationToken)
        {
            var songs = await _songRepository.GetAllSongsAsync();
            return songs.Select(s => ToDTO(s));
        }

        public async Task<SongDTO?> Handle(GetSongByIdQuery request, CancellationToken cancellationToken)
        {
            var song = await _songRepository.GetByIdAsync(request.Id);
            return song == null ? null : ToDTO(song);
        }

        public async Task<IEnumerable<SongDTO>> Handle(SearchSongsQuery request, CancellationToken cancellationToken)
        {
            var songs = await _songRepository.SearchAsync(request.Keyword);
            return songs.Select(s => ToDTO(s));
        }

        public async Task<IEnumerable<SongDTO>> Handle(GetSongsByCategoryQuery request, CancellationToken cancellationToken)
        {
            var songs = await _songRepository.GetByCategoryAsync(request.Category);
            return songs.Select(s => ToDTO(s));
        }

        public async Task<IEnumerable<SongDTO>> Handle(GetSongsByArtistQuery request, CancellationToken cancellationToken)
        {
            var songs = await _songRepository.GetByArtistIdAsync(request.ArtistId);
            return songs.Select(s => ToDTO(s));
        }

        private static SongDTO ToDTO(Song s) => new()
        {
            Id = s.Id, Title = s.Title, Artist = s.Artist, CoverUrl = s.CoverUrl, AudioUrl = s.AudioUrl,
            VideoUrl = s.VideoUrl ?? string.Empty, CategoryId = s.CategoryId, CategoryName = s.CategoryName,
            LyricsUrl = s.LyricsUrl, CreatedAt = s.CreatedAt, ArtistId = s.ArtistId, WorldRank = s.WorldRank,
            Followers = s.Followers, MonthlyListeners = s.MonthlyListeners, Bio = s.Bio, ArtistBanner = s.ArtistBanner,
            IsVerified = s.IsVerified
        };
    }
}
