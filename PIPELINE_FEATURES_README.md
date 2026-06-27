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

👉 **Xem Sơ đồ luồng Pipeline:** [diagram/Auth.pdf](./diagram/Auth.pdf)

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

👉 **Xem Sơ đồ luồng Pipeline:** [diagram/Share.pdf](./diagram/Share.pdf)

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

👉 **Xem Sơ đồ luồng Pipeline:** [diagram/Notification.pdf](./diagram/Notification.pdf)

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