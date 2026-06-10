using Application.Interfaces;
using Application.Services;
using Infrastructure.Repositories;
using MySqlConnector;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;

// CORS
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReact", p => 
        p.AllowAnyOrigin()
         .AllowAnyMethod()
         .AllowAnyHeader());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Đăng ký Dapper — truyền connection string thay vì DbContext
builder.Services.AddScoped<ISongRepository, SongRepository>();
builder.Services.AddScoped<ISongService, SongService>(); // ← DI tự inject
builder.Services.AddScoped<IUserService>(_ => new UserService(connectionString));
builder.Services.AddScoped<IArtistService>(_ => new ArtistService(connectionString));
builder.Services.AddScoped<IPlaylistService>(_ => new PlaylistService(connectionString));
builder.Services.AddScoped(_ => new ShareMediaService(connectionString));
builder.Services.AddScoped(_ => new NotificationService(connectionString));

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowReact");
app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();

// ── Auto seed khi DB rỗng ────────────────────────────────
var logger = app.Logger;
int maxRetries = 5;

for (int retry = 1; retry <= maxRetries; retry++)
{
    try
    {
        logger.LogInformation($"[TuneVault DB] Kết nối lần {retry}/{maxRetries}...");

        using var conn = new MySqlConnection(connectionString);
        conn.Open();
        // Tạo bảng media_shares
using (var cmd = conn.CreateCommand())
{
    cmd.CommandText = @"
        CREATE TABLE IF NOT EXISTS media_shares (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            SenderId INT NOT NULL,
            ReceiverId INT NOT NULL,
            SongId INT NULL,
            AlbumId INT NULL,
            Message VARCHAR(500) NULL,
            SharedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

            INDEX idx_media_shares_receiver (ReceiverId),
            INDEX idx_media_shares_sender (SenderId),
            INDEX idx_media_shares_song (SongId),
            INDEX idx_media_shares_album (AlbumId)
        );
    ";
    cmd.ExecuteNonQuery();
}

// Tạo bảng notifications
using (var cmd = conn.CreateCommand())
{
    cmd.CommandText = @"
        CREATE TABLE IF NOT EXISTS notifications (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            UserId INT NOT NULL,
            Type VARCHAR(50) NOT NULL,
            Payload TEXT NOT NULL,
            IsRead BOOLEAN NOT NULL DEFAULT FALSE,
            CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

            INDEX idx_notifications_user_read (UserId, IsRead),
            INDEX idx_notifications_created (CreatedAt)
        );
    ";
    cmd.ExecuteNonQuery();
}

        // Tạo bảng nếu chưa có
        var createTable = conn.CreateCommand();
        createTable.CommandText = @"
            CREATE TABLE IF NOT EXISTS songs (
                Id INT AUTO_INCREMENT PRIMARY KEY,
                Title VARCHAR(255) NOT NULL,
                Artist VARCHAR(255) NOT NULL,
                CoverUrl TEXT,
                AudioUrl TEXT,
                Category VARCHAR(100),
                CreatedAt DATETIME DEFAULT NOW()
            );";
        createTable.ExecuteNonQuery();

        // Seed data nếu bảng rỗng
        var countCmd = conn.CreateCommand();
        countCmd.CommandText = "SELECT COUNT(*) FROM songs";
        var count = Convert.ToInt32(countCmd.ExecuteScalar());

        if (count == 0)
        {
            var seedCmd = conn.CreateCommand();
            seedCmd.CommandText = @"
                INSERT INTO songs (Title, Artist, CoverUrl, AudioUrl, Category, CreatedAt) VALUES
                ('Xuất Phát Điểm', 'Obito, Shiki', 'https://picsum.photos/seed/1/160/160', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'friday', NOW()),
                ('Tell The Truth', 'Obito', 'https://picsum.photos/seed/2/160/160', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'vsound', NOW()),
                ('Bài Hát Demo 3', 'Ca Sĩ C', 'https://picsum.photos/seed/3/160/160', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'friday', NOW());";
            seedCmd.ExecuteNonQuery();
            logger.LogInformation("[TuneVault DB] 🟢 Đã seed 3 bài hát mặc định.");
        }

        logger.LogInformation("[TuneVault DB] 🟢 Kết nối thành công!");
        break;
    }
    catch (Exception ex)
    {
        logger.LogWarning($"[TuneVault DB] ⚠️ Lần {retry} thất bại: {ex.Message}");
        if (retry == maxRetries)
            logger.LogCritical("[TuneVault DB] ❌ Không thể kết nối DB!");
        else
            Thread.Sleep(TimeSpan.FromSeconds(3));
    }
}

app.Run();