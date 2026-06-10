namespace Application.DTOs;

public class ShareMediaRequestDTO
{
    public int? SenderUserId { get; set; }
    public int ReceiverUserId { get; set; }
    public int? SongId { get; set; }
    public int? PlaylistId { get; set; }
    public string? Message { get; set; }
}

public class MediaShareDTO
{
    public int Id { get; set; }
    public int SenderUserId { get; set; }
    public string SenderUsername { get; set; } = string.Empty;
    public int ReceiverUserId { get; set; }
    public int? SongId { get; set; }
    public int? PlaylistId { get; set; }
    public string? SongTitle { get; set; }
    public string? PlaylistName { get; set; }
    public string? Artist { get; set; }
    public string? CoverUrl { get; set; }
    public string? Message { get; set; }
    public DateTime SharedAt { get; set; }
}
