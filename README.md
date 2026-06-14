# 🎵 TuneVault - Nền tảng Nghe Nhạc Trực Tuyến
[![.NET Version](https://img.shields.io/badge/.NET-8.0-blue.svg)](https://dotnet.microsoft.com/)
[![React Version](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
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
    │ Entities │  │ Dapper / MySQL   │
    └──────────┘  └──────────────────┘
```

---

## 📦 Cài đặt & Hướng dẫn chạy Local
Yêu cầu: **Node.js 18+**, **.NET 8 SDK**, **Docker Desktop**, **DBeaver**.

### 1. Chuỗi kết nối Database (Connection String)
Nếu bạn mở file Solution `.sln` và chạy Backend trực tiếp trên máy (Local) qua Visual Studio/Rider, hãy đảm bảo MySQL đang mở Port `3307` và sử dụng thông số sau (đã có trong `appsettings.json`):
```text
Server=localhost,1433;Database=master;User Id=sa;Password=Aa123456;TrustServerCertificate=True;
```
*(Lưu ý: Nếu dùng lệnh `docker compose` thì dự án sẽ tự dùng chuỗi kết nối nội bộ `tunevault-db:1433` của Docker, bạn không cần quan tâm)*

### 2. Tài khoản chấm điểm (Seed Accounts)
Để thuận tiện cho giảng viên chấm bài, hệ thống đã được nạp sẵn (Seed Data) các tài khoản sau trong Database để test tính năng Đăng nhập / Quản lý:
- **Tài khoản 1:** `testuser` / `test@example.com` — Mật khẩu: `Aa123456`
- **Tài khoản 2:** `johndoe` / `john@example.com` — Mật khẩu: `Aa123456`
- **Tài khoản 3:** `janedoe` / `jane@example.com` — Mật khẩu: `Aa123456`

### 3. Các bước khởi chạy dự án nhanh
1. Clone dự án về máy và mở Terminal ở thư mục gốc.
2. Bật **Docker Desktop**.
3. Chạy lệnh: `docker compose up --build -d` để khởi động trọn bộ Backend API (chạy ở cổng `5000`) và Database SQL Server (cổng `1433`).
4. Mở thêm 1 Terminal mới, trỏ vào thư mục `Frontend`, chạy `npm install` và `npm run dev` để bật giao diện web (cổng `5173`).
5. Để test API tự động bằng **Postman**:
   - Import file `Swagger_API_Collection.json` (nằm ở thư mục gốc) vào phần mềm Postman.
   - Do file sử dụng biến môi trường, vui lòng cài đặt biến `baseUrl` thành `http://localhost:5000` trong Postman Environment (hoặc thay trực tiếp chữ `{{baseUrl}}` trong link) trước khi test. Mọi cấu trúc API (Method, Body, Parameters) đã được thiết lập sẵn.

👉 **Vui lòng đọc file `SETUP_GUIDE.md` để xem hướng dẫn cài đặt từng bước và cách xử lý lỗi chi tiết!**

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
  - Cấu hình Docker Compose để chạy MySQL.

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
- **Lỗi không kết nối được Database:** Chắc chắn bạn đã tắt XAMPP/WAMP (port 3306) và chạy lệnh Docker Compose.
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