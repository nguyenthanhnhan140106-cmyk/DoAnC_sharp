using Application.Interfaces; // Dòng này giúp thấy được interface
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
            // 1. Đọc cấu hình từ cục "Brevo" mới trong appsettings.json
            var apiKey = _config["Brevo:ApiKey"];
            var senderEmail = _config["Brevo:SenderEmail"];
            var senderName = _config["Brevo:SenderName"] ?? "TuneVault Support";

            if (string.IsNullOrEmpty(apiKey))
            {
                throw new Exception("Lỗi: Không tìm thấy API Key của Brevo trong cấu hình!");
            }

            var requestUrl = "https://api.brevo.com/v3/smtp/email";

            // 2. Tạo nội dung gói hàng theo đúng chuẩn mà API Brevo yêu cầu
            var emailPayload = new
            {
                sender = new { name = senderName, email = senderEmail },
                to = new[] { new { email = toEmail } },
                subject = subject,
                htmlContent = message // Biến message của bạn thực chất chứa nội dung HTML
            };

            var jsonString = JsonSerializer.Serialize(emailPayload);

            // 3. Dùng HttpClient để gửi qua cổng Web an toàn (HTTP 443 - Không bị Somee chặn)
            using var client = new HttpClient();
            using var request = new HttpRequestMessage(HttpMethod.Post, requestUrl);
            
            request.Headers.Add("api-key", apiKey);
            request.Headers.Add("accept", "application/json");
            request.Content = new StringContent(jsonString, Encoding.UTF8, "application/json");

            // 4. Bấm nút gửi
            var response = await client.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorDetails = await response.Content.ReadAsStringAsync();
                throw new Exception($"Lỗi gửi mail qua Brevo: {errorDetails}");
            }
        }
    }
}