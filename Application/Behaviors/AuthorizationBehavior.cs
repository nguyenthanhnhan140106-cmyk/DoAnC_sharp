using MediatR;
using Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using System.Threading;
using System.Threading.Tasks;
using System;

namespace Application.Behaviors
{
    public class AuthorizationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly IServiceProvider _serviceProvider;

        public AuthorizationBehavior(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            if (request is IAuthorizeRequest authRequest)
            {
                if (authRequest.UserId <= 0)
                {
                    throw new UnauthorizedAccessException("Bạn không có quyền thực hiện hành động này.");
                }

                if (request is IRequirePlaylistOwnership playlistReq)
                {
                    var playlistService = _serviceProvider.GetRequiredService<IPlaylistService>();
                    var playlist = await playlistService.GetPlaylistByIdAsync(playlistReq.PlaylistId);
                    
                    if (playlist == null)
                    {
                        throw new Exception("Không tìm thấy Playlist.");
                    }

                    if (playlist.UserId != playlistReq.UserId)
                    {
                        throw new UnauthorizedAccessException("Bạn không phải chủ sở hữu của Playlist này.");
                    }
                }
            }

            return await next();
        }
    }
}
