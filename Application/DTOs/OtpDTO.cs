using System.Text.Json.Serialization;

namespace Application.DTOs
{
    public class OtpRequest { public string Email { get; set; } = string.Empty; }

public class VerifyOtpRequest {
    [JsonPropertyName("email")]
    public string Email { get; set; }
    [JsonPropertyName("otp")]
    public string Otp { get; set; }
}}
