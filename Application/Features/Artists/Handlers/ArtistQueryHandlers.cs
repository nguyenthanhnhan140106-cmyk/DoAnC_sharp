using MediatR;
using Application.DTOs;
using Application.Features.Artists.Queries;
using Application.Interfaces;

namespace Application.Features.Artists.Handlers
{
    public class ArtistQueryHandlers :
        IRequestHandler<GetAllArtistsQuery, IEnumerable<ArtistDTO>>,
        IRequestHandler<GetArtistByIdQuery, ArtistDTO?>
    {
        private readonly IArtistService _artistService;

        public ArtistQueryHandlers(IArtistService artistService)
        {
            _artistService = artistService;
        }

        public async Task<IEnumerable<ArtistDTO>> Handle(GetAllArtistsQuery request, CancellationToken cancellationToken)
        {
            return await _artistService.GetAllArtistsAsync();
        }

        public async Task<ArtistDTO?> Handle(GetArtistByIdQuery request, CancellationToken cancellationToken)
        {
            return await _artistService.GetArtistByIdAsync(request.Id);
        }
    }
}
