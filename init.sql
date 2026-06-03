-- =========================================================
-- 0. XÓA BỎ BẢNG CŨ THEO ĐÚNG THỨ TỰ (ĐỂ TRÁNH KẸT KHÓA NGOẠI)
-- =========================================================
DROP TABLE IF EXISTS songs;
DROP TABLE IF EXISTS artists;


-- =========================================================
-- 1. TẠO MỚI BẢNG NGHỆ SĨ VỚI ĐẦY ĐỦ CÁC CỘT THÔNG SỐ
-- =========================================================
CREATE TABLE artists (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL UNIQUE,
    WorldRank INT DEFAULT 0,
    Followers INT DEFAULT 0,
    MonthlyListeners INT DEFAULT 0,
    Bio TEXT NULL,
    IsVerified BOOLEAN DEFAULT TRUE
);

-- Nạp dữ liệu ca sĩ vào bảng sạch (11 nghệ sĩ đại diện cho 13 bài hát)
INSERT INTO artists (Name, WorldRank, Followers, MonthlyListeners, Bio, IsVerified) VALUES 
('Sơn Tùng M-TP', 36, 3446275, 62093978, 'Sơn Tùng M-TP là ca sĩ, nhạc sĩ tiên phong của dòng nhạc Pop hiện đại tại Việt Nam, sở hữu lượng fan hâm mộ quốc tế đông đảo.', 1),
('Jack-J97', 120, 1546275, 24093978, 'Jack - Trịnh Trần Phương Tuấn là nam ca sĩ sở hữu chất giọng miền Tây đặc trưng cùng hàng loạt bản hit kỷ lục trăm triệu views.', 1),
('Jack-J97,K-ICM,ICM', 88, 2100500, 31500200, 'Bộ ba kết hợp đình đám tạo nên kỷ nguyên nhạc điện tử phối khí nhạc cụ dân tộc độc bản tại thị trường nhạc Việt.', 1),
('DatKaa', 450, 446275, 3421895, 'DatKaa (Nguyễn Tấn Đạt) mang đến làn gió âm nhạc mộc mạc, chất phác nhưng đầy lôi cuốn của người con Nam Bộ.', 1),
('Quang Hùng MasterD', 95, 1285400, 18560000, 'Nam ca sĩ, nhạc sĩ tài năng sở hữu lượng người hâm mộ cực khủng tại Thái Lan và các nước Đông Nam Á.', 1),
('Dương Domic', 154, 856000, 7230000, 'Dương Domic là nhân tố bùng nổ sở hữu tư duy tạo hit thời thượng cùng khả năng trình diễn sân khấu toàn diện.', 1),
('Binz, SOONBIN', 52, 2856000, 42090000, 'Sự kết hợp hoàn hảo giữa ông hoàng thơ rap lãng tử Binz và hoàng tử R&B sở hữu chất giọng đầy kỹ thuật SOOBIN.', 1),
('ANH TRAI SAY HI', 11, 5420000, 85600000, 'Tổ hợp các nghệ sĩ xu hướng tạo nên những sân khấu trình diễn đỉnh cao và dẫn đầu mọi bảng xếp hạng thịnh hành.', 1),
('VƯƠNG BÌNH', 680, 125000, 980000, 'Giọng ca Indie mới nổi đầy triển vọng với những giai điệu lofi trầm buồn, sâu lắng đánh trúng tâm lý giới trẻ.', 1),
('Minh Huy, Pinny', 720, 95000, 560000, 'Cặp đôi nghệ sĩ trẻ tự do với phong cách âm nhạc Acoustic nhẹ nhàng, mang đậm hơi thở thanh xuân.', 1),
('Thiên Đình', 810, 45000, 310000, 'Dự án âm nhạc thể nghiệm mang màu sắc cổ trang kết hợp điện tử huyền ảo độc đáo.', 1);


-- =========================================================
-- 2. TẠO MỚI BẢNG BÀI HÁT VÀ LIÊN KẾT SANG BẢNG NGHỆ SĨ
-- =========================================================
CREATE TABLE songs (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Artist VARCHAR(255) NOT NULL,
    CoverUrl VARCHAR(500) NULL,
    AudioUrl VARCHAR(500) NULL,
    Category VARCHAR(100) NULL,
    ArtistBanner VARCHAR(500) NULL,
    ArtistId INT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, -- 🟢 Đã chuẩn hóa chữ CURRENT_TIMESTAMP viết hoa chuẩn cú pháp
    FOREIGN KEY (ArtistId) REFERENCES artists(Id) ON DELETE SET NULL
);

-- Chèn chuẩn xác 13 bài hát trỏ đúng mã ID (ArtistId) sang bảng ca sĩ vừa tạo phía trên
INSERT INTO songs (Title, Artist, CoverUrl, AudioUrl, Category, ArtistBanner, ArtistId, CreatedAt) 
VALUES 
('Thanh Tân', 'VƯƠNG BÌNH', 'http://localhost:5000/images/thanhtan.jpg', 'http://localhost:5000/audio/thanhtan.mp3', 'friday', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=240&fit=crop', 9, NOW()),
('Về bên anh', 'Jack-J97', 'http://localhost:5000/images/vebenanh.jpg', 'http://localhost:5000/audio/vebenanh.mp3', 'vsound', 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=240&fit=crop', 2, NOW()),
('Sóng gió', 'Jack-J97,K-ICM,ICM', 'http://localhost:5000/images/songgio.jpg', 'http://localhost:5000/audio/songgio.mp3', 'vsound', 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=240&fit=crop', 3, NOW()),
('Nơi này có anh', 'Sơn Tùng M-TP', 'http://localhost:5000/images/noinaycoanh.jpg', 'http://localhost:5000/audio/noinaycoanh.mp3', 'vsound', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 1, NOW()),
('Ngày rời chuyến bay', 'Minh Huy, Pinny', 'http://localhost:5000/images/ngayroichuyenbay.jpg', 'http://localhost:5000/audio/ngayroichuyenbay.mp3', 'friday', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=240&fit=crop', 10, NOW()),
('Mất kết nối', 'Dương Domic', 'http://localhost:5000/images/matketnoi.jpg', 'http://localhost:5000/audio/matketnoi.mp3', 'vsound', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&h=240&fit=crop', 6, NOW()),
('Hồng nhan', 'Jack-J97, K-ICM, ICM', 'http://localhost:5000/images/hongnhan.jpg', 'http://localhost:5000/audio/hongnhan.mp3', 'vsound', 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=240&fit=crop', 3, NOW()),
('Em thua cô ta', 'Thiên Đình', 'http://localhost:5000/images/emthuacota.jpg', 'http://localhost:5000/audio/emthuacota.mp3', 'friday', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=240&fit=crop', 11, NOW()),
('Em', 'Binz, SOONBIN', 'http://localhost:5000/images/em.jpg', 'http://localhost:5000/audio/em.mp3', 'vsound', 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=500&h=240&fit=crop', 7, NOW()),
('Đớn đau vô cùng', 'DatKaa', 'http://localhost:5000/images/dondauvocung.jpg', 'http://localhost:5000/audio/dondauvocung.mp3', 'friday', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=240&fit=crop', 4, NOW()),
('Chờ anh về', 'ANH TRAI SAY HI', 'http://localhost:5000/images/choanhve.jpg', 'http://localhost:5000/audio/choanhve.mp3', 'rap', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&h=240&fit=crop', 8, NOW()),
('Chất gây hại', 'Quang Hùng MasterD', 'http://localhost:5000/images/chatgayhai.jpg', 'http://localhost:5000/audio/chatgayhai.mp3', 'vsound', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 5, NOW()),
('Bạc phận', 'Jack-J97, K-ICM, ICM', 'http://localhost:5000/images/bacphan.jpg', 'http://localhost:5000/audio/bacphan.mp3', 'vsound', 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=240&fit=crop', 3, NOW());


-- =========================================================
-- 3. ĐỒNG BỘ VÀ LƯU TRỮ XUỐNG DỮ LIỆU GỐC
-- =========================================================
COMMIT;