# 🚀 Hướng Dẫn Deploy Hệ Thống TuneVault
[![Backend](https://img.shields.io/badge/Backend-Somee-blue.svg)](https://somee.com/)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black.svg)]    (https://vercel.com/)
[![Status](https://img.shields.io/badge/Status-Hoạt%20động-success.svg)]()

Tài liệu này hướng dẫn chi tiết quy trình triển khai (deploy) toàn bộ hệ thống **TuneVault** lên môi trường trực tuyến (Production), bao gồm cả Backend (Somee) và Frontend (Vercel) từ nhánh làm việc cá nhân.

---

## 📋 Mục lục
- [1. Tổng Quan Kiến Trúc Sau Khi Triển Khai](#1--tổng-quan-kiến-trúc-sau-khi-triển-khai)
- [2. Trạng Thái Backend & Cơ Sở Dữ Liệu (Somee)](#2-️-trạng-thái-backend--cơ-sở-dữ-liệu-somee)
- [3. Cấu Hình Mã Nguồn Frontend (React + Vite)](#3-️-cấu-hình-mã-nguồn-frontend-react--vite)
- [4. Tạo Tệp Định Tuyến (vercel.json)](#4-️-tạo-tệp-định-tuyến-verceljson)
- [5. Quy Trình Đẩy Code & Deploy Lên Vercel](#5--quy-trình-đẩy-code-lên-nhánh-riêng--deploy-vercel)
- [6. Xử Lý Sự Cố Khẩn Cấp](#6-️-các-lỗi-thường-gặp--cách-khắc-phục-khẩn-cấp)

---

## 1. 🌍 Tổng Quan Kiến Trúc Sau Khi Triển Khai

Hệ thống được cấu hình theo mô hình Cloud tách biệt (Decoupled Architecture) giúp tối ưu bộ nhớ cho gói miễn phí và đảm bảo tốc độ truy cập:

| Thành phần | Nền tảng Cloud | URL trực tuyến công khai | Cơ chế hoạt động |
| :--- | :--- | :--- | :--- |
| **Backend & Database** | **Somee Cloud** | `http://tunevault-backend.somee.com` | ASP.NET Core Web API 8.0 + SQL Server 2022 |
| **Frontend** | **Vercel Edge** | `https://*.vercel.app` (Cấp tự động) | React + Vite + TypeScript Static App |

---

## 2. 🗄️ Triển Khai Backend Lên Somee Cloud

Hiện tại, cơ sở dữ liệu đã được khởi tạo qua tệp `init.sql` và kết nối thành công với mã nguồn C#. Dưới đây là các bước đóng gói mã nguồn và đưa lên Somee:

### 2.1. Đóng gói mã nguồn (Publish & Zip)

Để Somee có thể chạy được ứng dụng .NET, bạn cần biên dịch (publish) mã nguồn ra các tệp thực thi:

**Bước 1:** Mở Terminal tại thư mục chứa project `API` (Backend), chạy lệnh Publish sau:
```bash
dotnet publish -c Release -o ./publish
```
> **💡 Mẹo:** Nếu bạn dùng Visual Studio, nhấp chuột phải vào Project `API` -> Chọn **Publish** -> Chọn **Folder** làm Target và nhấn Publish.

**Bước 2:** Mở thư mục `publish` vừa được tạo ra. Chọn **tất cả** các file và thư mục bên trong đó, sau đó **nén lại thành một file `.zip`** (Ví dụ: `backend-publish.zip`).
> **⚠️ Lưu ý quan trọng:** Bạn phải nén các file *bên trong* thư mục `publish`, chứ không phải nén nguyên cả cái thư mục `publish`.

### 2.2. Upload lên File Manager của Somee

**Bước 3:** Đăng nhập vào trang quản trị của [Somee](https://somee.com/), mở Control Panel Website của bạn.

**Bước 4:** Ở menu bên trái, tìm và chọn công cụ **File Manager**.

**Bước 5:** Bấm nút **Upload**, chọn file `backend-publish.zip` vừa nén và tải lên. (Đảm bảo bạn đang ở thư mục gốc của website trên Somee).

**Bước 6:** Sau khi upload xong, tìm file zip vừa tải lên, bấm vào biểu tượng **Unzip** (giải nén) để bung toàn bộ file mã nguồn ra thư mục hiện tại. (Bạn có thể xóa file zip sau khi giải nén xong để tiết kiệm dung lượng).

- **Trang quản trị API (Swagger UI):** Khi tải lên hoàn tất, bạn có thể truy cập trực tiếp vào `http://tunevault-backend.somee.com/swagger/index.html` để kiểm tra các Endpoint xem đã hoạt động chưa.
- **Lưu ý về Docker:** Tệp `docker-compose.yml` gốc của nhóm sẽ giữ nguyên vai trò làm môi trường chạy thử nghiệm nội bộ dưới máy Local (Development) và **không cần chỉnh sửa** khi đưa lên mây.

---

## 3. 🛠️ Cấu Hình Mã Nguồn Frontend (React + Vite)

Để Frontend hoạt động trơn tru sau khi đóng gói, cần lưu ý cấu trúc đường dẫn API trong thư mục `Frontend`:

### 3.1. Các tệp GIỮ NGUYÊN (Không sửa đổi)
Nhờ có cơ chế điều hướng ngược (Reverse Proxy) của Vercel, các tệp gọi HTTP thông thường như `fetch` hoặc cấu hình `Axios Instance` **bắt buộc giữ nguyên** đường dẫn tương đối `/api` để tránh lỗi CORS dưới máy local:

- *Tệp chứa fetch tĩnh:* 
  ```javascript
  const API_URL = "/api/categories";
  ```
- *Tệp cấu hình Axios instance:* 
  ```javascript
  const API = axios.create({
    baseURL: '/api',
    timeout: 0, // Vô hiệu hóa timeout cho tính năng upload file
  });
  ```

### 3.2. Tệp cấu hình Realtime SignalR (BẮT BUỘC SỬA)
Do cơ chế định tuyến đám mây không tự động hỗ trợ chuyển tiếp giao thức WebSockets của SignalR, biến `hubUrl` phải được chỉ định bằng đường dẫn tuyệt đối trực tiếp của Somee:

```typescript
// ❌ XÓA DÒNG CŨ: const hubUrl = '/hubs/notification';
// ✅ THAY BẰNG LINK TUYỆT ĐỐI SOMEE:
const hubUrl = 'http://tunevault-backend.somee.com/hubs/notification';

connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets // Ép sử dụng WebSockets
    })
    .withAutomaticReconnect()
    .build();
```

---

## 4. 🎛️ Tạo Tệp Định Tuyến (vercel.json)

Để thay thế cho tính năng proxy của Vite Server (vốn chỉ chạy ở máy local), bạn cần tạo một tệp tin cấu hình môi trường chạy riêng cho Vercel.

**Hướng dẫn:** Tạo một tệp mới tên là `vercel.json` nằm trực tiếp tại thư mục gốc của `Frontend` (nằm cùng cấp với file `vite.config.ts`, `package.json`), với nội dung như sau:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://tunevault-backend.somee.com/api/:path*"
    },
    {
      "source": "/hubs/:path*",
      "destination": "http://tunevault-backend.somee.com/hubs/:path*"
    }
  ]
}
```

---

## 5. 🚀 Quy Trình Đẩy Code Lên Nhánh Riêng & Deploy Vercel

Thực hiện triển khai mã nguồn an toàn từ nhánh làm việc cá nhân theo các bước dưới đây:

**Bước 1:** Mở Terminal tại thư mục `Frontend`, chạy cụm lệnh Git để lưu trữ và đẩy thay đổi lên nhánh cá nhân:

```bash
git add .
git commit -m "Feat: Cấu hình vercel.json và cập nhật hubUrl cho SignalR trực tuyến"
git push origin <ten_nhanh_cua_ban>
```

**Bước 2:** Truy cập vào trang chủ [Vercel.com](https://vercel.com) và tiến hành liên kết Import dự án từ GitHub.

**Bước 3:** Tại giao diện cấu hình (Configure Project), mở rộng mục **Production Branch**, bấm chọn chính xác **Tên nhánh cá nhân** bạn vừa push code lên (thay vì chọn `main` hoặc `master`).

**Bước 4:** Bấm **Deploy** và chờ khoảng 1 phút để hệ thống trả trạng thái *Ready* màu xanh lá kèm đường dẫn trực tuyến.

---

## 6. ⚠️ Các Lỗi Thường Gặp & Cách Khắc Phục Khẩn Cấp

### 🔴 Lỗi 1: Bị chặn màn hình đen "You Need Access"
- **Nguyên nhân:** Tính năng bảo mật nội bộ Vercel Authentication của nhóm đang bật, chặn không cho người ngoài xem link preview của nhánh phụ.
- **Cách sửa:** Nhắn bạn chủ phòng tạo Project lên Vercel truy cập vào mục: `Settings` -> `Deployment Protection` -> tại dòng `Vercel Authentication` chuyển trạng thái từ **Required** sang **Disabled** và nhấn **Save**. Hoặc đơn giản là sử dụng Link Production ngắn gọn ở ngoài Dashboard để chia sẻ công khai cho mọi người.

### 🔴 Lỗi 2: Trình duyệt chặn không load được bài hát (Lỗi Mixed Content)
- **Nguyên nhân:** Giao diện Vercel chạy giao thức bảo mật `https://`, nhưng API Somee bản miễn phí chỉ chạy giao thức `http://`. Trình duyệt sẽ chặn không cho Frontend lấy data để bảo vệ người dùng.
- **Cách sửa:** Chèn trực tiếp dòng thẻ `<meta>` này vào giữa cặp thẻ `<head> ... </head>` trong tệp `index.html` của thư mục `Frontend`:

```html
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
```
> **💡 Mẹo:** Dòng này ra lệnh cho trình duyệt tự động nâng cấp mọi request từ `http` lên `https` một cách hợp lệ, giúp vượt qua lớp tường lửa bảo mật của trình duyệt.