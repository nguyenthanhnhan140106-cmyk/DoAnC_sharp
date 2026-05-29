using Microsoft.EntityFrameworkCore;
using Application.Interfaces;
using Domain.Entities;

namespace Infrastructure.Data
{
    public class AppDbContext : DbContext, IAppDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Khai báo 4 bảng dữ liệu đại diện cho nhà kho CSDL
        public DbSet<Song> Songs { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Artist> Artists { get; set; }
        public DbSet<Playlist> Playlists { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Ép EF Core map chính xác tên Class thành tên bảng chữ thường dưới phpMyAdmin
            modelBuilder.Entity<Song>().ToTable("songs");
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<Artist>().ToTable("artists");
            modelBuilder.Entity<Playlist>().ToTable("playlists");
        }
    }
}