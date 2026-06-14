# 🛠️ Hướng dẫn Cài đặt & Triển khai Dự án (TuneVault)

Tài liệu này hướng dẫn cách thiết lập môi trường và chạy ứng dụng âm nhạc TuneVault (Frontend React & Backend .NET).

## 🏗️ Cấu trúc & Kiến trúc Hệ thống (Clean Architecture)

Dự án Backend được thiết kế chặt chẽ theo mô hình **Clean Architecture**, đảm bảo tính mở rộng và dễ bảo trì. Quy tắc phụ thuộc cốt lõi: 
> **React SPA (Presentation) ➡️ Web API Controllers ➡️ Application Use Cases ➡️ Domain & Infrastructure**

## 📁 Cấu trúc dự án hiện tại

- `API/` : Lớp tiếp nhận request và trả về response (Controllers, Middleware, DI, Swagger).
- `Application/` : Chứa toàn bộ logic nghiệp vụ, Use Cases và DTOs.
- `Domain/` : Lõi trung tâm chứa các Entities, Interfaces, Enums.
- `Infrastructure/` : Phụ trách kết nối Database (Dapper/EF), SignalR và File Storage.
- `Frontend/` : Chứa mã nguồn giao diện người dùng viết bằng React (Vite) và TypeScript.
- `init.sql` : File kịch bản khởi tạo bảng và seed dữ liệu mẫu cho SQL Server.
- `SETUP_GUIDE.md` : Hướng dẫn cài đặt môi trường và chạy ứng dụng.
- `Git_workFlow.md` : Hướng dẫn luồng làm việc nhóm với Git.

### Quy tắc phụ thuộc cốt lõi:
1. **Domain:** Là lõi trung tâm, hoàn toàn không phụ thuộc vào bất kỳ layer nào khác.
2. **Application:** Chỉ phụ thuộc vào Domain, chứa toàn bộ logic nghiệp vụ (Use Cases, DTOs).
3. **Infrastructure:** Phụ trách kết nối Database (Dapper/EF), File Storage. Nó **implement** các Interface được định nghĩa từ Application/Domain.
4. **API:** Lớp ngoài cùng, tiếp nhận request và trả về response. Chỉ gọi Application, **tuyệt đối không gọi trực tiếp DbContext hay Repository trong Controller**.

---

## ⚙️ Bước 1: Yêu cầu hệ thống
---

- **Hệ điều hành:** Windows 10/11, macOS, hoặc Linux.
- **Node.js:** Phiên bản 18.x hoặc 20.x (Khuyến nghị dùng bản LTS).
- **.NET SDK:** Phiên bản 8.0 để chạy Backend C#. *Lưu ý: Không dùng bản cũ hơn để tránh lỗi tương thích.*
- **Git:** Dùng để tải mã nguồn.

## ⚙️ Bước 2: Tải mã nguồn và Chạy Backend (Bao gồm Database)
---

Dự án này sử dụng **Docker Compose** để đóng gói và tự động chạy cả Database (SQL Server), tự động nạp dữ liệu mẫu (db-init) và Backend API cùng lúc. Mở Terminal và làm theo các bước:

```bash
# 1. Clone dự án về máy
git clone <đường-dẫn-repo-của-bạn>
cd C_Sharp

# 2. Xóa các container cũ (nếu có) để tránh xung đột
docker compose down

# 3. Build và khởi chạy toàn bộ Backend + Database ở chế độ ngầm (detached)
docker compose up --build -d
```
*(Lưu ý: Bạn phải bật phần mềm Docker Desktop trước khi chạy các lệnh trên. Khi chạy thành công, API sẽ hoạt động ngầm. Bạn có thể kiểm tra Swagger tại URL cấu hình trong file `launchSettings.json`).*

## ⚙️ Bước 3: Cấu hình API Keys (Quan trọng)
---

Để tính năng Upload Nhạc và Video hoạt động, bạn cần cấu hình Cloudinary:
1. Mở file `API/appsettings.json` trong thư mục `C_Sharp`.
2. Tìm đến mục `"Cloudinary"` ở cuối file và điền thông tin tài khoản Cloudinary của bạn:
   ```json
   "Cloudinary": {
       "CloudName": "TÊN_CỦA_BẠN",
       "ApiKey": "API_KEY_CỦA_BẠN",
       "ApiSecret": "API_SECRET_CỦA_BẠN"
   }
   ```
*(Nếu bạn không dùng chức năng upload video, có thể bỏ qua bước này).*

*Lưu ý về Cơ sở dữ liệu:* Database SQL Server đã được Docker tự động khởi tạo và nạp dữ liệu mẫu từ file `init.sql`. Bạn **không cần** dùng DBeaver chạy script thủ công nữa.

## ⚙️ Bước 4: Cài đặt và Chạy Frontend (React)
---

Để giao diện web giao tiếp được với Backend, bạn cần mở thêm một Terminal khác để chạy Frontend song song:

```bash
# Di chuyển vào thư mục Frontend
cd D:\Work_Project\C_Sharp\Frontend

# Cài đặt các thư viện từ package.json
npm install

# Khởi động máy chủ giao diện
npm run dev
```
Trình duyệt sẽ tự động mở hoặc bạn có thể truy cập thủ công tại địa chỉ `http://localhost:5173`.

## 💡 Kế hoạch Cải tiến & Xử lý lỗi phổ biến
---

Để quá trình code và chạy dự án trơn tru, dự án khuyến nghị bạn sử dụng các giải pháp sau:

**1. Sử dụng VS Code Extensions**
- **Vấn đề:** Trình duyệt báo lỗi "cẩu thả" hoặc code format lộn xộn.
- **Giải pháp:** Cài đặt ngay các extension: `C# Dev Kit` (để code backend), `ESLint` (tìm lỗi React) và `Prettier` (tự động làm đẹp code khi lưu file).

**2. Lỗi mất kết nối Database hoặc trùng Port**
- **Vấn đề:** Backend báo lỗi không thể kết nối tới DB, hoặc lệnh Docker Compose bị lỗi port.
- **Giải pháp:** 
  - Đảm bảo Docker Desktop đang bật và hoạt động.
  - Nếu báo trùng port `1433`, hãy **tắt các dịch vụ SQL Server đang chạy ngầm trên Windows** (vào `services.msc` tìm `SQL Server` và nhấn Stop).
  - Nhớ rằng tài khoản DB của đồ án là `sa` và mật khẩu là `Aa123456` (port `1433`).

**3. Lỗi thiếu thư viện Frontend**
- Nếu chạy `npm run dev` bị báo lỗi thiếu module, hãy nhớ chạy lại lệnh `npm install` để cập nhật thư viện mới nhất từ nhánh `main`.