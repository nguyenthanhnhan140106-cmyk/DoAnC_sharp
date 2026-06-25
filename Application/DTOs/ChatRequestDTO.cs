namespace Application.DTOs
{
    
    public class ChatRequestDTO
    {
        public string Message { get; set; } = string.Empty;
        public List<MessageDTO> History { get; set; } = new();
    }
    
    public class MessageDTO
    {
        public string Role { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
    }

    
    public class ChatResponse
    {
        public string Reply { get; set; } = string.Empty;
        public bool Success { get; set; } = true;
        public string? Error { get; set; }
    }
}
