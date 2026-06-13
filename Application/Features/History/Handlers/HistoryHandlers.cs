using MediatR;
using Application.DTOs;
using Application.Features.History.Commands;
using Application.Features.History.Queries;
using Application.Interfaces;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.History.Handlers
{
    public class HistoryHandlers :
        IRequestHandler<AddToHistoryCommand, bool>,
        IRequestHandler<GetRecentHistoryQuery, IEnumerable<SongDTO>>
    {
        private readonly IHistoryRepository _historyRepository;

        public HistoryHandlers(IHistoryRepository historyRepository)
        {
            _historyRepository = historyRepository;
        }

        public async Task<bool> Handle(AddToHistoryCommand request, CancellationToken cancellationToken)
        {
            await _historyRepository.AddToHistoryAsync(request.UserId, request.SongId);
            return true;
        }

        public async Task<IEnumerable<SongDTO>> Handle(GetRecentHistoryQuery request, CancellationToken cancellationToken)
        {
            return await _historyRepository.GetRecentAsync(request.UserId, request.Limit);
        }
    }
}
