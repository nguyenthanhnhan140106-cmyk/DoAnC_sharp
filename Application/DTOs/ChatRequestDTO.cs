namespace Application.DTOs
{
    // Đảm bảo tên class là ChatRequest
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

    // Đảm bảo có cả class ChatResponse để AiService không lỗi
    public class ChatResponse
    {
        public string Reply { get; set; } = string.Empty;
        public bool Success { get; set; } = true;
        public string? Error { get; set; }
    }
}
