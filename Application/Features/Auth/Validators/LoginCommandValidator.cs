using FluentValidation;

namespace Application.Features.Auth.Validators
{
    public class LoginCommandValidator : AbstractValidator<Commands.LoginCommand>
    {
        public LoginCommandValidator()
        {
            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Tên đăng nhập không được để trống.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Mật khẩu không được để trống.");
        }
    }
}
