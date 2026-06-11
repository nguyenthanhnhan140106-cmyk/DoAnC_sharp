namespace Application.DTOs
{
    public class ShareSongRequest
    {
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public int ReceiverId { get; set; }
        public int SongId { get; set; }
        public string SongTitle { get; set; } = string.Empty;
        public string SongCover { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}