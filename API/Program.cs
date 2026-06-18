using Application.Interfaces;
using Application.Services;
using Infrastructure.Repositories;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using API.Hubs;
using Application;
using FluentValidation;
using Infrastructure.Configuration;
using Infrastructure.Services;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình Kestrel và Form (Tạm thời đóng để tránh làm ngộp tài nguyên Somee Free khi khởi động)
// builder.WebHost.ConfigureKestrel(options => { options.Limits.MaxRequestBodySize = 104857600; });
// builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options => { options.MultipartBodyLengthLimit = 104857600; });

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;

builder.Services.AddCors(options => {
    options.AddPolicy("AllowReact", p => p
        .WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();

// Services Registration
builder.Services.AddScoped<IOtpRepository>(_ => new OtpRepository(connectionString));
builder.Services.AddScoped<ISongRepository, SongRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IArtistService>(_ => new ArtistService(connectionString));
builder.Services.AddScoped<IPlaylistService>(_ => new PlaylistService(connectionString));
builder.Services.AddScoped<AlbumService>(_ => new AlbumService(connectionString));
builder.Services.AddHttpClient<Application.Services.AiService>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService>(provider => 
{
    var config = provider.GetRequiredService<IConfiguration>();
    var otpService = provider.GetRequiredService<IOtpService>();
    var emailService = provider.GetRequiredService<IEmailService>();
    return new AuthService(connectionString, config, otpService, emailService);
});
builder.Services.AddScoped<IHistoryRepository>(_ => new HistoryRepository(connectionString));
builder.Services.AddScoped<INotificationRepository, Infrastructure.Repositories.NotificationRepository>(provider => 
    new Infrastructure.Repositories.NotificationRepository(builder.Configuration.GetConnectionString("DefaultConnection")!));
builder.Services.AddScoped<ILibraryRepository>(_ => new Infrastructure.Repositories.LibraryRepository(connectionString));
builder.Services.AddScoped<IFollowRepository, Infrastructure.Repositories.FollowRepository>();
builder.Services.AddScoped<IMediaShareRepository>(_ => new Infrastructure.Repositories.MediaShareRepository(connectionString));
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("Cloudinary"));
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddApplication();

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes("Chuoi_Bi_Mat_Cuc_Ky_Dai_Va_An_Toan_123456")),
            ValidateIssuer = false,
            ValidateAudience = false,
            NameClaimType = "id"
        };
        options.Events = new JwtBearerEvents {
            OnMessageReceived = context => {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/notification")) {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

// Middleware xử lý lỗi
app.Use(async (context, next) => {
    try { await next(); }
    catch (ValidationException ex) {
        context.Response.StatusCode = 400;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { Success = false, Message = "Dữ liệu không hợp lệ", Errors = ex.Errors.Select(e => new { Field = e.PropertyName, Error = e.ErrorMessage }) });
    }
    catch (Exception ex) {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { Success = false, Message = "Lỗi hệ thống", Detailed = ex.Message });
    }
});

if (app.Environment.IsDevelopment()) { app.UseDeveloperExceptionPage(); }

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowReact");
app.UseAuthentication(); 
app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notification");

app.Run();

// 🟢 ĐỊNH NGHĨA CLASS PHẢI NẰM Ở CUỐI FILE, SAU app.Run()
public class CustomUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        return connection.User?.FindFirst("id")?.Value;
    }
}