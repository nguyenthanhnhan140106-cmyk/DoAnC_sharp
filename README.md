🎵 TuneVault - Online Music & Management Streaming Platform

TuneVault là một ứng dụng web nghe nhạc trực tuyến và hệ thống quản lý thư viện âm thanh cao cấp. Dự án được xây dựng dựa trên sự kết hợp giữa Clean Architecture (.NET 8) ở phía Backend và giao diện React TypeScript (Vite) ở phía Frontend, mang lại trải nghiệm mượt mà, sắc nét như Spotify và SoundCloud.

📂 Cấu Trúc Hệ Thống (Project Structure)
Dự án áp dụng mô hình phân tách hoàn toàn (Decoupled Architecture) giúp team Frontend và Backend làm việc độc lập:

DoAnC_sharp/
├── TuneVault.sln               # File Solution tổng quản lý toàn bộ Backend
├── Domain/                     # [Tầng Lõi] Chứa các Entity bài hát, người dùng, playlist (C#)
├── Application/                # [Tầng Nghiệp Vụ] Xử lý logic, Queries/Commands, Interfaces (C#)
├── Infrastructure/             # [Tầng Hạ Tầng] Cấu hình Entity Framework, kết nối MySQL (C#)
├── API/                        # [Tầng Giao Tiếp] Các Controller mở cổng Endpoint cung cấp JSON (C#)
│   └── appsettings.json        # Tệp cấu hình chuỗi kết nối Database
└── Frontend/                   # [Tầng Giao Diện] Dự án mã nguồn mở React (TypeScript + Vite)
    ├── src/
    │   ├── assets/             # Chứa tài nguyên tĩnh (Logo, file search.svg...)
    │   ├── Components/         # Các linh kiện giao diện (Header, Sidebar, RightSidebar, PlayerBar)
    │   │   └── Styles/         # File cấu hình CSS giao diện hệ thống (HomePage.css)
    │   ├── Pages/              # Các trang chính của ứng dụng (HomePage.tsx)
    │   └── Services/           # Trục kết nối gọi API sang Backend (api.ts)
    └── package.json            # Quản lý các thư viện Frontend

📋 Tính Năng Nổi Bật Đang Phát Triển
Giao diện 3 cột chuẩn Spotify: * Cột trái: Quản lý Thư viện, danh sách Playlist của tôi, bộ lọc nhanh (Playlists, Nghệ sĩ).

Cột giữa: Khu vực hiển thị dòng chảy bài hát, album xu hướng, các card bài hát nẩy mượt mà.

Cột phải: Khối "Đang phát" (Right Sidebar) hiển thị ảnh bìa lớn, thông tin chi tiết và số lượng người nghe của nghệ sĩ theo thời gian thực.

Hệ thống điều khiển nhạc thông minh (PlayerBar): Cung cấp đầy đủ các nút chức năng vật lý: Trộn bài, bài trước, Play/Pause, bài tiếp, lặp lại và thanh điều chỉnh âm lượng chuẩn chỉnh.

Tính năng Click Outside: Menu Avatar tự động thu lại thông minh khi người dùng nhấp chuột ra bất kỳ vị trí nào bên ngoài.

Code First Database: Hệ thống tự động quét các thực thể C# để tự sinh bảng và tạo cấu trúc dữ liệu hoàn chỉnh dưới MySQL mà không cần can thiệp thủ công.

🛠️ Công Nghệ Sử Dụng (Tech Stack)
Thành Phần	                Công Nghệ	
🌐 Frontend Framework	   React JS (TypeScript)	
⚡ Frontend Bundler	      Vite	
🎨 Styling	               CSS Grid & Flexbox, SVG	
⚙️ Backend Framework	   .NET 8.0 Web API	 
🏛️ Kiến Trúc Backend	    Clean Architecture	 
🗄️ Database	            MySQL (XAMPP)	
🔗 ORM	                   Entity Framework Core (Pomelo)

🚀 Hướng Dẫn Kích Hoạt Dự Án Cho Thành Viên
1️⃣ Khởi động Database (MySQL)
Mở XAMPP Control Panel và nhấn Start dịch vụ Apache và MySQL.
Đảm bảo chuỗi kết nối trong API/appsettings.json trỏ đúng về localhost của bạn.

2️⃣ Khởi động Động cơ Backend (C#)
Mở một cửa sổ Terminal trên VS Code và gõ:
cd API
dotnet run
Backend sẽ kích hoạt và lắng nghe các yêu cầu tại cổng cổng mạng mặc định (Ví dụ: http://localhost:5000).

3️⃣ Khởi động Mặt tiền Frontend (React)
Mở một Tab Terminal hoàn toàn mới (không dùng chung với tab Backend) và gõ:
cd Frontend
npm run dev

ở frontend nó hiện ra cái bảng để mình lựa chọn chức năng chạy trên web
h + Enter để hiện ra
sau đó o + Enter là mở ra cái web ta đang làm