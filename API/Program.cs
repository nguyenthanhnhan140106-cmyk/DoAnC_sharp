using Microsoft.EntityFrameworkCore;
using Application.Interfaces;
using Application.Services;

var builder = WebApplication.CreateBuilder(args);

// =========================================================================
// 🟢 VÙNG 1: ĐĂNG KÝ CÁC DỊCH VỤ (BẮT BUỘC PHẢI NẰM TRÊN BUILDER.BUILD)
// =========================================================================

// 1. Lấy chuỗi kết nối từ file appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// 2. Đăng ký AppDbContext sử dụng MySQL Server (XAMPP)
builder.Services.AddDbContext<Infrastructure.Data.AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// 3. Bật cấu hình CORS để cho phép Frontend React (Port 5173) bốc được dữ liệu sang
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReact", p => 
        p.AllowAnyOrigin()
         .AllowAnyMethod()
         .AllowAnyHeader());
});

// 4. Đăng ký dịch vụ làm Web API (Để nhận diện các Controller)
builder.Services.AddControllers();

// 5. Đăng ký các dịch vụ Swagger kiểm thử
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 6. Đăng ký liên kết Interface CSDL (Cứu nguy lỗi phụ thuộc ngược)
builder.Services.AddScoped<IAppDbContext>(provider => 
    provider.GetRequiredService<Infrastructure.Data.AppDbContext>());

// 7. Đăng ký toàn bộ 4 lớp Service xử lý logic của đồ án
builder.Services.AddScoped<ISongService, SongService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IArtistService, ArtistService>();
builder.Services.AddScoped<IPlaylistService, PlaylistService>();

var app = builder.Build();

// =========================================================================
// 🔵 VÙNG 2: CẤU HÌNH PIPELINE CHẠY WEB
// =========================================================================

// Luôn bật Swagger để kiểm thử API hằng ngày cho tiện
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// Kích hoạt CORS (Phải đặt trước MapControllers)
app.UseCors("AllowReact");

app.UseAuthorization();

// Ánh xạ toàn bộ đầu link từ các file Controllers (Songs, Users, Artists, Playlists)
app.MapControllers();

app.Run();