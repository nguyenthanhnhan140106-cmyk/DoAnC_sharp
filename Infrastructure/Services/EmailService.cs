using Application.Interfaces; // Dòng này giúp thấy được interface
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config) => _config = config;

        public async Task SendEmailAsync(string toEmail, string subject, string message)
        {
            var emailSettings = _config.GetSection("EmailSettings");
            var senderName = emailSettings["SenderName"] ?? "TuneVault";
            var senderEmail = emailSettings["SenderEmail"] ?? "";
            var smtpServer = emailSettings["SmtpServer"] ?? "";
            var password = emailSettings["Password"] ?? "";
            var portString = emailSettings["Port"] ?? "587";
            
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(senderName, senderEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;
            email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = message };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(smtpServer, int.Parse(portString), MailKit.Security.SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(senderEmail, password);
            
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
    }
}
