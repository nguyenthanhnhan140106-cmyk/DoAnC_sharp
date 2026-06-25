namespace Application.DTOs
{
    public class ShareMediaRequest
    {
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public int ReceiverId { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public string MediaType { get; set; } = string.Empty; 
        public int MediaId { get; set; }
        public string MediaTitle { get; set; } = string.Empty;
        public string MediaCover { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
