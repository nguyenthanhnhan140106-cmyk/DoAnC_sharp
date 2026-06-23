using MediatR;
using Application.DTOs;

namespace Application.Features.Users.Commands
{
    public record UpdateProfileCommand(
        int Id,
        string? DisplayName,  // Tên hiển thị, không liên quan đăng nhập
        string? Bio,
        string? AvatarUrl
    ) : IRequest<UserResponseDTO?>;
}
