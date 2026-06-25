using Application.Interfaces; 
using Microsoft.Extensions.Configuration;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config) => _config = config;

        public async Task SendEmailAsync(string toEmail, string subject, string message)
        {
            
            var apiKey = _config["Brevo:ApiKey"];
            var senderEmail = _config["Brevo:SenderEmail"];
            var senderName = _config["Brevo:SenderName"] ?? "TuneVault Support";

            if (string.IsNullOrEmpty(apiKey))
            {
                throw new Exception("Lỗi: Không tìm thấy API Key của Brevo trong cấu hình!");
            }

            var requestUrl = "https://api.brevo.com/v3/smtp/email";

            
            var emailPayload = new
            {
                sender = new { name = senderName, email = senderEmail },
                to = new[] { new { email = toEmail } },
                subject = subject,
                htmlContent = message 
            };

            var jsonString = JsonSerializer.Serialize(emailPayload);

            
            using var client = new HttpClient();
            using var request = new HttpRequestMessage(HttpMethod.Post, requestUrl);
            
            request.Headers.Add("api-key", apiKey);
            request.Headers.Add("accept", "application/json");
            request.Content = new StringContent(jsonString, Encoding.UTF8, "application/json");

            
            var response = await client.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorDetails = await response.Content.ReadAsStringAsync();
                throw new Exception($"Lỗi gửi mail qua Brevo: {errorDetails}");
            }
        }
    }
}