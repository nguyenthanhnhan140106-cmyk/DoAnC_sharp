using MediatR;
using Application.DTOs;

namespace Application.Features.Songs.Commands
{
    public record CreateSongCommand(CreateSongDTO Dto) : IRequest<SongDTO>;
    
    public record UpdateSongCommand(int Id, UpdateSongDTO Dto) : IRequest<SongDTO?>;
    
    public record DeleteSongCommand(int Id) : IRequest<bool>;

    
    public record UploadSongCommand(
        string Title,
        string Artist,
        int? CategoryId,
        string? CategoryName,
        string? LyricsUrl,
        int? ArtistId,
        int? UploaderId,
        Stream? AudioStream, string? AudioFileName,
        Stream? VideoStream, string? VideoFileName,
        Stream? CoverStream, string? CoverFileName
    ) : IRequest<SongDTO>;
}
