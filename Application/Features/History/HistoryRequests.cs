using MediatR;
using Application.DTOs;
using System.Collections.Generic;

namespace Application.Features.History.Commands
{
    public record AddToHistoryCommand(int UserId, int SongId) : IRequest<bool>;
}

namespace Application.Features.History.Queries
{
    public record GetRecentHistoryQuery(int UserId, int Limit) : IRequest<IEnumerable<SongDTO>>;
}
