using System.Collections.Generic;
using MediatR;

namespace Application.Features.AI.Commands
{
    public record AutoTagCommand(int SongId) : IRequest<List<string>>;
}
