# 🛠️ Hướng dẫn sử dụng Git cơ bản cho Dự án Âm nhạc (TuneVault)

Tài liệu này hướng dẫn cách nhóm làm việc chung trên cùng một dự án sử dụng Git, tránh xung đột code và đảm bảo code luôn sạch sẽ.

---

## 1️⃣ Khởi tạo và Cấu hình Git

**Bước 1: Khởi tạo repository (Chỉ Nhóm trưởng thực hiện 1 lần)**
Nhóm trưởng tạo một repository trên GitHub/GitLab, sau đó đẩy code khung ban đầu lên (cả thư mục Frontend và API).

**Bước 2: Cấu hình thông tin (Tất cả thành viên)**
Trước khi bắt đầu, mỗi người cần cấu hình tên và email để Git ghi nhận ai là người thực hiện thay đổi:
```bash
git config --global user.name "Tên của bạn"
git config --global user.email "email_cua_ban@example.com"
```

**Bước 3: Clone project về máy (Tất cả thành viên trừ Nhóm trưởng)**
```bash
git clone <URL_CUA_REPOSITORY>
cd C_Sharp
```

---

## 2️⃣ Luồng làm việc cơ bản (Add - Commit - Push)

Mỗi khi bạn làm xong một tính năng hoặc một đoạn code chạy ổn định, hãy lưu lại theo 4 bước:

1. **Kiểm tra trạng thái các file bị thay đổi:**
   ```bash
   git status
   ```
2. **Thêm các thay đổi vào khu vực chờ (Staging Area):**
   ```bash
   git add <tên_file>     # Add 1 file cụ thể
   git add .              # Add tất cả các file có thay đổi
   ```
3. **Lưu lịch sử thay đổi (Commit):** (Ghi chú rõ ràng những gì bạn đã làm)
   ```bash
   git commit -m "Thêm chức năng phát nhạc bên Frontend"
   ```
4. **Đẩy code lên server (Push):**
   ```bash
   git push origin <tên_nhánh_của_bạn>
   ```

---

## 3️⃣ Chia nhánh (Branching) & Đặt tên nhánh

Để mọi người không sửa đè lên code của nhau, **MỖI NGƯỜI PHẢI LÀM VIỆC TRÊN MỘT NHÁNH RIÊNG**. Không ai được push trực tiếp vào nhánh `main` (hoặc `master`).

**Quy ước đặt tên nhánh (Ví dụ cho nhóm 4 người):**
- Thành viên 1: `feature-ui` (Làm giao diện React và gộp code)
- Thành viên 2: `feature-auth` (Làm tính năng Đăng nhập/Đăng ký)
- Thành viên 3: `feature-player` (Làm trình phát nhạc Audio Player)
- Thành viên 4: `feature-database` (Làm API Backend và CSDL)

**Cách tạo và chuyển nhánh:**
```bash
# Tạo nhánh mới và chuyển sang nhánh đó ngay lập tức
git checkout -b <tên_nhánh_của_bạn>

# Ví dụ cho Thành viên 2:
git checkout -b tv2-feature-auth
```

**Cách cập nhật code mới nhất từ nhánh main:**
Trước khi làm việc mỗi ngày, hãy cập nhật nhánh của bạn để lấy code mới nhất do Nhóm trưởng đã gộp:
```bash
git checkout main
git pull origin main
git checkout <tên_nhánh_của_bạn>
git merge main
```

---

## 4️⃣ Cứu hộ và Xử lý Xung đột (Conflicts)

Trong quá trình làm việc chung, chắc chắn sẽ có lúc 2 người cùng sửa chung 1 file dẫn đến Conflict (Xung đột).

### Tình huống 1: Đang code dở nhưng cần đổi nhánh (Lưu nháp)
Nếu bạn chưa làm xong tính năng nhưng cần chuyển nhánh khác (hoặc pull code), hãy cất tạm code vào kho:
```bash
git stash              # Cất tạm code đi
# ...làm việc khác...
git stash pop          # Lấy lại code đang làm dở
```

### Tình huống 2: Code lỡ sai, muốn quay về ban đầu
- Hủy bỏ các thay đổi ở 1 file chưa commit:
  ```bash
  git checkout -- <tên_file>
  ```
- Xóa bỏ các commit gần nhất (Cẩn thận!):
  ```bash
  git reset --hard HEAD~1   # Quay lại 1 commit trước đó, bỏ luôn code sai
  ```

### Tình huống 3: Bị Xung đột (Conflict) khi Merge hoặc Pull
Khi gộp nhánh (hoặc Pull) mà báo chữ `CONFLICT`, bạn đừng hoảng hốt:

1. Mở code editor (VS Code/Visual Studio) lên. Git sẽ đánh dấu đoạn code bị xung đột bằng các ký tự `<<<<<<<`, `=======`, `>>>>>>>`.
2. Bạn (và người kia) cùng xem lại đoạn code đó, giữ lại phần đúng, xóa bỏ các phần thừa và các dấu `<<<<<<<`, `=======`.
3. Sau khi file đã sửa xong, lưu file lại.
4. Chạy lại lệnh Add và Commit để hoàn tất việc sửa lỗi:
   ```bash
   git add .
   git commit -m "Fix conflict ở file RightSidebar.tsx"
   ```

> 💡 **Nguyên tắc vàng:** "Khi gặp conflict không biết xử lý, hãy gọi Nhóm trưởng!"
