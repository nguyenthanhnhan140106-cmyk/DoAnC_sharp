using Application.Interfaces;
using Application.Services;
using Infrastructure.Repositories;
using MySqlConnector;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Lấy connection string
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;

// CORS, Controllers, Swagger...
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReact", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Đăng ký các Service
builder.Services.AddScoped<ISongRepository, SongRepository>();
builder.Services.AddScoped<ISongService, SongService>();
builder.Services.AddScoped<IUserService>(_ => new UserService(connectionString));
builder.Services.AddScoped<IArtistService>(_ => new ArtistService(connectionString));
builder.Services.AddScoped<IPlaylistService>(_ => new PlaylistService(connectionString));
builder.Services.AddScoped<AlbumService>(_ => new AlbumService(connectionString));
builder.Services.AddScoped<IAuthService>(provider => new AuthService(connectionString, builder.Configuration));
builder.Services.AddScoped<IHistoryRepository>(_ => new HistoryRepository(connectionString));
builder.Services.AddScoped<IHistoryService, HistoryService>();

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes("Chuoi_Bi_Mat_Cuc_Ky_Dai_Va_An_Toan_123456")),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// --- AUTO SEED DATABASE (Đặt ở đây là chuẩn nhất) ---
// --- AUTO SEED DATABASE ---
var logger = app.Logger;
int maxRetries = 5;

for (int retry = 1; retry <= maxRetries; retry++)
{
    try
    {
        using var conn = new MySqlConnection(connectionString);
        conn.Open();

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

app.Run(); // Chỉ có 1 app.Run() duy nhất ở cuối
