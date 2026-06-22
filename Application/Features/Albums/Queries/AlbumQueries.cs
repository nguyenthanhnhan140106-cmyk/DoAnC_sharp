using MediatR;
using Application.DTOs;

namespace Application.Features.Albums.Queries
{
    public record GetAllAlbumsQuery() : IRequest<IEnumerable<AlbumDTO>>;
    public record GetAlbumByIdQuery(int Id) : IRequest<AlbumDTO?>;
}
