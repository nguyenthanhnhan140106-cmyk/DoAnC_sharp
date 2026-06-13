using MediatR;
using Application.DTOs;
using System.Collections.Generic;

namespace Application.Features.Users.Queries
{
    public class GetAllUsersQuery : IRequest<IEnumerable<UserResponseDTO>>
    {
    }
}
