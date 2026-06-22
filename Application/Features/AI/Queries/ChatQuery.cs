using System.Collections.Generic;
using MediatR;
using Application.DTOs;

namespace Application.Features.AI.Queries
{
    public record ChatQuery(IEnumerable<MessageDTO> History, string Message) : IStreamRequest<string>;
}
