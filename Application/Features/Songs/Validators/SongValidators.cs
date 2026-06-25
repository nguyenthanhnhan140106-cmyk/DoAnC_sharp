using FluentValidation;
using Application.Features.Songs.Commands;

namespace Application.Features.Songs.Validators
{
    public class CreateSongCommandValidator : AbstractValidator<CreateSongCommand>
    {
        public CreateSongCommandValidator()
        {
            RuleFor(x => x.Dto.Title).NotEmpty().WithMessage("Tên bài hát không được để trống.");
            RuleFor(x => x.Dto.Artist).NotEmpty().WithMessage("Tên nghệ sĩ không được để trống.");
            
        }
    }

    public class UpdateSongCommandValidator : AbstractValidator<UpdateSongCommand>
    {
        public UpdateSongCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0).WithMessage("ID bài hát không hợp lệ.");
        }
    }
}
