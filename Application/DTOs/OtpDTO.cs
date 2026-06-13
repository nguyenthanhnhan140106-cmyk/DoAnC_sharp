using System.Text.Json.Serialization;

namespace Application.DTOs
{
    public class OtpRequest { public string Email { get; set; } = string.Empty; }

public class VerifyOtpRequest {
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
    [JsonPropertyName("otp")]
    public string Otp { get; set; } = string.Empty;
}

public class ResetPasswordRequest {
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
    [JsonPropertyName("otp")]
    public string Otp { get; set; } = string.Empty;
    [JsonPropertyName("newPassword")]
    public string NewPassword { get; set; } = string.Empty;
}
}
