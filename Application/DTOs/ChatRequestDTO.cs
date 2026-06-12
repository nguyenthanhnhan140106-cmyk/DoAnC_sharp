namespace Application.DTOs
{
    public class ChatRequest
    {
        // Chữ hoa đầu từ để khớp với JSON serializer của .NET
        public string Message { get; set; } 
        public List<MessageDto> History { get; set; }
    }

    public class MessageDto
    {
        public string Role { get; set; }
        public string Text { get; set; }
    }
}
