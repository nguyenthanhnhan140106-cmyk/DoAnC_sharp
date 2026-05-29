using Microsoft.EntityFrameworkCore;
using Domain.Entities; // Dòng này bắt buộc phải có để nhận diện Song, User, Artist, Playlist từ tầng Domain

namespace Application.Interfaces
{
    public interface IAppDbContext
    {
        // Định nghĩa 4 tập dữ liệu cốt lõi cho ứng dụng TuneVault
        DbSet<Song> Songs { get; set; }
        DbSet<User> Users { get; set; }
        DbSet<Artist> Artists { get; set; }
        DbSet<Playlist> Playlists { get; set; }
    }
}