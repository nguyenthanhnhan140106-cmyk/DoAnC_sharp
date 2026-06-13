using MediatR;
using Application.DTOs;

namespace Application.Features.Songs.Commands
{
    public record CreateSongCommand(CreateSongDTO Dto) : IRequest<SongDTO>;
    
    public record UpdateSongCommand(int Id, UpdateSongDTO Dto) : IRequest<SongDTO?>;
    
    public record DeleteSongCommand(int Id) : IRequest<bool>;
}
