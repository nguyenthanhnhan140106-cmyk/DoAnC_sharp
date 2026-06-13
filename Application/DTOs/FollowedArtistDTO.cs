namespace Application.DTOs
{
    /// <summary>
    /// DTO trả về danh sách Artist mà User đang follow, kèm ảnh đại diện.
    /// </summary>
    public class FollowedArtistDTO
    {
        public int ArtistId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }  // Lấy từ ảnh bài hát nổi bật nhất
    }
}
