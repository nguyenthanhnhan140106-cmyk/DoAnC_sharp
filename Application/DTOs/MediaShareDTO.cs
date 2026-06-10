namespace Application.DTOs
{
    public class ShareMediaRequestDTO
    {
        public int ReceiverUserId { get; set; }
        public int? SongId { get; set; }
        public int? PlaylistId { get; set; }
        public string? Message { get; set; }
    }

    public class MediaShareResponseDTO
    {
        public int Id { get; set; }
        public int SenderUserId { get; set; }
        public string SenderUsername { get; set; } = string.Empty;
        public int ReceiverUserId { get; set; }
        public string ReceiverUsername { get; set; } = string.Empty;
        public int? SongId { get; set; }
        public int? PlaylistId { get; set; }
        public string MediaType { get; set; } = string.Empty;
        public string MediaTitle { get; set; } = string.Empty;
        public string? Artist { get; set; }
        public string? CoverUrl { get; set; }
        public string? Message { get; set; }
        public DateTime SharedAt { get; set; }
    }

    public class ShareUserDTO
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}
