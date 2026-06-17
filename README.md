# 🎵 TuneVault - Nền tảng Nghe Nhạc Trực Tuyến
[![.NET Version](https://img.shields.io/badge/.NET-8.0-blue.svg)](https://dotnet.microsoft.com/)
[![React Version](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-2022-CC292B.svg)](https://www.microsoft.com/en-us/sql-server)
[![Status](https://img.shields.io/badge/Status-Hoàn%20thiện-success.svg)]()

## 📋 Mục lục
- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#-cấu-trúc-dự-án)
- [Kiến trúc & Pipeline](#-kiến-trúc-hệ-thống-clean-architecture)
- [Cài đặt & Triển khai](#-cài-đặt)
- [Lộ trình phát triển](#️-lộ-trình-phát-triển)
- [Đóng góp](#-hướng-dẫn-đóng-góp)
- [Tài liệu tham khảo](#-tài-liệu-tham-khảo)

---

## 📝 Giới thiệu
**TuneVault** là một ứng dụng nghe nhạc trực tuyến (lấy cảm hứng từ Spotify), cung cấp nền tảng phát nhạc mượt mà với giao diện người dùng hiện đại và tối màu (Dark Theme). Dự án được thiết kế chặt chẽ theo mô hình **Clean Architecture**, tối ưu hóa tốc độ truy vấn bằng **Dapper** và hỗ trợ tính năng thông báo theo thời gian thực (Real-time).

---

## 🚀 Tính năng chính
- **Xác thực an toàn (Auth):** Đăng nhập, Đăng ký bằng JWT Token (Lưu trữ an toàn, phân quyền người dùng).
- **Phát nhạc đa phương tiện:** Trình phát nhạc chuyên nghiệp (Audio Player) với các tính năng Play, Pause, Next, Prev, Tua nhạc, và Điều chỉnh âm lượng.
- **Quản lý Thư viện:**
  - Tạo, sửa, xóa Playlist cá nhân.
  - Thêm bài hát vào danh sách Yêu thích (Favorites).
  - Lịch sử nghe nhạc (Recently Played).
- **Tương tác xã hội:** 
  - Follow/Unfollow Nghệ sĩ và người dùng khác.
  - Nhận thông báo Real-time khi nghệ sĩ ra bài mới hoặc có người follow (SignalR).
- **Giao diện hiện đại:** CSS thuần kết hợp CSS Grid/Flexbox, thiết kế responsive và các hiệu ứng micro-animations mượt mà.

---

## 🛠️ Công nghệ sử dụng

| Lớp/Layer | Công nghệ / Thư viện | Mục đích |
|-----------|-----------------------|-----------|
| **Frontend** | React (Vite), TypeScript | Xây dựng giao diện Single Page Application (SPA) |
| **Backend** | C# .NET 8 Web API | Xử lý logic nghiệp vụ, RESTful API |
| **Database** | SQL Server (Chạy qua Docker) | Lưu trữ dữ liệu quan hệ (Users, Songs, Playlists) |
| **ORM** | Dapper | Micro-ORM tối ưu hóa tốc độ truy vấn SQL |
| **Real-time**| SignalR | Đẩy thông báo thời gian thực từ Server xuống Client |
| **Bảo mật** | JWT, BCrypt.Net | Mã hóa mật khẩu và xác thực người dùng |

---

## 📁 Cấu trúc dự án
```text
C_Sharp/
├── API/                    # Web API: Controllers, Middleware, SignalR Hubs
├── Application/            # Logic nghiệp vụ: Services, DTOs, Interfaces
├── Domain/                 # Core: Entities (User, Song, Playlist)
├── Infrastructure/         # Kết nối DB: Dapper Repositories
├── Frontend/               # Mã nguồn giao diện React (src/Components, src/Pages)
├── init.sql                # Script khởi tạo Database & Seed Data
├── SETUP_GUIDE.md          # Hướng dẫn cài đặt chi tiết
├── Git_workFlow.md         # Quy trình làm việc nhóm với Git
├── docker-compose.yml      # Cấu hình Docker chạy Backend & DB
└── TuneVault.sln           # File Solution của dự án .NET
```

---

## 🔧 Kiến trúc hệ thống (Clean Architecture)

Luồng hoạt động và giao tiếp giữa các Layer trong hệ thống được quy định nghiêm ngặt để đảm bảo code không bị phụ thuộc chéo (Coupling):

```text
    ┌──────────────────────────────────┐
    │       React SPA (Frontend)       │
    │  Hiển thị UI & Gọi HTTP Request  │
    └────────────┬─────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────┐
    │       Web API (Controllers)      │
    │  Xử lý Request, Trả về JSON      │
    └────────────┬─────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────┐
    │      Application (Services)      │
    │  Logic nghiệp vụ, Mapping DTOs   │
    └────────────┬─────────────────────┘
                 │
          ┌──────┴──────┐
          ▼             ▼
    ┌──────────┐  ┌──────────────────┐
    │  Domain  │  │  Infrastructure  │
    │ Entities    │ Dapper / SQL Server│
    └──────────┘  └──────────────────┘
```

### 🔄 Application Pipeline & CQRS

Dự án áp dụng chặt chẽ Pipeline Behavior (thông qua MediatR) kết hợp mô hình CQRS nhằm phân tách xử lý Command/Query, kết hợp với các bước Pipeline trung gian. Dưới đây là mô tả luồng Pipeline cho các tính năng cốt lõi:

#### 1. Chức năng Xác thực (Authentication / Login)
- **Command/Query:** `LoginCommand`
- **Pipeline Behaviors:** `LoginValidator` (Validation Behavior - Kiểm tra tính hợp lệ của Email, Password).
- **Luồng hoạt động (Workflow):**
  1. **Frontend (React SPA)** gửi HTTP Request chứa `LoginDTO` (Email, Pass).
  2. **Web API (`AuthController`)** tiếp nhận, map dữ liệu thành `LoginCommand` và đẩy vào Mediator.
  3. **Application Pipeline** tự động kích hoạt `LoginValidator` để xác thực form đầu vào. Nếu dữ liệu không hợp lệ, chặn request và trả về lỗi 400.
  4. **Application Handler (`LoginCommandHandler`)** tiếp nhận Command:
     - Gọi `UserRepository` thuộc tầng Infrastructure (Database) để tìm `User` Entity theo Email.
     - Gọi `PasswordHasher` thuộc tầng Infrastructure (Security) để kiểm tra mật khẩu.
     - Gọi `JwtProvider` thuộc tầng Infrastructure (Security) để khởi tạo chuỗi JWT Token.
  5. **Handler** trả về kết quả `AuthResponseDTO` (chứa Token) ngược lại.
  6. **Controller** phản hồi `HTTP 200 OK` về lại phía Frontend để hoàn thành đăng nhập.

#### 2. Chức năng Cập nhật Hồ sơ (Update Profile)
- **Command/Query:** `UpdateProfileCommand`
- **Pipeline Behaviors:** 
  - `AuthBehavior` (Authorization Behavior - Kiểm tra JWT, đảm bảo đúng người dùng đang đăng nhập mới được phép sửa).
  - `UpdateProfileValidator` (Validation Behavior - Kiểm tra tính hợp lệ của dữ liệu đầu vào như định dạng file ảnh, độ dài tên...).
- **Luồng hoạt động (Workflow):**
  1. **Frontend (React SPA)** gửi HTTP Request chứa `UpdateDTO` và file ảnh Avatar.
  2. **Web API (`UsersController`)** tiếp nhận, map dữ liệu thành `UpdateProfileCommand` và đẩy vào Mediator.
  3. **Application Pipeline** tự động kích hoạt `AuthBehavior` và `UpdateProfileValidator` để xác thực quyền và kiểm tra form. Nếu lỗi, chặn request.
  4. **Application Handler (`UpdateProfileCommandHandler`)** tiếp nhận Command:
     - Cập nhật thông tin trực tiếp trên **Domain Entity (`User`)**.
     - Gọi `CloudinaryService` thuộc tầng Infrastructure để upload file ảnh lên mây và lấy URL trả về.
     - Gọi `UserRepository` thuộc tầng Infrastructure (Database) để lưu bản ghi xuống DB.
  5. **Handler** map dữ liệu và trả về kết quả `ProfileDTO` mới chứa thông tin đã cập nhật.
  6. **Controller** phản hồi `HTTP 200 OK` về lại phía Frontend.

#### 3. Chức năng Tải lên Bài hát (Upload Song)
- **Command/Query:** `CreateSongCommand`
- **Pipeline Behaviors:** 
  - `AuthBehavior` (Authorization Behavior - Kiểm tra quyền truy cập, đảm bảo người dùng đã đăng nhập).
  - `SongValidators` (Validation Behavior - Kiểm tra tính hợp lệ của metadata bài hát như tiêu đề, thể loại...).
- **Luồng hoạt động (Workflow):**
  1. **Frontend (React SPA)** gửi HTTP Request chứa `FormData` (bao gồm file âm thanh/hình ảnh và thông tin văn bản).
  2. **Web API (`SongsController`)** tiếp nhận. Khác với Profile, tại đây Controller sẽ gọi trực tiếp `CloudinaryService` (Infrastructure) để stream tải file lên Cloud và nhận về đường link URL.
  3. Sau khi có URL, Controller khởi tạo `CreateSongCommand` và đẩy vào Mediator.
  4. **Application Pipeline** kích hoạt `AuthBehavior` và `SongValidators` để cấp quyền và kiểm tra tính hợp lệ của dữ liệu.
  5. **Application Handler (`CreateSongCommandHandler`)** tiếp nhận Command:
     - Ánh xạ (Map) dữ liệu vào **Domain Entities (`Song`, `Category`)**.
     - Gọi `SongRepository` thuộc tầng Infrastructure (Database) để lưu thông tin bài hát mới vào SQL Server.
  6. **Handler** trả về `DTO` của bài hát vừa tạo.
  7. **Controller** phản hồi mã `HTTP 201 Created` về lại phía Frontend báo hiệu tải lên thành công.

#### 4. Chức năng Phát nhạc (Audio Player)
- **Command/Query:** `GetSongByIdQuery` (hoặc thông qua query lấy danh sách).
- **Pipeline Behaviors:** Cho phép truy cập công khai (Public Access), có sử dụng Validator để kiểm tra ID bài hát hợp lệ.
- **Luồng hoạt động (Workflow):**
  1. **Giao diện người dùng** (Nút Play, Queue) phát sinh sự kiện bấm phát một bài hát hoặc danh sách.
  2. **React Global State** (Ví dụ: Context API / Zustand) tiếp nhận và gọi **Web API** để lấy thông tin chi tiết bài hát, quan trọng nhất là `AudioUrl`.
  3. **Web API** xử lý `Query`, lấy dữ liệu từ Database và trả thông tin URL về cho Frontend.
  4. Frontend tự động nạp URL này vào thẻ **Trình phát HTML5** (`<audio src="...">`).
  5. Thẻ Audio của trình duyệt tự động kết nối thẳng đến **Cloudinary Storage** để tải luồng dữ liệu nhạc (Media Streaming) và bắt đầu phát.
  6. Các thao tác điều khiển tiếp theo (Pause, Seek, Next) từ UI sẽ được Global State truyền lệnh trực tiếp xuống thẻ Audio HTML5.

#### 5. Chức năng Xem Music Video (Video Player)
- **Command/Query:** `GetVideoByIdQuery` (hoặc thông qua query lấy chi tiết bài hát có MV).
- **Pipeline Behaviors:** Cho phép truy cập công khai (Public Access), có Validator kiểm tra ID hợp lệ.
- **Luồng hoạt động (Workflow):**
  1. **Giao diện người dùng** (Nút xem MV) phát sinh sự kiện mở Video (hiển thị qua Modal hoặc Full-page).
  2. Frontend gọi **Web API (`SongsController`)** để lấy thông tin chi tiết, nhận về `VideoUrl` (đường dẫn video mp4) và `CoverUrl` (ảnh nền Thumbnail poster).
  3. Frontend tự động nạp các URL này vào thẻ **Trình phát HTML5 Video** (`<video src="..." poster="...">`).
  4. Trình duyệt kết nối trực tiếp đến **Cloudinary Storage** (nơi lưu trữ và tự động optimize video) để tải luồng dữ liệu phân mảnh (Video Streaming) và hiển thị cho người dùng.

#### 6. Chức năng Quản lý Playlist (Tạo mới & Thêm bài hát)
- **Command/Query:** `CreatePlaylistCommand` và `AddSongToPlaylistCommand`.
- **Pipeline Behaviors:** 
  - `AuthBehavior` (Authorization Behavior - Kiểm tra JWT và đặc biệt kiểm tra quyền Chủ sở hữu - Owner của Playlist).
  - `PlaylistValidators` (Validation Behavior - Kiểm tra định dạng tên Playlist, kiểm tra SongId truyền lên có tồn tại không).
- **Luồng hoạt động (Workflow):**
  1. **Frontend (React SPA)** gửi HTTP Request chứa dữ liệu (Tên Playlist mới hoặc SongId cần thêm vào Playlist có sẵn).
  2. **Web API (`PlaylistsController`)** tiếp nhận, map dữ liệu thành Command tương ứng và đẩy vào Mediator.
  3. **Application Pipeline** kích hoạt `AuthBehavior` (sẽ chặn và báo lỗi 403 Forbidden nếu người dùng cố gắng thêm bài hát vào Playlist của người khác) và `PlaylistValidators` để kiểm tra form.
  4. **Application Handler** (`CreatePlaylistHandler` hoặc `AddSongToPlaylistHandler`) tiếp nhận Command:
     - Tạo mới thực thể **Domain Entity (`Playlist`)** hoặc thiết lập quan hệ Nhiều-Nhiều thông qua Entity trung gian (`PlaylistSong`).
     - Gọi `PlaylistRepository` (thuộc tầng Infrastructure) để ghi thay đổi trực tiếp vào Cơ sở dữ liệu SQL Server.
  5. **Handler** trả về kết quả `PlaylistDTO` chứa thông tin Playlist sau khi cập nhật.
  6. **Controller** phản hồi mã `HTTP 200 OK` (nếu thêm bài thành công) hoặc `HTTP 201 Created` (nếu tạo Playlist mới thành công) về lại phía Frontend.

#### 7. Chức năng Tìm kiếm & Khám phá (Search & Discover)
- **Command/Query:** `SearchMediaQuery`
- **Pipeline Behaviors:** `SearchQueryValidator` (Validation Behavior - Kiểm tra độ dài từ khóa đầu vào, chống spam request).
- **Luồng hoạt động (Workflow):**
  1. **Frontend (React SPA)** gửi HTTP Request khi người dùng nhập từ khóa (gửi qua query params: `?q=abc`).
  2. **Web API (`SongsController` / `PlaylistsController`)** tiếp nhận, khởi tạo `SearchMediaQuery` và đẩy vào Mediator.
  3. **Application Pipeline** tự động kích hoạt `SearchQueryValidator` để kiểm tra độ dài từ khóa, loại bỏ các query rỗng hoặc không hợp lệ.
  4. **Application Handler (`SearchMediaQueryHandler`)** phân tích truy vấn để tìm kiếm chéo trên các **Domain Entities** (`Song`, `Artist`, `Playlist`).
  5. Handler gọi tầng **Infrastructure (`EF Core Repository` / `Dapper`)** để thực hiện câu lệnh tìm kiếm (`SQL LIKE`) và xử lý phân trang (`Skip/Take`).
  6. Repository trả về danh sách Top các kết quả phù hợp nhất.
  7. **Handler** ánh xạ (Map) các kết quả này sang `SearchResultDTO`.
  8. **Controller** phản hồi mã `HTTP 200 OK` chứa tập dữ liệu trả về cho Frontend hiển thị.

#### 8. Chức năng Chia sẻ Bài hát / Playlist (Share & Real-time Notification)
*Đây là một trong những chức năng phức tạp của hệ thống, kết hợp giữa thao tác lưu trữ CSDL truyền thống và đẩy thông báo thời gian thực (Real-time) qua WebSockets.*

- **Command/Query:** `ShareMediaCommand`
- **Pipeline Behaviors:** 
  - `AuthBehavior`: Xác thực người dùng (bắt buộc đăng nhập).
  - `ShareValidator`: Kiểm tra tính hợp lệ của bài hát, và **ngăn chặn người dùng tự Share cho chính mình** (Business logic validation).
- **Luồng hoạt động (Workflow chi tiết):**
  1. **Tương tác Frontend:** Người dùng bấm nút "Share" trên React SPA, chọn người nhận. Frontend đóng gói dữ liệu thành `ShareMediaDTO` và gửi Request.
  2. **Tiếp nhận Request:** `MediaSharesController` tại tầng Web API nhận DTO, chuyển đổi thành `ShareMediaCommand` và gửi vào Mediator.
  3. **Xử lý Pipeline:** Command đi qua Application Pipeline. `AuthBehavior` xác thực quyền, sau đó `ShareValidator` kiểm tra các rủi ro logic (như tự Share cho chính mình). Nếu vi phạm, Pipeline lập tức chặn đứng luồng và trả về lỗi `HTTP 400 Bad Request`.
  4. **Khởi tạo Domain Entities:** Nếu Pipeline hợp lệ, `ShareMediaCommandHandler` tiếp nhận Command và khởi tạo đồng thời 2 thực thể:
     - `MediaShare`: Lưu lịch sử chia sẻ.
     - `Notification`: Lưu nội dung thông báo cho người nhận.
  5. **Ghi Database:** Handler gọi `MediaShareRepo` (Infrastructure) lưu cả 2 thực thể trên vào SQL Server một cách đồng bộ.
  6. **Kích hoạt Real-time (SignalR):** Ngay sau khi lưu CSDL thành công, Handler gọi `SignalR Hub` (Infrastructure) để phát tín hiệu thông báo (Push Notification).
  7. **Đẩy WebSockets:** `SignalR Hub` truyền bản tin qua giao thức WebSockets trực tiếp đến trình duyệt của người nhận (nếu đang online), giúp React SPA hiện Pop-up thông báo tức thời mà không cần reload trang.
  8. **Hoàn tất:** Handler map kết quả thành `ResponseDto` trả ngược lại.
  9. **Phản hồi:** Controller trả về `HTTP 200 OK` cho người gửi để hoàn tất luồng.

#### 9. Chức năng Quản lý Thông báo (Notification Management)
*Cùng với chức năng Share, hệ thống cung cấp API để người dùng có thể quản lý danh sách thông báo của cá nhân (Lấy danh sách và Đánh dấu đã đọc).*

- **Command/Query:** `GetMyNotificationsQuery` (Lấy danh sách) và `MarkNotificationAsReadCommand` (Đánh dấu đã đọc).
- **Pipeline Behaviors:** 
  - `AuthBehavior`: Đóng vai trò then chốt trong việc bảo mật, **chặn đứng hành vi xem trộm** hoặc can thiệp vào thông báo của người khác bằng cách xác thực chính chủ thông qua JWT Token.
- **Luồng hoạt động (Workflow chi tiết):**
  1. **Tương tác Frontend:** Người dùng bấm vào biểu tượng "Quả chuông" trên giao diện React SPA. Frontend gửi HTTP Request (`GET` để lấy danh sách hoặc `PUT` để đánh dấu đã đọc).
  2. **Tiếp nhận Request:** `NotificationsController` nhận Request, map thành `GetMyNotificationsQuery` hoặc `MarkNotificationAsReadCommand` tương ứng và đẩy vào Mediator.
  3. **Xử lý Pipeline (Bảo mật):** Application Pipeline kích hoạt `AuthBehavior`. Bước này cực kỳ quan trọng để đảm bảo User A không thể query hay đánh dấu đọc thông báo của User B. Nếu phát hiện vi phạm bảo mật, Pipeline lập tức từ chối và trả về HTTP 403 Forbidden.
  4. **Application Handler xử lý:** Nếu đi qua an toàn, Handler (`GetMyNotificationsQueryHandler` hoặc `MarkNotificationAsReadHandler`) sẽ tiếp nhận:
     - Đối với tính năng đánh dấu đọc: Cập nhật trực tiếp trạng thái thuộc tính `IsRead = true` trên **Domain Entity (`Notification`)**.
  5. **Tương tác Cơ sở dữ liệu:** Handler gọi `NotificationRepository` (thuộc tầng Infrastructure) để thực hiện truy vấn danh sách hoặc cập nhật trạng thái mới xuống DB SQL Server.
  6. **Phản hồi dữ liệu:** Sau khi Repository hoàn thành, Handler tiến hành ánh xạ (Map) thực thể thành `NotificationDTO`.
  7. **Kết thúc luồng:** Controller nhận DTO và phản hồi mã `HTTP 200 OK` về lại Frontend để cập nhật UI (ví dụ: tắt chấm đỏ ở quả chuông).

#### 10. Chức năng Tương tác & Lịch sử (Favorites & Play History)
- **Command/Query:** `ToggleFavoriteCommand` (Thích / Bỏ thích bài hát) và `RecordPlayHistoryCommand` (Lưu lịch sử nghe nhạc).
- **Pipeline Behaviors:** `AuthBehavior` (Kiểm tra JWT để đảm bảo người dùng đã đăng nhập mới được lưu lịch sử và thả tim).
- **Luồng hoạt động (Workflow):**
  1. **Frontend (React SPA):** 
     - Khi người dùng bấm nút "Trái tim", Frontend gửi Request yêu cầu chuyển đổi (Toggle) trạng thái Favorite.
     - Khi một bài hát bắt đầu phát, Frontend tự động gửi Request ngầm để ghi nhận Lịch sử nghe.
  2. **Web API (`FavoritesController` / `HistoryController`)** tiếp nhận, tạo Command tương ứng và đẩy vào Mediator.
  3. **Application Pipeline** kích hoạt `AuthBehavior` để xác thực định danh người dùng.
  4. **Application Handler** (`ToggleFavoriteCommandHandler` hoặc `RecordPlayHistoryCommandHandler`) tiếp nhận và xử lý logic:
     - Tạo mới hoặc Xóa bỏ **Domain Entity (`Favorite`)** (đối với tính năng thả tim).
     - Khởi tạo mới **Domain Entity (`PlayHistory`)** (đối với tính năng lịch sử).
  5. Handler gọi tầng **Infrastructure (`FavoriteRepository` / `HistoryRepository`)** để lưu các thay đổi này xuống cơ sở dữ liệu SQL Server.
  6. **Handler** trả về `DTO` chứa trạng thái sau khi cập nhật (ví dụ: trả về trạng thái `isLiked = true/false`).
  7. **Controller** phản hồi mã `HTTP 200 OK` về lại Frontend để cập nhật UI ngay lập tức (ví dụ: đổi màu trái tim sang đỏ).

---

## 📦 Cài đặt & Hướng dẫn chạy

Dự án hỗ trợ 2 chế độ chạy: **Chạy nhanh qua Online Backend** (khuyên dùng để test giao diện) và **Chạy Full Local** (dành cho việc phát triển toàn bộ hệ thống).

Yêu cầu môi trường chung: **Node.js 18+**. (Nếu chạy Full Local cần thêm **.NET 8 SDK**, **Docker Desktop**).

### 1. Tài khoản dùng thử (Seed Accounts)
Hệ thống (cả bản Online và Local) đã được nạp sẵn các tài khoản sau trong Database để test các tính năng Đăng nhập / Quản lý:
- **Tài khoản 1:** `testuser` / `test@example.com` — Mật khẩu: `Aa123456`
- **Tài khoản 2:** `johndoe` / `john@example.com` — Mật khẩu: `Aa123456`
- **Tài khoản 3:** `janedoe` / `jane@example.com` — Mật khẩu: `Aa123456`

### 2. Cách 1: Khởi chạy dự án nhanh (Sử dụng Backend Online - Khuyên dùng)
Hệ thống Backend và Database hiện đã được triển khai trực tuyến trên Somee Cloud. Bạn chỉ cần chạy Frontend:
1. Clone dự án về máy và mở Terminal.
2. Trỏ vào thư mục `Frontend`:
   ```bash
   cd Frontend
   ```
3. Cài đặt các thư viện:
   ```bash
   npm install
   ```
4. Chạy giao diện web:
   ```bash
   npm run dev
   ```
5. Mở trình duyệt và truy cập `http://localhost:5174`. Frontend sẽ tự động kết nối với Backend đang chạy online.

### 3. Cách 2: Khởi chạy Full Local (Cả Backend & Database dưới máy)
1. Clone dự án về máy và mở Terminal ở thư mục gốc.
2. Bật **Docker Desktop**.
3. Chạy lệnh sau để khởi động trọn bộ Backend API (chạy ở cổng `5000`) và Database SQL Server (cổng `1433`):
   ```bash
   docker compose up --build -d
   ```
4. Mở thêm 1 Terminal mới, trỏ vào thư mục `Frontend`, chạy `npm install` và `npm run dev` để bật giao diện web (cổng `5174`).
5. **Test API bằng Postman**: 
   - Import file `Swagger_API_Collection.json` (nằm ở thư mục gốc) vào phần mềm Postman.
   - Cài đặt biến môi trường `baseUrl` thành `http://localhost:5000` (hoặc thay trực tiếp chữ `{{baseUrl}}` trong link) trước khi test. Mọi cấu trúc API đã được thiết lập sẵn.

### 4. Chuỗi kết nối Database (Connection String)
Nếu bạn mở file Solution `.sln` và chạy Backend trực tiếp trên máy (Local) qua Visual Studio/Rider thay vì dùng Docker Compose, hãy đảm bảo SQL Server trong Docker đang mở Port `1433` và sử dụng thông số sau (đã có trong `appsettings.json`):
```text
Server=localhost,1433;Database=master;User Id=sa;Password=Aa123456;TrustServerCertificate=True;
```
*(Lưu ý: Nếu dùng lệnh `docker compose up` thì dự án sẽ tự dùng chuỗi kết nối nội bộ `tunevault-db:1433` của Docker, bạn không cần quan tâm)*

👉 **Vui lòng đọc file `SETUP_GUIDE.md` để xem hướng dẫn cài đặt chi tiết từng bước và cách xử lý lỗi!**

---

## 🗺️ Lộ trình phát triển

- [x] **Phase 1: Chuẩn bị & Khởi tạo (Tuần 3)**
  - Cài đặt môi trường phát triển (Node.js, .NET 8, Docker, DBeaver).
  - Phân công nhiệm vụ nhóm và thống nhất quy trình sử dụng Git.
  - Tìm hiểu mô hình Clean Architecture & React SPA.

- [x] **Phase 2: Thiết kế Hệ thống & Database (Tuần 4)**
  - Phân tích yêu cầu, vẽ sơ đồ ERD cho cơ sở dữ liệu.
  - Viết script khởi tạo dữ liệu `init.sql`.
  - Khởi tạo khung dự án Backend (.NET) và Frontend (Vite/React).
  - Cấu hình Docker Compose để chạy SQL Server.

- [x] **Phase 3: Cốt lõi Backend & Logic Nghiệp vụ (Tuần 5)**
  - Cài đặt hệ thống bảo mật Authentication (JWT, BCrypt).
  - Xây dựng các lớp Dapper Repositories (User, Song, Artist).
  - Hoàn thiện các API cốt lõi (CRUD) và cấu hình Swagger.

- [x] **Phase 4: Ghép nối Frontend, Trình phát nhạc & Deploy Cloud (Tuần 6-7)**
  - Dựng Layout giao diện chính bằng CSS Grid/Flexbox.
  - Xây dựng Trình phát nhạc (Audio Player) kết hợp Context API.
  - Kết nối Axios gọi API để lấy dữ liệu bài hát và playlist thực tế.
  - Huấn luyện mô hình AI (Gợi ý bài hát thông minh) và tích hợp vào hệ thống.
  - Nghiên cứu và triển khai (Deploy) Backend, Frontend, Database lên Cloud để ứng dụng chạy online 24/7 với tên miền public (truy cập được trên cả Mobile và PC).

- [x] **Phase 5: Real-time & Đóng gói dự án (Tuần 8)**
  - Tích hợp SignalR cho tính năng thông báo theo thời gian thực.
  - Tối ưu hóa UI/UX, dọn dẹp code rác và sửa các lỗi hiển thị nhỏ.
  - Hoàn thiện bộ tài liệu (`README.md`, `SETUP_GUIDE.md`) để báo cáo.

---

## 👥 Hướng dẫn đóng góp
Để đảm bảo code của nhóm luôn sạch sẽ và không bị Conflict, vui lòng tuân thủ quy tắc chia nhánh (Branching). 
👉 **Mọi chi tiết xin xem file `Git_workFlow.md`.**

---

## 🐛 Xử lý sự cố
- **Lỗi không kết nối được Database:** Chắc chắn bạn đã tắt SQL Server nội bộ (port 1433) nếu có và chạy lệnh Docker Compose.
- **Lỗi CORS khi gọi API:** Đảm bảo Backend đã chạy và URL Frontend đang là `http://localhost:5173`.
- Gặp lỗi khác? Hãy xem phần xử lý sự cố trong `SETUP_GUIDE.md`.

---

## 📚 Tài liệu tham khảo & Trích dẫn Nguồn mở (References)
Đồ án có tham khảo mã nguồn, tài liệu và sử dụng các thư viện mã nguồn mở sau đây:

[1] **ASP.NET Core:** Nền tảng cốt lõi xây dựng Web API. Available: https://learn.microsoft.com/aspnet/core
[2] **Entity Framework Core:** Công cụ ORM cơ sở. Available: https://learn.microsoft.com/ef/core
[3] **Dapper:** Micro-ORM để tối ưu tốc độ truy vấn SQL. Available: https://github.com/DapperLib/Dapper
[4] **MediatR (Pipeline Pattern):** Quản lý CQRS. Available: https://github.com/jbogard/MediatR
[5] **FluentValidation:** Thư viện Validate dữ liệu. Available: https://docs.fluentvalidation.net
[6] **Clean Architecture (Jason Taylor template):** Khuôn mẫu kiến trúc dự án Backend. Available: https://github.com/jasontaylordev/CleanArchitecture
[7] **SignalR:** Triển khai WebSocket để đẩy thông báo thời gian thực. Available: https://learn.microsoft.com/aspnet/core/signalr
[8] **Anthropic API (Claude) / Google Gemini API:** Tích hợp tính năng AI Chatbot thông minh. Available: https://docs.anthropic.com/en/api/getting-started
[9] **React:** Thư viện giao diện Frontend. Available: https://react.dev
[10] **Vite:** Công cụ Build Tool cực nhanh cho SPA. Available: https://vitejs.dev
[11] **Rubric B1 ("Clean Architecture & Cấu trúc solution"):** Áp dụng chi tiết các tiêu chí chấm điểm cho mục B1 để xác định 4 project cốt lõi, Dependency Rule, kỹ thuật Dependency Injection (DI) và việc bóc tách triệt để logic nghiệp vụ.

---
*Cập nhật lần cuối: Tháng 6, 2026* | *Trạng thái: 🟢 Hoàn thiện đồ án*