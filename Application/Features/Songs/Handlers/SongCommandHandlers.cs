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
        IRequestHandler<UploadSongCommand, SongDTO>,
        IRequestHandler<UpdateSongCommand, SongDTO?>,
        IRequestHandler<DeleteSongCommand, bool>
    {
        private readonly ISongRepository _songRepository;
        private readonly ICloudinaryService _cloudinaryService;

        public SongCommandHandlers(ISongRepository songRepository, ICloudinaryService cloudinaryService)
        {
            _songRepository = songRepository;
            _cloudinaryService = cloudinaryService;
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
                UploaderId = dto.UploaderId,
                CreatedAt = System.DateTime.UtcNow
            };

            song.Id = await _songRepository.CreateAsync(song);
            return ToDTO(song);
        }

        public async Task<SongDTO> Handle(UploadSongCommand request, CancellationToken cancellationToken)
        {
            
            var allowedAudio = new[] { ".mp3", ".wav", ".flac", ".aac", ".ogg" };
            var allowedVideo = new[] { ".mp4", ".webm", ".mov", ".avi", ".mkv" };
            var allowedImage = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

            if (request.AudioFileName != null && !allowedAudio.Contains(System.IO.Path.GetExtension(request.AudioFileName).ToLower()))
                throw new System.InvalidOperationException($"Định dạng file audio không hợp lệ. Chỉ chấp nhận: {string.Join(", ", allowedAudio)}");

            if (request.VideoFileName != null && !allowedVideo.Contains(System.IO.Path.GetExtension(request.VideoFileName).ToLower()))
                throw new System.InvalidOperationException($"Định dạng file video không hợp lệ. Chỉ chấp nhận: {string.Join(", ", allowedVideo)}");

            if (request.CoverFileName != null && !allowedImage.Contains(System.IO.Path.GetExtension(request.CoverFileName).ToLower()))
                throw new System.InvalidOperationException($"Định dạng ảnh bìa không hợp lệ. Chỉ chấp nhận: {string.Join(", ", allowedImage)}");

            
            string? audioUrl = null;
            if (request.AudioStream != null && request.AudioFileName != null)
                audioUrl = await _cloudinaryService.UploadAudioAsync(request.AudioStream, request.AudioFileName);

            string? videoUrl = null;
            if (request.VideoStream != null && request.VideoFileName != null)
                videoUrl = await _cloudinaryService.UploadVideoAsync(request.VideoStream, request.VideoFileName);

            string? coverUrl = null;
            if (request.CoverStream != null && request.CoverFileName != null)
                coverUrl = await _cloudinaryService.UploadImageAsync(request.CoverStream, request.CoverFileName);

            var song = new Song
            {
                Title = request.Title,
                Artist = request.Artist,
                CategoryId = request.CategoryId,
                LyricsUrl = request.LyricsUrl,
                ArtistId = request.ArtistId,
                UploaderId = request.UploaderId,
                AudioUrl = audioUrl,
                VideoUrl = videoUrl,
                CoverUrl = coverUrl,
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
            LyricsUrl = s.LyricsUrl, CreatedAt = s.CreatedAt, ArtistId = s.ArtistId, UploaderId = s.UploaderId, WorldRank = s.WorldRank,
            Followers = s.Followers, MonthlyListeners = s.MonthlyListeners, Bio = s.Bio, ArtistBanner = s.ArtistBanner,
            IsVerified = s.IsVerified
        };
    }
}
