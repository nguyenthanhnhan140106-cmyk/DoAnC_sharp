using Application.Interfaces;
using Application.Services;
using Infrastructure.Repositories;
using MySqlConnector;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Infrastructure.Services; // Thêm dòng này để tìm thấy EmailService
using API.Hubs; // SignalR Hub
var builder = WebApplication.CreateBuilder(args);

// Lấy connection string
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;

// CORS, Controllers, Swagger...
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReact", p => p
        .WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000") // Liệt kê rõ các domain frontend
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()); // 🟢 BẮT BUỘC để SignalR kết nối được
});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR(); // BỔ SUNG SignalR
builder.Services.AddSingleton<Microsoft.AspNetCore.SignalR.IUserIdProvider, CustomUserIdProvider>();

// Đăng ký các Service
builder.Services.AddScoped<IOtpRepository>(_ => new OtpRepository(connectionString));
builder.Services.AddScoped<ISongRepository, SongRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ISongService, SongService>();
builder.Services.AddScoped<IUserService>(_ => new UserService(connectionString));
builder.Services.AddScoped<IArtistService>(_ => new ArtistService(connectionString));
builder.Services.AddScoped<IPlaylistService>(_ => new PlaylistService(connectionString));
builder.Services.AddScoped<AlbumService>(_ => new AlbumService(connectionString));
// Đăng ký HttpClient để gọi API AI (tránh cạn kiệt socket)
builder.Services.AddHttpClient<Application.Services.AiService>();

builder.Services.AddScoped<IOtpService, OtpService>(); // Hãy thay OtpService bằng class thực tế của bạn
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService>(provider => 
{
    var config = provider.GetRequiredService<IConfiguration>();
    var otpService = provider.GetRequiredService<IOtpService>();
    var emailService = provider.GetRequiredService<IEmailService>();
    
    return new AuthService(connectionString, config, otpService, emailService);
});builder.Services.AddScoped<IHistoryRepository>(_ => new HistoryRepository(connectionString));
builder.Services.AddScoped<IHistoryService, HistoryService>();

// 🟢 BỔ SUNG: Đăng ký Notification Repository và Service
builder.Services.AddScoped<Application.Interfaces.INotificationRepository, Infrastructure.Repositories.NotificationRepository>(provider => 
    new Infrastructure.Repositories.NotificationRepository(builder.Configuration.GetConnectionString("DefaultConnection")!));

builder.Services.AddScoped<Application.Services.NotificationService>();

// 🟢 BỔ SUNG: Đăng ký Library Repository (lưu album vào thư viện)
builder.Services.AddScoped<Application.Interfaces.ILibraryRepository>(_ => new Infrastructure.Repositories.LibraryRepository(connectionString));

// 🟢 BỔ SUNG: Đăng ký Follow Repository (theo dõi nghệ sĩ)
builder.Services.AddScoped<Application.Interfaces.IFollowRepository, Infrastructure.Repositories.FollowRepository>();

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes("Chuoi_Bi_Mat_Cuc_Ky_Dai_Va_An_Toan_123456")),
            ValidateIssuer = false,
            ValidateAudience = false,
            NameClaimType = "id" // Map JWT "id" tới ClaimTypes.NameIdentifier để SignalR hiểu UserIdentifier
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/notification"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// --- AUTO SEED DATABASE (Đặt ở đây là chuẩn nhất) ---
var logger = app.Logger;
int maxRetries = 5;

for (int retry = 1; retry <= maxRetries; retry++)
{
    try
    {
        using var conn = new MySqlConnection(connectionString);
        conn.Open();

        // 0. Tự động thêm cột BannerUrl cho bảng artists (tránh lỗi 500 do thiếu schema)
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = "ALTER TABLE artists ADD COLUMN BannerUrl VARCHAR(500) NULL;";
            try { cmd.ExecuteNonQuery(); } catch { /* Bỏ qua nếu cột đã tồn tại */ }
        }

        // 1. Tạo bảng songs
        using (var cmd = conn.CreateCommand())
        {
                    cmd.CommandText = @"
                CREATE TABLE IF NOT EXISTS songs (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    Title VARCHAR(255) NOT NULL,
                    Artist VARCHAR(255) NOT NULL,
                    CoverUrl TEXT,
                    AudioUrl TEXT,
                    VideoUrl TEXT,
                    LyricsUrl VARCHAR(500) NULL, 
                    ArtistId INT NULL,
                    WorldRank INT DEFAULT 0,
                    Followers INT DEFAULT 0,
                    MonthlyListeners INT DEFAULT 0,
                    Bio TEXT,
                    ArtistBanner TEXT,
                    IsVerified TINYINT(1) DEFAULT 1,
                    Category VARCHAR(100),
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                );";
            cmd.ExecuteNonQuery();
        }

        // 2. Tạo bảng users
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                CREATE TABLE IF NOT EXISTS users (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    Username VARCHAR(50) NOT NULL UNIQUE,
                    Email VARCHAR(100) NOT NULL UNIQUE,
                    PasswordHash VARCHAR(255) NOT NULL,
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                );";
            cmd.ExecuteNonQuery();
        }

        // Seed user mặc định nếu chưa có
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                INSERT IGNORE INTO users (Id, Username, Email, PasswordHash)
                VALUES (1, 'admin', 'admin@example.com', '');";
            cmd.ExecuteNonQuery();
        }

        // 3. Tạo bảng user_history
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                CREATE TABLE IF NOT EXISTS user_history (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    UserId INT NOT NULL,
                    SongId INT NOT NULL,
                    PlayedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (UserId) REFERENCES users(Id),
                    FOREIGN KEY (SongId) REFERENCES songs(Id)
                );";
            cmd.ExecuteNonQuery();
        }

        // 4. Tạo bảng playlists
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                CREATE TABLE IF NOT EXISTS playlists (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    Name VARCHAR(255) NOT NULL,
                    Description TEXT NULL,
                    CoverUrl TEXT NULL,
                    UserId INT NOT NULL,
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (UserId) REFERENCES users(Id)
                );";
            cmd.ExecuteNonQuery();
        }

        // 5. Tạo bảng playlist_songs
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                CREATE TABLE IF NOT EXISTS playlist_songs (
                    PlaylistId INT NOT NULL,
                    SongId INT NOT NULL,
                    AddedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (PlaylistId, SongId),
                    FOREIGN KEY (PlaylistId) REFERENCES playlists(Id) ON DELETE CASCADE,
                    FOREIGN KEY (SongId) REFERENCES songs(Id)
                );";
            cmd.ExecuteNonQuery();
        }
        // Create user_otps TABLE
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                CREATE TABLE IF NOT EXISTS user_otps (
                        Id INT AUTO_INCREMENT PRIMARY KEY,
                        EMail VARCHAR(100) NOT NULL,
                        OtpCode VARCHAR(255) NOT NULL,
                        ExpiryTime DATETIME NOT NULL,
                        IsUsed TINYINT(1) DEFAULT 0,
                        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                        );";
            cmd.ExecuteNonQuery();
        }

        // 🟢 6. BỔ SUNG: Tạo bảng Notification để lưu trữ thông báo và chuỗi JSON chia sẻ nhạc
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                CREATE TABLE IF NOT EXISTS notifications (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    UserId INT NOT NULL,
                    Type VARCHAR(50) NOT NULL,
                    Payload TEXT NOT NULL,
                    IsRead BOOLEAN DEFAULT FALSE,
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (UserId) REFERENCES users(Id) ON DELETE CASCADE
                );";
            cmd.ExecuteNonQuery();
        }

        // 🟢 6.1 BỔ SUNG: Tạo bảng user_follows để lưu trữ bạn bè (Follow user khác)
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                CREATE TABLE IF NOT EXISTS user_follows (
                    FollowerId INT NOT NULL,
                    FollowedUserId INT NOT NULL,
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (FollowerId, FollowedUserId),
                    FOREIGN KEY (FollowerId) REFERENCES users(Id) ON DELETE CASCADE,
                    FOREIGN KEY (FollowedUserId) REFERENCES users(Id) ON DELETE CASCADE
                );";
            cmd.ExecuteNonQuery();
        }

        // 🟢 7. BỔ SUNG: Tạo bảng user_saved_albums để lưu album vào thư viện
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                CREATE TABLE IF NOT EXISTS user_saved_albums (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    UserId INT NOT NULL,
                    AlbumId INT NOT NULL,
                    SavedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY uniq_user_album (UserId, AlbumId),
                    FOREIGN KEY (UserId) REFERENCES users(Id) ON DELETE CASCADE
                );";
            cmd.ExecuteNonQuery();
        }

        logger.LogInformation("[TuneVault DB] 🟢 Kết nối và khởi tạo bảng thành công!");
        break;
    }
    catch (Exception ex)
    {
        logger.LogWarning($"[TuneVault DB] ⚠️ Lần {retry} thất bại: {ex.Message}");
        Thread.Sleep(3000);
    }
}

// --- Middleware & App Run ---
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowReact");
app.UseAuthentication(); 
app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notification"); // BỔ SUNG endpoint SignalR

app.Run(); // Chỉ có 1 app.Run() duy nhất ở cuối

public class CustomUserIdProvider : Microsoft.AspNetCore.SignalR.IUserIdProvider
{
    public string? GetUserId(Microsoft.AspNetCore.SignalR.HubConnectionContext connection)
    {
        return connection.User?.FindFirst("id")?.Value;
    }
}
