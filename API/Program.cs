using Application.Interfaces;
using Application.Services;
using Infrastructure.Repositories;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Infrastructure.Services; // Thêm dòng này để tìm thấy EmailService
using API.Hubs; // SignalR Hub
using Application; // BỔ SUNG: Thêm thư viện Application
using FluentValidation; // BỔ SUNG: Bắt lỗi Validation
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
// 🟢 BỔ SUNG: Đăng ký Notification Repository và Service
builder.Services.AddScoped<Application.Interfaces.INotificationRepository, Infrastructure.Repositories.NotificationRepository>(provider => 
    new Infrastructure.Repositories.NotificationRepository(builder.Configuration.GetConnectionString("DefaultConnection")!));

// 🟢 BỔ SUNG: Đăng ký Library Repository (lưu album vào thư viện)
builder.Services.AddScoped<Application.Interfaces.ILibraryRepository>(_ => new Infrastructure.Repositories.LibraryRepository(connectionString));

// 🟢 BỔ SUNG: Đăng ký Follow Repository (theo dõi nghệ sĩ)
builder.Services.AddScoped<Application.Interfaces.IFollowRepository, Infrastructure.Repositories.FollowRepository>();

// 🟢 BỔ SUNG: Đăng ký MediatR và FluentValidation (CQRS Pipeline)
builder.Services.AddApplication();

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

// 🟢 BỔ SUNG: Middleware bắt lỗi Validation (từ MediatR Pipeline) và trả về HTTP 400
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (ValidationException ex)
    {
        context.Response.StatusCode = 400;
        context.Response.ContentType = "application/json";
        
        var errors = ex.Errors.Select(e => new { 
            Field = e.PropertyName, 
            Error = e.ErrorMessage 
        });
        
        await context.Response.WriteAsJsonAsync(new { 
            Success = false, 
            Message = "Dữ liệu không hợp lệ", 
            Errors = errors 
        });
    }
    catch (Exception ex)
    {
        // Ghi log lỗi tại đây nếu có ILogger
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        
        await context.Response.WriteAsJsonAsync(new { 
            Success = false, 
            Message = "Đã xảy ra lỗi hệ thống cục bộ. Vui lòng thử lại sau.", 
            Detailed = ex.Message // Xóa dòng này ở Production để giấu mã lỗi
        });
    }
});

// --- AUTO SEED DATABASE (Đặt ở đây là chuẩn nhất) ---
var logger = app.Logger;
int maxRetries = 5;

for (int retry = 1; retry <= maxRetries; retry++)
{
    try
    {
        using var conn = new SqlConnection(connectionString);
        conn.Open();

        

        

        // Seed user mặc định nếu chưa có
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                IF NOT EXISTS(SELECT 1 FROM users WHERE Id=1) BEGIN SET IDENTITY_INSERT users ON; INSERT INTO users (Id, Username, Email, PasswordHash) VALUES (1, 'admin', 'admin@example.com', ''); SET IDENTITY_INSERT users OFF; END";
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








