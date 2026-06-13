using MediatR;
using Application.DTOs;
using Application.Features.Songs.Commands;
using Application.Interfaces;
using Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Songs.Handlers
{
    public class SongCommandHandlers : 
        IRequestHandler<CreateSongCommand, SongDTO>,
        IRequestHandler<UpdateSongCommand, SongDTO?>,
        IRequestHandler<DeleteSongCommand, bool>
    {
        private readonly ISongRepository _songRepository;

        public SongCommandHandlers(ISongRepository songRepository)
        {
            _songRepository = songRepository;
        }

        public async Task<SongDTO> Handle(CreateSongCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Dto;
            var song = new Song
            {
                Title = dto.Title,
                Artist = dto.Artist,
                CoverUrl = dto.CoverUrl,
                AudioUrl = dto.AudioUrl,
                VideoUrl = dto.VideoUrl,
                CategoryId = dto.CategoryId,
                LyricsUrl = dto.LyricsUrl,
                ArtistId = dto.ArtistId,
                CreatedAt = System.DateTime.UtcNow
            };

            song.Id = await _songRepository.CreateAsync(song);
            return ToDTO(song);
        }

        public async Task<SongDTO?> Handle(UpdateSongCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Dto;
            var song = await _songRepository.GetByIdAsync(request.Id);
            if (song == null) return null;

            if (dto.Title != null) song.Title = dto.Title;
            if (dto.Artist != null) song.Artist = dto.Artist;
            if (dto.CoverUrl != null) song.CoverUrl = dto.CoverUrl;
            if (dto.AudioUrl != null) song.AudioUrl = dto.AudioUrl;
            if (dto.VideoUrl != null) song.VideoUrl = dto.VideoUrl;
            if (dto.CategoryId != null) song.CategoryId = dto.CategoryId;
            if (dto.LyricsUrl != null) song.LyricsUrl = dto.LyricsUrl;
            if (dto.ArtistId != null) song.ArtistId = dto.ArtistId; 

            await _songRepository.UpdateAsync(song);
            return ToDTO(song);
        }

        public async Task<bool> Handle(DeleteSongCommand request, CancellationToken cancellationToken)
        {
            return await _songRepository.DeleteAsync(request.Id);
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
