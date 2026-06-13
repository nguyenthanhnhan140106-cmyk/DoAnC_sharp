using MediatR;
using Application.DTOs;

namespace Application.Features.Users.Queries
{
    public class GetProfileQuery : IRequest<UserResponseDTO?>
    {
        public int Id { get; set; }
        
        public GetProfileQuery(int id)
        {
            Id = id;
        }
    }
}
