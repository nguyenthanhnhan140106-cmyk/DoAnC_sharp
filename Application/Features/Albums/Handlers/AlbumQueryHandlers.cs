using MediatR;
using Application.DTOs;
using Application.Features.Albums.Queries;
using Application.Services;

namespace Application.Features.Albums.Handlers
{
    public class AlbumQueryHandlers :
        IRequestHandler<GetAllAlbumsQuery, IEnumerable<AlbumDTO>>,
        IRequestHandler<GetAlbumByIdQuery, AlbumDTO?>
    {
        private readonly AlbumService _albumService;

        public AlbumQueryHandlers(AlbumService albumService)
        {
            _albumService = albumService;
        }

        public async Task<IEnumerable<AlbumDTO>> Handle(GetAllAlbumsQuery request, CancellationToken cancellationToken)
        {
            return await _albumService.GetAllAlbumsAsync();
        }

        public async Task<AlbumDTO?> Handle(GetAlbumByIdQuery request, CancellationToken cancellationToken)
        {
            return await _albumService.GetAlbumDetailsAsync(request.Id);
        }
    }
}
