# 🚀 HƯỚNG DẪN DEPLOY HỆ THỐNG TUNEVAULT

Tài liệu này hướng dẫn chi tiết quy trình triển khai (deploy) toàn bộ hệ thống **TuneVault** lên môi trường trực tuyến (Production), bao gồm cả Backend (Somee) và Frontend (Vercel) từ nhánh làm việc cá nhân.

---

## 1. 🌍 Tổng Quan Kiến Trúc Sau Khi Triển Khai

Hệ thống được cấu hình theo mô hình Cloud tách biệt (Decoupled Architecture) giúp tối ưu bộ nhớ cho gói miễn phí và đảm bảo tốc độ truy cập:

| Thành phần | Nền tảng Cloud | URL trực tuyến công khai | Cơ chế hoạt động |
| :--- | :--- | :--- | :--- |
| **Backend & Database** | **Somee Cloud** | `http://tunevault-backend.somee.com` | ASP.NET Core Web API 8.0 + SQL Server 2022 |
| **Frontend** | **Vercel Edge** | `https://*.vercel.app` (Cấp tự động) | React + Vite + TypeScript Static App |

---

## 2. 🗄️ Trạng Thái Backend & Cơ Sở Dữ Liệu (Somee)

Hiện tại, cơ sở dữ liệu đã được khởi tạo qua tệp `init.sql` và kết nối thành công với mã nguồn C#. 

* **Trang quản trị API (Swagger UI):** Bạn có thể truy cập trực tiếp vào `http://tunevault-backend.somee.com/swagger/index.html` để kiểm tra các Endpoint.
* **Lưu ý về Docker:** Tệp `docker-compose.yml` gốc của nhóm (quản lý container `tunevault-db`, `backend`, `frontend`) hiện tại sẽ giữ nguyên vai trò làm môi trường chạy thử nghiệm nội bộ dưới máy Local (Development) và không cần chỉnh sửa khi đưa lên mây.

---

## 3. 🛠️ Cấu Hình Mã Nguồn Frontend (React + Vite)

Để Frontend hoạt động trơn tru sau khi đóng gói, cần lưu ý cấu trúc đường dẫn API trong thư mục `Frontend`:

### 3.1. Các tệp GIỮ NGUYÊN (Không sửa đổi)
Nhờ có cơ chế điều hướng ngược (Reverse Proxy) của Vercel, các tệp gọi HTTP thông thường như `fetch` hoặc cấu hình `Axios Instance` **bắt buộc giữ nguyên** đường dẫn tương đối `/api` để tránh lỗi CORS dưới máy local:

* *Tệp chứa fetch tĩnh:* `const API_URL = "/api/categories";`
* *Tệp cấu hình Axios instance:* ```javascript
  const API = axios.create({
    baseURL: '/api',
    timeout: 0, // Vô hiệu hóa timeout cho tính năng upload file
  });

  3.2. Tệp cấu hình Realtime SignalR (BẮT BUỘC SỬA)
Do cơ chế định tuyến đám mây không tự động hỗ trợ chuyển tiếp giao thức WebSockets của SignalR, biến hubUrl phải được chỉ định bằng đường dẫn tuyệt đối trực tiếp của Somee:

TypeScript
// ❌ XÓA DÒNG CŨ: const hubUrl = '/hubs/notification';
//  THAY BẰNG LINK TUYỆT ĐỐI SOMEE:
const hubUrl = '[http://tunevault-backend.somee.com/hubs/notification](http://tunevault-backend.somee.com/hubs/notification)';

connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets // Ép sử dụng WebSockets
    })
    .withAutomaticReconnect()
    .build();

4. 🎛️ Tạo Tệp Định Tuyến
Để thay thế cho tính năng proxy của Vite Server (vốn chỉ chạy ở máy local), bạn cần tạo một tệp tin cấu hình môi trường chạy riêng cho Vercel.

Tạo một tệp mới tên là vercel.json nằm trực tiếp tại thư mục gốc của Frontend (nằm cùng cấp với file vite.config.ts, package.json):

JSON
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "[http://tunevault-backend.somee.com/api/:path](http://tunevault-backend.somee.com/api/:path)*"
    },
    {
      "source": "/hubs/:path*",
      "destination": "[http://tunevault-backend.somee.com/hubs/:path](http://tunevault-backend.somee.com/hubs/:path)*"
    }
  ]
}
5. 🚀 Quy Trình Đẩy Code Lên Nhánh Riêng & Deploy Vercel
Thực hiện triển khai mã nguồn an toàn từ nhánh làm việc cá nhân theo các bước dưới đây:

Mở Terminal tại thư mục Frontend chạy cụm lệnh Git để lưu trữ và đẩy thay đổi lên nhánh cá nhân:

Bash
git add .
git commit -m "Feat: Cấu hình vercel.json và cập nhật hubUrl cho SignalR trực tuyến"
git push origin <ten_nhanh_cua_ban>
Truy cập vào trang chủ Vercel.com và tiến hành liên kết Import dự án từ GitHub.

Tại giao diện cấu hình (Configure Project), mở rộng mục Production Branch, bấm chọn chính xác Tên nhánh cá nhân bạn vừa push code lên (thay vì chọn main hoặc master).

Bấm Deploy và chờ khoảng 1 phút để hệ thống trả trạng thái Ready xanh lè kèm đường dẫn trực tuyến.

⚠️ 6. Các Lỗi Thường Gặp & Cách Khắc Phục Khẩn Cấp
Lỗi 1: Bị chặn màn hình đen "You Need Access"
Nguyên nhân: Tính năng bảo mật nội bộ Vercel Authentication của nhóm đang bật, chặn không cho người ngoài xem link preview của nhánh phụ.

Cách sửa: Nhắn bạn chủ phòng tạo Project lên Vercel truy cập vào mục: Settings -> Deployment Protection -> tại dòng Vercel Authentication chuyển trạng thái từ Required sang Disabled và nhấn Save. Hoặc đơn giản là sử dụng Link Production ngắn gọn ở ngoài Dashboard để chia sẻ công khai cho mọi người.

Lỗi 2: Trình duyệt chặn không load được bài hát (Lỗi Mixed Content)
Nguyên nhân: Giao diện Vercel chạy giao thức bảo mật https://, nhưng API Somee bản miễn phí chỉ chạy giao thức http://. Trình duyệt sẽ chặn không cho Frontend lấy data để bảo vệ người dùng.

Cách sửa: Chèn trực tiếp dòng thẻ <meta> này vào giữa cặp thẻ <head> ... </head> trong tệp index.html của thư mục Frontend:

HTML
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
Dòng này ra lệnh cho trình duyệt tự động nâng cấp mọi request từ http lên https một cách hợp lệ, giúp vượt qua lớp tường lửa bảo mật của trình duyệt.