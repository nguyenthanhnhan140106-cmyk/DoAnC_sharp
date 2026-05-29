🛠️ Hướng Dẫn Thiết Lập Môi Trường Dự Án TuneVault (C# & React)

1️⃣ Cài Đặt Các Công Cụ Nền (Prerequisites)
Trước khi gõ lệnh, mọi thành viên bắt buộc phải cài đặt đầy đủ các phần mềm sau lên máy tính:
Công cụ .Net SDK phiên bản 8.0 
https://dotnet.microsoft.com/en-us/download/dotnet/8.0

Node.js 20.x
https://nodejs.org/en

XAMPP Phiên bản mới nhất
https://www.apachefriends.org/

✅ Kiểm tra môi trường máy tính
Mở Terminal/Command Prompt lên và gõ các lệnh sau để đảm bảo máy đã nhận diện phần mềm:

dotnet --version  # Phải hiện 8.0.xxx
node -v          # Phải hiện v20.x.x hoặc v22.x.x

🔌 Các Extension cần cài trên VS Code
Nhấp vào biểu tượng Ô vuông (Extensions) hoặc nhấn Ctrl + Shift + X, tìm và cài đặt các gói sau:

C# Dev Kit (Chính chủ Microsoft - Bắt buộc để viết C# mượt mà).

C# (Hỗ trợ gợi ý code, định dạng mã nguồn).

2️⃣ Khởi Tạo Cấu Trúc Backend (Clean Architecture)
Mở thư mục DoAnC_sharp bằng VS Code. Bật Terminal của VS Code lên (Ctrl + ~) và chạy tuần tự các khối lệnh sau:

📁 Bước 2.1: Tạo Solution tổng quản lý dự án
# Tạo file Solution tổng đặt tên là TuneVault để quản lý tập trung các project con
dotnet new sln -n TuneVault

📁 Bước 2.2: Tạo 4 tầng kiến trúc (Class Libraries & WebAPI)
# Tạo 3 tầng chứa logic nghiệp vụ và kết nối dữ liệu (Dạng thư viện liên kết)
dotnet new classlib -n Domain
dotnet new classlib -n Application
dotnet new classlib -n Infrastructure

# Tạo tầng chạy chính làm nhiệm vụ mở cổng API giao tiếp với Web
dotnet new webapi -n API

📁 Bước 2.3: Đính kèm các tầng con vào Solution tổng
dotnet sln add Domain/Domain.csproj
dotnet sln add Application/Application.csproj
dotnet sln add Infrastructure/Infrastructure.csproj
dotnet sln add API/API.csproj

🔗 Bước 2.4: Thiết lập mối quan hệ phụ thuộc (References)
Theo nguyên lý Clean Architecture, các tầng bên ngoài phải phụ thuộc vào lõi bên trong. Chạy chuỗi lệnh sau để liên kết:

# Tầng Application chỉ được phép biết và gọi tầng Domain
cd Application
dotnet add reference ../Domain/Domain.csproj

# Tầng Infrastructure phụ thuộc vào kế hoạch của Application và thực thể Domain
cd ../Infrastructure
dotnet add reference ../Application/Application.csproj
dotnet add reference ../Domain/Domain.csproj

# Tầng API (Presentation) gọi đến Infrastructure và Application để chạy dịch vụ
cd ../API
dotnet add reference ../Infrastructure/Infrastructure.csproj
dotnet add reference ../Application/Application.csproj

# Quay trở về thư mục gốc DoAnC_sharp để tiếp tục cấu hình
cd ..

3️⃣ Cấu Hình Cơ Sở Dữ Liệu (MySQL)
Dự án này nhóm mình sử dụng hệ quản trị CSDL MySQL (thông qua XAMPP) thay vì SQL Server mặc định của .NET. Do đó, tụi mình cần cài đặt các thư viện kết nối trung gian 

📦 Bước 3.1: Cài đặt thư viện kết nối Database vào các tầng liên quan

# Nạp thư viện kết nối MySQL cho tầng CSDL (Infrastructure)
cd Infrastructure
dotnet add package Pomelo.EntityFrameworkCore.MySql --version 8.0.2
cd ..

# Nạp thư viện hỗ trợ thiết kế, sinh mã bảng tự động cho tầng chạy chính (API)
cd API
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.11
dotnet add package Pomelo.EntityFrameworkCore.MySql --version 8.0.2
dotnet add package Microsoft.AspNetCore.Mvc.Core
cd ..

⚙️ Bước 3.2: Cấu hình chuỗi kết nối (Connection String)
Bật bảng điều khiển XAMPP Control Panel, nhấn Start cho cả Apache và MySQL.

Mở file API/appsettings.json trong VS Code, xóa sạch nội dung cũ và dán đè cấu hình kết nối này vào:

{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "server=localhost;port=3306;database=DoAnNhom_Db;user=root;password="
  }
}

Lưu ý: Mục database=DoAnNhom_Db là tên CSDL hệ thống sẽ tự động tạo dưới XAMPP, các bạn giữ nguyên không cần chỉnh sửa để đồng bộ code cả nhóm.

🚀 Bước 3.3: Chạy lệnh tự động tạo Database và sinh bảng sinh lịch sử (Migrations)
Tụi mình áp dụng cơ chế Code First (viết code C# tự sinh ra bảng dưới SQL, không cần lên phpMyAdmin tạo thủ công). Chạy 2 lệnh sau:

cd API

# Lệnh 1: Quét các thực thể C# trong code và lập file lịch sử cấu hình bảng
dotnet ef migrations add KhoiTaoHeThong --project ../Infrastructure/Infrastructure.csproj --startup-project ./API.csproj

# Lệnh 2: Bắn cấu hình này trực tiếp xuống MySQL của XAMPP để dựng Database sạch
dotnet ef database update

cd ..

4️⃣ Khởi Tạo Môi Trường Giao Diện (Frontend React)
Để dự án chạy mượt mà, không bị xung đột, các thành viên bắt buộc phải mở một Tab Terminal hoàn toàn mới trong VS Code chuyên dụng cho Frontend:
# Tạo dự án Frontend sử dụng Vite đóng gói, ngôn ngữ React TypeScript cực nhanh
npm create vite@latest Frontend -- --template react-ts

# Di chuyển vào thư mục Frontend vừa tạo để cài thư viện nền
cd Frontend
npm install

# Khởi động thử giao diện Frontend lên trình duyệt
npm run dev

📝 Quy Tắc Vận Hành & Lưu Ý Quan Trọng Cho Team
1. Quy tắc đặt tên File (Rất quan trọng!)
Với Backend (C#): Mọi file class, entity, controller bắt buộc viết hoa chữ cái đầu theo chuẩn PascalCase (Ví dụ: SongController.cs, ApplicationDbContext.cs).

Với Frontend (React): Các file linh kiện giao diện bắt buộc viết hoa chữ cái đầu (Ví dụ: Header.tsx, Sidebar.tsx, PlayerBar.tsx). Tuyệt đối không viết thường chữ cái đầu của file component (như header.tsx), nếu không hệ thống quản lý file của Git và Vite sẽ bị kẹt bộ nhớ cache và báo lỗi biên dịch khi các thành viên khác tải code về.

2. Cách chạy ứng dụng đồng thời khi làm việc
Mỗi khi mở dự án lên để code, các bạn cần chạy song song cả 2 tầng:

Tab Terminal 1 (Backend): Di chuyển vào thư mục API và gõ lệnh dotnet run để kích hoạt máy chủ C#.

Tab Terminal 2 (Frontend): Di chuyển vào thư mục Frontend và gõ lệnh npm run dev để mở giao diện web.