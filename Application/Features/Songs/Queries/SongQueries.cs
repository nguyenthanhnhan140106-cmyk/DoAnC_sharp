using MediatR;
using Application.DTOs;
using System.Collections.Generic;

namespace Application.Features.Songs.Queries
{
    public class GetAllSongsQuery : IRequest<IEnumerable<SongDTO>> { }
    
    public record GetSongByIdQuery(int Id) : IRequest<SongDTO?>;
    
    public record SearchSongsQuery(string Keyword) : IRequest<IEnumerable<SongDTO>>;
    
    public record GetSongsByCategoryQuery(string Category) : IRequest<IEnumerable<SongDTO>>;
    
    public record GetSongsByArtistQuery(int ArtistId) : IRequest<IEnumerable<SongDTO>>;
}
