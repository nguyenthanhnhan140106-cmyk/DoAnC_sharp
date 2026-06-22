using MediatR;
using Application.DTOs;

namespace Application.Features.Artists.Queries
{
    public record GetAllArtistsQuery() : IRequest<IEnumerable<ArtistDTO>>;
    public record GetArtistByIdQuery(int Id) : IRequest<ArtistDTO?>;
}
