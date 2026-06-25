using MediatR;
using Application.DTOs;

namespace Application.Features.Users.Commands
{
    public record UpdateProfileCommand(
        int Id,
        string? DisplayName,  
        string? Bio,
        string? AvatarUrl
    ) : IRequest<UserResponseDTO?>;
}
