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
| **Database** | MySQL (Chạy qua Docker) | Lưu trữ dữ liệu quan hệ (Users, Songs, Playlists) |
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

## 📦 Cài đặt
Yêu cầu: **Node.js 18+**, **.NET 8 SDK**, **Docker Desktop**, **DBeaver**.

Cài đặt nhanh:
1. Clone dự án về máy.
2. Bật Docker Desktop.
3. Chạy lệnh: `docker compose up --build -d` để khởi động Backend và Database.
4. Mở thư mục `Frontend`, chạy `npm install` và `npm run dev` để bật web.

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

## 📚 Tài liệu tham khảo
- [Microsoft .NET 8 Docs](https://learn.microsoft.com/en-us/dotnet/)
- [Dapper ORM Documentation](https://github.com/DapperLib/Dapper)
- [React & Vite Setup](https://vitejs.dev/guide/)

---
*Cập nhật lần cuối: Tháng 6, 2026* | *Trạng thái: 🟢 Hoàn thiện đồ án*