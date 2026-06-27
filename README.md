# 🎵 TuneVault - Nền tảng Nghe Nhạc Trực Tuyến
[![.NET Version](https://img.shields.io/badge/.NET-8.0-blue.svg)](https://dotnet.microsoft.com/)
[![React Version](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-2022-CC292B.svg)](https://www.microsoft.com/en-us/sql-server)
[![CI Pipeline](https://github.com/nguyenthanhnhan140106-cmyk/DoAnC_sharp/actions/workflows/ci.yml/badge.svg)](https://github.com/nguyenthanhnhan140106-cmyk/DoAnC_sharp/actions/workflows/ci.yml)
[![Status](https://img.shields.io/badge/Status-Hoàn%20thiện-success.svg)]()

> **🌐 Live Demo (Đã Deploy lên Cloud):**
> - **Frontend (Vercel):** [https://do-an-c-sharp-x2jb.vercel.app/](https://do-an-c-sharp-x2jb.vercel.app/)
> - **Backend API (Somee):** [http://tunevault-backend.somee.com/swagger](http://tunevault-backend.somee.com/swagger)
>
> 🔑 **Tài khoản Test nhanh:**
> - **Tài khoản 1 (Admin):** `admin` | **Mật khẩu:** `123456`

## 📋 Mục lục
- [Giới thiệu](#📝-giới-thiệu)
- [Tính năng chính](#🚀-tính-năng-chính)
- [Công nghệ sử dụng](#🛠️-công-nghệ-sử-dụng)
- [Cấu trúc dự án](#📁-cấu-trúc-dự-án)
- [Kiến trúc & Application Pipeline](#🔧-kiến-trúc-hệ-thống-clean-architecture)
- [Cài đặt & Hướng dẫn chạy](#📦-cài-đặt--hướng-dẫn-chạy)
- [Hướng dẫn đóng góp](#👥-hướng-dẫn-đóng-góp)
- [Xử lý sự cố](#🐛-xử-lý-sự-cố)
- [Tài liệu tham khảo](#📚-tài-liệu-tham-khảo--trích-dẫn-nguồn-mở-references)

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
| **CI/CD** | GitHub Actions | Tự động hóa kiểm tra lỗi biên dịch (Build & Test) khi Push code |

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

Dự án áp dụng chặt chẽ Pipeline Behavior (thông qua MediatR) kết hợp mô hình CQRS nhằm phân tách xử lý Command/Query cho toàn bộ 10 chức năng cốt lõi.

👉 **Mô tả chi tiết luồng Pipeline (Workflow) của từng tính năng vui lòng xem tại tài liệu đính kèm: [PIPELINE_FEATURES_README.md](./PIPELINE_FEATURES_README.md)**

👉 **Bản vẽ sơ đồ cơ sở dữ liệu (ERD) vui lòng xem tại đây: [diagram/ERD.pdf](./diagram/ERD.pdf)**

---

## 📦 Cài đặt & Hướng dẫn chạy

Dự án hỗ trợ 2 chế độ chạy: **Chạy nhanh qua Online Backend** (khuyên dùng để test giao diện) và **Chạy Full Local** (dành cho việc phát triển toàn bộ hệ thống).

Yêu cầu môi trường chung: **Node.js 18+**. (Nếu chạy Full Local cần thêm **.NET 8 SDK**, **Docker Desktop**).

### 1. Tài khoản dùng thử (Seed Accounts)
Hệ thống (cả bản Online và Local) đã được nạp sẵn các tài khoản sau trong Database để test các tính năng Đăng nhập / Quản lý:
- **Tài khoản 1:** `admin`— Mật khẩu: `123456`

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

## 👥 Hướng dẫn đóng góp
Để đảm bảo code của nhóm luôn sạch sẽ và không bị Conflict, vui lòng tuân thủ quy tắc chia nhánh (Branching). 
👉 **Mọi chi tiết xin xem file `Git_workFlow.md`.**

---

## 🐛 Xử lý sự cố
- **Lỗi không kết nối được Database:** Chắc chắn bạn đã tắt SQL Server nội bộ (port 1433) nếu có và chạy lệnh Docker Compose.
- **Lỗi CORS khi gọi API:** Đảm bảo Backend đã chạy và URL Frontend đang là `http://localhost:5173`.
- Gặp lỗi khác? Hãy xem phần xử lý sự cố trong `SETUP_GUIDE.md`.

---

## ☁️ Thực hiện điểm Bonus: Deploy CI/CD lên Cloud
Nhóm đã hoàn thành xuất sắc yêu cầu Bonus ở Mục 9:
- **Pipeline CI (GitHub Actions):** Tự động build và test khi push code (File `.github/workflows/ci.yml`).
- **Deploy Frontend (Vercel):** Hoạt động ổn định tại `https://do-an-c-sharp-x2jb.vercel.app/`
- **Deploy Backend (Somee Cloud):** Backend Web API (.NET 8) và cơ sở dữ liệu SQL Server được triển khai tại `http://tunevault-backend.somee.com`.
- **Tài liệu hướng dẫn deploy:** Chi tiết quy trình đã được viết tại file [Deploy.md](./Deploy.md).

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