# 📚 Kế Hoạch Đọc Hiểu Dự Án TuneVault

## Tổng Quan

**TuneVault** là ứng dụng **nghe nhạc trực tuyến** (giống Spotify) xây dựng bằng ASP.NET Core Web API + React Frontend. Dự án áp dụng kiến trúc **Clean Architecture** kết hợp pattern **CQRS + MediatR**.

---

## 🏗️ Phần 1 — Kiến Trúc Tổng Thể (Đọc Trước Tiên)

### Sơ đồ 4 tầng (Layer)

```
┌─────────────────────────────────────────────────────┐
│  🌐  API Layer          (d:\...\API)                │
│  Controllers · Hubs · Program.cs                    │
│  → Nhận HTTP Request, trả HTTP Response             │
├─────────────────────────────────────────────────────┤
│  📦  Application Layer  (d:\...\Application)        │
│  Features · Behaviors · DTOs · Interfaces           │
│  → Xử lý Business Logic, CQRS Commands/Queries      │
├─────────────────────────────────────────────────────┤
│  🧠  Domain Layer       (d:\...\Domain)             │
│  Entities (Song, User, Artist, Playlist...)         │
│  → Model dữ liệu thuần túy, không phụ thuộc ai     │
├─────────────────────────────────────────────────────┤
│  🗄️  Infrastructure Layer (d:\...\Infrastructure)  │
│  Repositories · Services (Cloudinary, Email, AI)   │
│  → Tương tác với DB (SQL Server), dịch vụ ngoài    │
└─────────────────────────────────────────────────────┘
```

**Quy tắc phụ thuộc:** API → Application → Domain ← Infrastructure

### File đọc đầu tiên:
| Ưu tiên | File | Mục đích |
|---------|------|----------|
| ⭐1 | [Program.cs](file:///d:/Work_Project/C_Sharp/API/Program.cs) | Điểm khởi động app, đăng ký toàn bộ services |
| ⭐2 | [DependencyInjection.cs](file:///d:/Work_Project/C_Sharp/Application/DependencyInjection.cs) | Đăng ký MediatR, FluentValidation, Pipeline |
| ⭐3 | [appsettings.json](file:///d:/Work_Project/C_Sharp/API/appsettings.json) | Cấu hình ConnectionString, JWT, Cloudinary, AI |

---

## 🔑 Phần 2 — Pattern CQRS + MediatR (Hiểu Nguyên Lý Cốt Lõi)

### CQRS là gì trong dự án này?
**CQRS = Command Query Responsibility Segregation**
- **Command** = Thao tác ghi dữ liệu (POST/PUT/DELETE): `LoginCommand`, `RegisterCommand`, `UploadSongCommand`
- **Query** = Thao tác đọc dữ liệu (GET): `GetAllSongsQuery`, `GetSongByIdQuery`

### MediatR hoạt động như thế nào?

```
HTTP Request
    ↓
Controller.cs  →  _mediator.Send(SomeCommand)
                        ↓
              MediatR Pipeline (như ống nước):
                  [1] ValidationBehavior   ← FluentValidation kiểm tra input
                  [2] AuthorizationBehavior ← Kiểm tra quyền sở hữu
                  [3] SomeCommandHandler   ← Xử lý business logic thực sự
                        ↓
              Handler gọi Repository/Service
                        ↓
              Trả kết quả về Controller
```

### File cần đọc:
| File | Vai trò |
|------|---------|
| [ValidationBehavior.cs](file:///d:/Work_Project/C_Sharp/Application/Behaviors/ValidationBehavior.cs) | Chặn request nếu dữ liệu không hợp lệ (throw `ValidationException`) |
| [AuthorizationBehavior.cs](file:///d:/Work_Project/C_Sharp/Application/Behaviors/AuthorizationBehavior.cs) | Kiểm tra `UserId > 0` và quyền sở hữu Playlist |

---

## 🔐 Phần 3 — Chức Năng Xác Thực (Auth)

### Luồng Đăng Ký (Register)

```
POST /api/auth/register
    ↓ [AuthController] nhận RegisterCommand
    ↓ _mediator.Send(RegisterCommand)
    ↓ ValidationBehavior kiểm tra email/password hợp lệ
    ↓ [RegisterCommandHandler] xử lý:
       - Kiểm tra username/email đã tồn tại chưa (Dapper + SQL)
       - Hash mật khẩu bằng BCrypt
       - INSERT vào bảng users
    ↓ Trả về thông báo thành công
```

### Luồng Đăng Nhập (Login) + Tạo JWT

```
POST /api/auth/login  →  LoginCommand { Username, Password }
    ↓ [LoginCommandHandler]:
       - SELECT user từ DB theo Username
       - BCrypt.Verify(password, hash) → kiểm tra mật khẩu
       - Tạo JWT Token chứa Claim: { "id": userId, "name": username }
       - Token có thời hạn 7 ngày, ký bằng HMAC-SHA256
    ↓ Trả về: { Token: "eyJ..." }
```

### Luồng Quên Mật Khẩu (OTP Flow)

```
POST /api/auth/forgot-password  → Kiểm tra email tồn tại
    ↓ Gửi OTP qua Email (EmailService dùng MailKit/SMTP)
    ↓ Lưu OTP vào bảng user_otps có thời hạn

POST /api/auth/verify-otp  → Kiểm tra OTP hợp lệ
POST /api/auth/reset-password  → Cập nhật mật khẩu mới (đã hash)
```

### File cần đọc:
| File | Nội dung |
|------|---------|
| [LoginCommandHandler.cs](file:///d:/Work_Project/C_Sharp/Application/Features/Auth/Handlers/LoginCommandHandler.cs) | Logic đăng nhập + tạo JWT |
| [RegisterCommandHandler.cs](file:///d:/Work_Project/C_Sharp/Application/Features/Auth/Handlers/RegisterCommandHandler.cs) | Logic đăng ký + BCrypt hash |
| [AuthController.cs](file:///d:/Work_Project/C_Sharp/API/Controllers/AuthController.cs) | Endpoint HTTP cho Auth |

---

## 🎵 Phần 4 — Chức Năng Bài Hát (Songs) — Phức Tạp Nhất

### Luồng Upload Bài Hát

```
POST /api/songs  (multipart/form-data: audio + video + cover + metadata)
    ↓ [SongsController] tạo UploadSongCommand
    ↓ [SongCommandHandlers.Handle(UploadSongCommand)]:
       [1] Validate định dạng file:
           - Audio: .mp3, .wav, .flac, .aac, .ogg
           - Video: .mp4, .webm, .mov, .avi, .mkv
           - Image: .jpg, .jpeg, .png, .webp, .gif
       [2] Upload lên Cloudinary:
           - UploadAudioAsync() → folder "tunevault/audio"
           - UploadVideoAsync() → folder "tunevault/video"
           - UploadImageAsync() → folder "tunevault/images" (resize 500x500)
       [3] Nhận URL từ Cloudinary (HTTPS secure)
       [4] Tạo Song entity, INSERT vào DB qua SongRepository
    ↓ Trả về SongDTO với id của bài vừa tạo
```

### Luồng Stream Nhạc/Video

```
GET /api/songs/{id}/stream  (AllowAnonymous)
    ↓ Lấy AudioUrl từ DB
    ↓ Dùng HttpClient fetch stream từ Cloudinary URL
    ↓ Trả về File(stream, contentType, enableRangeProcessing: true)
      → Range Processing = Hỗ trợ tua nhạc (HTTP 206 Partial Content)
```

### Luồng Query Bài Hát (SongRepository - Dapper)

Mỗi query đều **JOIN 2 bảng**:
```sql
SELECT s.*, c.Name as CategoryName,
       a.WorldRank, a.Followers, a.MonthlyListeners, a.Bio, a.IsVerified
FROM songs s
LEFT JOIN artists a ON s.ArtistId = a.Id
LEFT JOIN categories c ON s.CategoryId = c.Id
```
→ Lý do: `Song entity` trong Domain chứa cả thông tin nghệ sĩ để giảm số lần query.

### File cần đọc:
| File | Nội dung |
|------|---------|
| [SongsController.cs](file:///d:/Work_Project/C_Sharp/API/Controllers/SongsController.cs) | Toàn bộ REST API cho bài hát |
| [SongCommandHandlers.cs](file:///d:/Work_Project/C_Sharp/Application/Features/Songs/Handlers/SongCommandHandlers.cs) | Upload, Update, Delete song |
| [SongRepository.cs](file:///d:/Work_Project/C_Sharp/Infrastructure/Repositories/SongRepository.cs) | SQL query với Dapper |
| [CloudinaryService.cs](file:///d:/Work_Project/C_Sharp/Infrastructure/Services/CloudinaryService.cs) | Upload media lên cloud |
| [Song.cs](file:///d:/Work_Project/C_Sharp/Domain/Entities.cs/Song.cs) | Entity model của bài hát |

---

## 👥 Phần 5 — Chức Năng Follow (2 loại)

Hệ thống có **2 loại follow riêng biệt**:

### Follow Artist (Nghệ sĩ)
```
Bảng DB: follows (UserId, ArtistId)
POST /api/follow/{artistId}   → FollowArtistCommand
DELETE /api/follow/{artistId} → UnfollowArtistCommand

Khi follow: INSERT follows + UPDATE artists SET Followers = Followers + 1
Khi unfollow: DELETE follows + UPDATE artists SET Followers = Followers - 1
(Dùng IF NOT EXISTS để tránh duplicate)
```

### Follow User (Người dùng khác)
```
Bảng DB: user_follows (FollowerId, FollowedUserId)
POST /api/follow/user/{targetUserId}   → FollowUserCommand
DELETE /api/follow/user/{targetUserId} → UnfollowUserCommand
```

### File cần đọc:
| File | Nội dung |
|------|---------|
| [FollowController.cs](file:///d:/Work_Project/C_Sharp/API/Controllers/FollowController.cs) | 9 endpoints cho follow/unfollow |
| [FollowRepository.cs](file:///d:/Work_Project/C_Sharp/Infrastructure/Repositories/FollowRepository.cs) | SQL thực thi follow, cập nhật counter |

---

## 🔔 Phần 6 — Chức Năng Thông Báo Real-time (SignalR)

### Kiến trúc Notification

```
Công nghệ: ASP.NET Core SignalR (WebSocket)

[Client React] ←→ WebSocket ←→ [NotificationHub]
                                  (JWT xác thực qua query ?access_token=...)

Luồng Share Media:
    User A → POST /api/notification/share-media { receiverId, mediaId, mediaType }
        ↓ ShareMediaCommand → lưu vào DB (bảng media_shares + notifications)
        ↓ _hubContext.Clients.User(receiverId).SendAsync("ReceiveNotification")
        ↓ User B nhận event "ReceiveNotification" qua WebSocket
        ↓ Frontend tự động fetch lại GET /api/notification/my-notifications
```

### CustomUserIdProvider
```csharp
// Lấy userId từ JWT claim "id" để map với SignalR connection
public string? GetUserId(HubConnectionContext connection)
    => connection.User?.FindFirst("id")?.Value;
```
→ Cho phép `_hubContext.Clients.User("42")` gửi đến đúng user có id=42.

### File cần đọc:
| File | Nội dung |
|------|---------|
| [NotificationHub.cs](file:///d:/Work_Project/C_Sharp/API/Hubs/NotificationHub.cs) | Hub xử lý connect/disconnect |
| [NotificationController.cs](file:///d:/Work_Project/C_Sharp/API/Controllers/NotificationController.cs) | API share, đọc, đánh dấu đã đọc |
| [NotificationRepository.cs](file:///d:/Work_Project/C_Sharp/Infrastructure/Repositories/NotificationRepository.cs) | SQL cho notifications |

---

## 🎵 Phần 7 — Chức Năng Playlist

### Các tính năng:
- Tạo/Xóa Playlist của user
- Thêm/Xóa bài hát khỏi playlist
- Toggle công khai/riêng tư (`IsPublic`)
- Kiểm tra playlist nào đang chứa bài hát X

### Cơ chế bảo vệ quyền sở hữu (AuthorizationBehavior):
```
Command có implements IRequirePlaylistOwnership?
    → AuthorizationBehavior tự động kiểm tra playlist.UserId == currentUserId
    → Không cần viết lại logic kiểm tra trong mỗi handler
```

### File cần đọc:
| File | Nội dung |
|------|---------|
| [PlaylistsController.cs](file:///d:/Work_Project/C_Sharp/API/Controllers/PlaylistsController.cs) | 8 endpoints playlist |
| `Application/Features/Playlists/` | Commands + Handlers + Queries |

---

## 🤖 Phần 8 — Chức Năng AI (TuneBot)

### AI Stream Chat
```
POST /api/ai/chat  (SSE - Server-Sent Events, stream response)
    ↓ [LocalAiService.ChatStreamAsync()]
    ↓ Gọi HTTP đến AI server (OpenAI-compatible API, ngrok URL)
    ↓ Nhận từng token stream (data: {"choices":[{"delta":{"content":"..."}}]})
    ↓ yield return từng token → ASP.NET pipe về Frontend dạng stream
```

### AI Auto-Tag Bài Hát
```
POST /api/ai/auto-tag { title, artist }
    ↓ Gửi prompt đến AI: "Phân tích bài hát X của Y, trả về 3-5 thẻ JSON"
    ↓ Parse JSON response, làm sạch markdown nếu có
    ↓ Trả về List<string> tags
```

### File cần đọc:
| File | Nội dung |
|------|---------|
| [LocalAiService.cs](file:///d:/Work_Project/C_Sharp/Infrastructure/Services/LocalAiService.cs) | AI streaming + auto-tag |
| [AiController.cs](file:///d:/Work_Project/C_Sharp/API/Controllers/AiController.cs) | Endpoint AI |

---

## 🗃️ Phần 9 — Cơ Sở Dữ Liệu

### Các bảng chính:
| Bảng | Mô tả |
|------|-------|
| `users` | Người dùng, lưu PasswordHash (BCrypt) |
| `songs` | Bài hát: AudioUrl, VideoUrl, CoverUrl (URL Cloudinary) |
| `artists` | Nghệ sĩ: Followers, WorldRank, MonthlyListeners |
| `categories` | Thể loại nhạc |
| `playlists` | Playlist của user, có IsPublic |
| `playlist_songs` | Bảng trung gian Playlist ↔ Song |
| `albums` | Album nhạc |
| `follows` | User theo dõi Artist |
| `user_follows` | User theo dõi User khác |
| `notifications` | Thông báo hệ thống |
| `media_shares` | Chia sẻ bài hát/album/playlist giữa user |
| `play_history` | Lịch sử phát nhạc |
| `user_otps` | OTP xác thực email (có thời hạn) |
| `media_tags` | Tag AI tự động gắn cho bài hát |

### Công nghệ DB:
- **SQL Server** + **Dapper** (micro-ORM, viết SQL thô, nhanh hơn EF Core)
- Không dùng Entity Framework → phải đọc SQL trực tiếp trong các Repository

### File cần đọc:
| File | Nội dung |
|------|---------|
| [init.sql](file:///d:/Work_Project/C_Sharp/init.sql) | Toàn bộ schema DB + dữ liệu mẫu |

---

## 📋 Phần 10 — Thứ Tự Đọc Code Đề Xuất

### 🟢 Giai đoạn 1 — Nền tảng (1-2 giờ)
1. Đọc [README.md](file:///d:/Work_Project/C_Sharp/README.md) — tổng quan dự án
2. Đọc [Program.cs](file:///d:/Work_Project/C_Sharp/API/Program.cs) — hiểu cách app khởi động và DI
3. Đọc [init.sql](file:///d:/Work_Project/C_Sharp/init.sql) — hiểu schema DB
4. Đọc [Song.cs](file:///d:/Work_Project/C_Sharp/Domain/Entities.cs/Song.cs) và [User.cs](file:///d:/Work_Project/C_Sharp/Domain/Entities.cs/User.cs)

### 🟡 Giai đoạn 2 — CQRS Pipeline (30 phút)
5. Đọc [DependencyInjection.cs](file:///d:/Work_Project/C_Sharp/Application/DependencyInjection.cs)
6. Đọc [ValidationBehavior.cs](file:///d:/Work_Project/C_Sharp/Application/Behaviors/ValidationBehavior.cs)
7. Đọc [AuthorizationBehavior.cs](file:///d:/Work_Project/C_Sharp/Application/Behaviors/AuthorizationBehavior.cs)

### 🟠 Giai đoạn 3 — Chức năng Auth (45 phút)
8. Đọc [AuthController.cs](file:///d:/Work_Project/C_Sharp/API/Controllers/AuthController.cs)
9. Đọc [LoginCommandHandler.cs](file:///d:/Work_Project/C_Sharp/Application/Features/Auth/Handlers/LoginCommandHandler.cs)
10. Đọc [RegisterCommandHandler.cs](file:///d:/Work_Project/C_Sharp/Application/Features/Auth/Handlers/RegisterCommandHandler.cs)

### 🔴 Giai đoạn 4 — Chức năng chính (2-3 giờ)
11. Đọc [SongsController.cs](file:///d:/Work_Project/C_Sharp/API/Controllers/SongsController.cs) + [SongCommandHandlers.cs](file:///d:/Work_Project/C_Sharp/Application/Features/Songs/Handlers/SongCommandHandlers.cs) + [SongRepository.cs](file:///d:/Work_Project/C_Sharp/Infrastructure/Repositories/SongRepository.cs)
12. Đọc [CloudinaryService.cs](file:///d:/Work_Project/C_Sharp/Infrastructure/Services/CloudinaryService.cs)
13. Đọc [FollowController.cs](file:///d:/Work_Project/C_Sharp/API/Controllers/FollowController.cs) + [FollowRepository.cs](file:///d:/Work_Project/C_Sharp/Infrastructure/Repositories/FollowRepository.cs)
14. Đọc [NotificationController.cs](file:///d:/Work_Project/C_Sharp/API/Controllers/NotificationController.cs) + [NotificationHub.cs](file:///d:/Work_Project/C_Sharp/API/Hubs/NotificationHub.cs)
15. Đọc [PlaylistsController.cs](file:///d:/Work_Project/C_Sharp/API/Controllers/PlaylistsController.cs)
16. Đọc [LocalAiService.cs](file:///d:/Work_Project/C_Sharp/Infrastructure/Services/LocalAiService.cs)

---

## ⚙️ Phần 11 — Kỹ Thuật & Pattern Nổi Bật

| Kỹ thuật | Mô tả | Nơi áp dụng |
|---------|-------|-------------|
| **Clean Architecture** | Tách biệt 4 tầng rõ ràng | Toàn dự án |
| **CQRS** | Command (write) tách biệt Query (read) | `Application/Features/` |
| **MediatR Pipeline** | Middleware-style cho business logic | `Application/Behaviors/` |
| **Dapper** | Micro-ORM, SQL thô, hiệu năng cao | `Infrastructure/Repositories/` |
| **BCrypt** | Hash mật khẩu an toàn (cost factor) | `LoginCommandHandler` |
| **JWT Bearer** | Xác thực stateless, Claim "id" | `Program.cs` + tất cả [Authorize] |
| **SignalR** | WebSocket real-time notification | `NotificationHub` |
| **Cloudinary** | CDN lưu trữ audio/video/image | `CloudinaryService` |
| **SSE Streaming** | Stream AI response từng token | `LocalAiService` |
| **FluentValidation** | Validate input declaratively | `Application/Features/*/Validators/` |
| **Range Processing** | Hỗ trợ tua nhạc HTTP 206 | `SongsController.StreamAudio()` |

---

## 🚀 Phần 12 — Cách Chạy & Kiểm Tra

```bash
# Chạy với Docker Compose (SQL Server + API)
docker-compose up

# Chạy local (cần SQL Server đang chạy)
cd API && dotnet run

# Xem tài liệu API tự động (Swagger)
http://localhost:5000/swagger

# Test API bằng Swagger collection
Swagger_API_Collection.json  (import vào Swagger/Postman)
```

> [!TIP]
> Đọc [Deploy.md](file:///d:/Work_Project/C_Sharp/Deploy.md) và [SETUP_GUIDE.md](file:///d:/Work_Project/C_Sharp/SETUP_GUIDE.md) để biết cách setup môi trường đầy đủ.

> [!IMPORTANT]
> JWT Secret Key được hardcode: `"Chuoi_Bi_Mat_Cuc_Ky_Dai_Va_An_Toan_123456"` — cả trong [Program.cs](file:///d:/Work_Project/C_Sharp/API/Program.cs#L71) lẫn [LoginCommandHandler.cs](file:///d:/Work_Project/C_Sharp/Application/Features/Auth/Handlers/LoginCommandHandler.cs#L60). Đây là điểm bảo mật cần lưu ý.
