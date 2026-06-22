-- =========================================================
-- TUNEVAULT - SCRIPT KHỞI TẠO DATABASE VỚI CLOUDINARY LINKS
-- =========================================================

DROP TABLE IF EXISTS media_shares;
DROP TABLE IF EXISTS user_saved_albums;
DROP TABLE IF EXISTS user_otps;
DROP TABLE IF EXISTS playlist_songs;
DROP TABLE IF EXISTS album_songs;
DROP TABLE IF EXISTS media_tags;
DROP TABLE IF EXISTS play_histories;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS user_follows;
DROP TABLE IF EXISTS follows;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS playlists;
DROP TABLE IF EXISTS albums;
DROP TABLE IF EXISTS songs;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS artists;
DROP TABLE IF EXISTS users;

-- ─────────────────────────────────────────────────────────
-- 1. BẢNG NGHỆ SĨ
-- ─────────────────────────────────────────────────────────

CREATE TABLE users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    AvatarUrl NVARCHAR(255) NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed 2 users mẫu (Password: Password123! -- BCrypt hash)
SET IDENTITY_INSERT users ON;
INSERT INTO users (Id, Username, Email, PasswordHash, AvatarUrl, CreatedAt) VALUES
(1, N'admin', N'admin@tunevault.com',
   N'123456',
   N'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', GETDATE()),
(2, N'tunevault_user', N'user@tunevault.com',
   N'123456',
   N'https://api.dicebear.com/7.x/avataaars/svg?seed=user', GETDATE());
SET IDENTITY_INSERT users OFF;


CREATE TABLE artists (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL UNIQUE,
    WorldRank INT DEFAULT 0,
    Followers INT DEFAULT 0,
    MonthlyListeners INT DEFAULT 0,
    Bio NVARCHAR(MAX) NULL,
    IsVerified BIT DEFAULT 1
);


SET IDENTITY_INSERT artists ON;
INSERT INTO artists (Id, Name, WorldRank, Followers, MonthlyListeners, Bio, IsVerified) VALUES 
(1,  N'Sơn Tùng M-TP',      36,  3446275, 62093978, N'Sơn Tùng M-TP là ca sĩ, nhạc sĩ tiên phong của dòng nhạc Pop hiện đại tại Việt Nam, sở hữu lượng fan hâm mộ quốc tế đông đảo.', 1),
(2,  N'Jack',           120, 1546275, 24093978, N'Jack - Trịnh Trần Phương Tuấn là nam ca sĩ sở hữu chất giọng miền Tây đặc trưng cùng hàng loạt bản hit kỷ lục trăm triệu views.', 1),
(3,  N'Jack, K-ICM',  88, 2100500, 31500200, N'Bộ ba kết hợp đình đám tạo nên kỷ nguyên nhạc điện tử phối khí nhạc cụ dân tộc độc bản tại thị trường nhạc Việt.', 1),
(4,  N'DatKaa',             450,  446275,  3421895, N'DatKaa (Nguyễn Tấn Đạt) mang đến làn gió âm nhạc mộc mạc, chất phác nhưng đầy lôi cuốn của người con Nam Bộ.', 1),
(5,  N'Quang Hùng MasterD',  95, 1285400, 18560000, N'Nam ca sĩ, nhạc sĩ tài năng sở hữu lượng người hâm mộ cực khủng tại Thái Lan và các nước Đông Nam Á.', 1),
(6,  N'Dương Domic',        154,  856000,  7230000, N'Dương Domic là nhân tố bùng nổ sở hữu tư duy tạo hit thời thượng cùng khả năng trình diễn sân khấu toàn diện.', 1),
(7,  N'Binz, SOONBIN',       52, 2856000, 42090000, N'Sự kết hợp hoàn hảo giữa ông hoàng thơ rap lãng tử Binz và hoàng tử R&B sở hữu chất giọng đầy kỹ thuật SOOBIN.', 1),
(8,  N'ANH TRAI SAY HI',     11, 5420000, 85600000, N'Tổ hợp các nghệ sĩ xu hướng tạo nên những sân khấu trình diễn đỉnh cao và dẫn đầu mọi bảng xếp hạng thịnh hành.', 1),
(9,  N'VƯƠNG BÌNH',         680,  125000,   980000, N'Giọng ca Indie mới nổi đầy triển vọng với những giai điệu lofi trầm buồn, sâu lắng đánh trúng tâm lý giới trẻ.', 1),
(10, N'Minh Huy, Pinny',    720,   95000,   560000, N'Cặp đôi nghệ sĩ trẻ tự do với phong cách âm nhạc Acoustic nhẹ nhàng, mang đậm hơi thở thanh xuân.', 1),
(11, N'Thiên Đình',         810,   45000,   310000, N'Dự án âm nhạc thể nghiệm mang màu sắc cổ trang kết hợp điện tử huyền ảo độc đáo.', 1),
(12, N'Elly', 320, 580000, 4200000, N'Elly là nghệ sĩ Lofi Chill nổi tiếng với những giai điệu nhẹ nhàng, thư giãn mang đậm phong cách chill độc đáo.', 1),
(13, N'Changg', 250, 450000, 3200000, N'Changg là một giọng ca trẻ đầy tiềm năng với những bản hit nổi bật trên các nền tảng mạng xã hội.', 1),
(14, N'Various Artists', 999, 1000000, 5000000, N'Tập hợp các nghệ sĩ nổi bật với đa dạng thể loại âm nhạc.', 1),
(15, N'Paris', 350, 450000, 2100000, N'Giọng ca trẻ với phong cách R&B lôi cuốn và đầy năng lượng.', 1),
(16, N'Andree Right Hand', 200, 1500000, 6800000, N'Rapper đình đám với những bản hit Hip-hop đầy chất chơi và phóng khoáng.', 1),
(17, N'Vũ Cát Tường', 110, 2800000, 9500000, N'Ca - nhạc sĩ đa tài với chất giọng phi giới tính và phong cách âm nhạc độc bản.', 1),
(18, N'Hiếu Thứ Hai', 95, 3200000, 11000000, N'Nam Rapper điển trai sở hữu hàng loạt bản hit Top 1 Trending mang màu sắc hiện đại.', 1),
(19, N'Hoãng', 670, 80000, 320000, N'Nghệ sĩ Indie với những giai điệu lofi cực chill và mộc mạc.', 0),
(20, N'Hngle', 450, 230000, 1400000, N'Nhân tố mới nổi bật với các sáng tác mang đậm tính tự sự và sâu lắng.', 0),
(21, N'Bray, Amee', 180, 2100000, 8000000, N'Sự kết hợp hoàn hảo giữa giọng rap gai góc và chất giọng ngọt ngào.', 1),
(22, N'Bray', 130, 2500000, 7500000, N'B Ray - Rapper với khả năng chơi chữ đỉnh cao và câu chuyện đường phố.', 1),
(23, N'Parys', 890, 50000, 200000, N'Tài năng trẻ đang từng bước chinh phục khán giả qua những bài hát đầy cảm xúc.', 0),
(24, N'gigi D`Agostino', 45, 8000000, 22000000, N'Huyền thoại DJ và nhà sản xuất âm nhạc người Ý với các siêu phẩm Electronic.', 1),
(25, N'GREYD', 145, 1200000, 4500000, N'Tân binh quái vật của V-Pop với tư duy âm nhạc cực kỳ hiện đại và bắt tai.', 1),
(26, N'LowG', 210, 1100000, 5300000, N'Chủ nhân của dòng rap Flexing cực mượt với phong cách delivery độc nhất.', 1),
(27, N'JustaTee', 105, 3000000, 8200000, N'Ông hoàng R&B Việt Nam, người tiên phong mang giai điệu Melodic Rap đến đại chúng.', 1),
(28, N'Hiếu Thứ Hai, HURRYKNG', 160, 1800000, 6100000, N'Sự kết hợp cực cháy từ tổ đội GERDNANG khuấy đảo mọi sân khấu.', 1),
(29, N'Karik', 85, 4100000, 10500000, N'Lão đại của làng Rap Việt với những bản hit quốc dân gắn liền với thanh xuân.', 1),
(30, N'MCK', 125, 2700000, 9100000, N'Nghệ sĩ gen Z tài năng với phong cách mumble rap và autotune đặc trưng.', 1),
(31, N'Ronboogz', 320, 600000, 2800000, N'Nhà sản xuất âm nhạc kiêm rapper với chất nhạc US-UK mang hơi thở đường phố.', 1);
SET IDENTITY_INSERT artists OFF;



-- ─────────────────────────────────────────────────────────

-- 1.5. BẢNG CATEGORIES
-- ─────────────────────────────────────────────────────────
CREATE TABLE categories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Slug NVARCHAR(255) NOT NULL UNIQUE,
    Description NVARCHAR(MAX) NULL,
    CoverUrl NVARCHAR(500) NULL
);
 


SET IDENTITY_INSERT categories ON;
INSERT INTO categories (Id, Name, Slug, Description, CoverUrl) VALUES
(1, N'It`s New Music Friday!', N'friday', N'Những bản hit mới nhất được cập nhật mỗi thứ 6', N'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=240&fit=crop'),
(2, N'V-Sound', N'vsound', N'Nhạc Việt thịnh hành nhất', N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop'),
(3, N'Thế Giới Rap', N'rap', N'Nơi hội tụ các Rapper cực chất', N'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&h=240&fit=crop'),
(4, N'Pop', N'pop', N'Nhạc Pop nổi bật nhất', N'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=240&fit=crop'),
(5, N'Podcast', N'podcast', N'Podcast & Trò chuyện', N'https://images.unsplash.com/photo-1478737270239-2f02b85af684?w=500&h=240&fit=crop'),
(6, N'Other', N'other', N'Các thể loại khác', N'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=240&fit=crop');
SET IDENTITY_INSERT categories OFF;


-- 2. BẢNG BÀI HÁT (CLOUDINARY LINKS)
-- ─────────────────────────────────────────────────────────
CREATE TABLE songs (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(255) NOT NULL,
    Artist NVARCHAR(255) NOT NULL,
    CoverUrl NVARCHAR(500) NULL,
    AudioUrl NVARCHAR(500) NULL,
    VideoUrl NVARCHAR(500) NULL,
    CategoryId INT NULL,
    ArtistBanner NVARCHAR(500) NULL,
    LyricsUrl NVARCHAR(MAX) NULL,
    ArtistId INT NULL,
    UploaderId INT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ArtistId) REFERENCES artists(Id) ON DELETE SET NULL,
    FOREIGN KEY (CategoryId) REFERENCES categories(Id) ON DELETE SET NULL,
    FOREIGN KEY (UploaderId) REFERENCES users(Id) ON DELETE SET NULL
);


SET IDENTITY_INSERT songs ON;
INSERT INTO songs (Id, Title, Artist, CoverUrl, AudioUrl, VideoUrl, CategoryId, ArtistBanner, ArtistId, LyricsUrl, CreatedAt) VALUES 
(1,  N'Thanh Tân',           N'VƯƠNG BÌNH',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657517/thanhtan_olnawd.jpg',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657507/thanhtan_tnaf1e.mp3',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780727889/thanhtan_hhmggj.mp4',
     1, N'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=240&fit=crop', 9,
     N'/lyrics/thanhtan.lrc',
     GETDATE()),

(2,  N'Về bên anh',          N'Jack',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657517/vebenanh_rrpaon.jpg',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657507/vebenanh_kf3kmi.mp3',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780727870/vebenanh_vipbk1.mp4',
     2, N'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=240&fit=crop', 2, N'/lyrics/vebenanh.lrc',GETDATE()),

(3,  N'Sóng gió',            N'Jack,K-ICM',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657517/songgio_kb1ndq.jpg',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657506/songgio_zreqh8.mp3',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780751992/songgio_dhzhih.mp4',
     2, N'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=240&fit=crop', 3,
     N'/lyrics/songgio.lrc',
     GETDATE()),

(4,  N'Nơi này có anh',      N'Sơn Tùng M-TP',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657517/noinaycoanh_t4adrb.jpg',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657502/noinaycoanh_eo4kxd.mp3',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780727867/nhunaycoanh_ckr2mj.mp4',
     2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 1,N'/lyrics/noinaycoanh.lrc', GETDATE()),

(5,  N'Ngày rời chuyến bay', N'Minh Huy, Pinny',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657517/ngayroichuyenbay_ytirxp.jpg',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657503/ngayroichuyenbay_xovjt2.mp3',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780727865/ngayroichuyenbay_kdzzl4.mp4',
     1, N'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=240&fit=crop', 10,N'/lyrics/ngayroichuyenbay.lrc', GETDATE()),

(6,  N'Mất kết nối',         N'Dương Domic',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657517/matketnoi_xr8gpa.jpg',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657504/matketnoi_otbz56.mp3',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780727856/matketnoi_ueyvel.mp4',
     2, N'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&h=240&fit=crop', 6,N'/lyrics/matketnoi.lrc', GETDATE()),

(7,  N'Hồng nhan',           N'Jack, K-ICM',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657516/hongnhan_isqcez.jpg',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657499/hongnhan_f6rlrh.mp3',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780727853/hongnhan_ncrnah.mp4',
     2, N'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=240&fit=crop', 3,N'/lyrics/hongnhan.lrc', GETDATE()),

(8,  N'Em thua cô ta',       N'Thiên Đình',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657516/emthuacota_uugowq.jpg',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657501/emthuacota_nbuyyp.mp3',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780727873/emthuacota_k7qleq.mp4',
     1, N'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=240&fit=crop', 11,N'/lyrics/emthuacota.lrc', GETDATE()),

(9,  N'Em',                  N'Binz, SOONBIN',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657516/em_d1ahp5.jpg',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657502/em_brfzsn.mp3',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780727868/em_xsew9b.mp4',
     2, N'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=500&h=240&fit=crop', 7,N'/lyrics/em.lrc', GETDATE()),

(10, N'Đớn đau vô cùng',     N'DatKaa',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657516/dondauvocung_qyamxw.jpg',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657507/dondauvocung_htprq8.mp3',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780727863/dondauvocung_zlsm0e.mp4',
     1, N'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=240&fit=crop', 4,N'/lyrics/dondauvocung.lrc', GETDATE()),

(11, N'Chờ anh về',          N'ANH TRAI SAY HI',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657516/choanhve_xa6mtg.jpg',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657506/choanhve_zfitwt.mp3',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780727879/choanhve_sc3mmn.mp4',
     3, N'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&h=240&fit=crop', 8,N'/lyrics/choanhve.lrc', GETDATE()),

(12, N'Chất gây hại',        N'Quang Hùng MasterD',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657516/chatgayhai_vgatml.jpg',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657502/chatgayhai_coic6r.mp3',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780727871/chatgayhai_foijpe.mp4',
     2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 5,N'/lyrics/chatgayhai.lrc', GETDATE()),

(13, N'Bạc phận',            N'Jack, K-ICM',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657516/bacphan_cylj9h.jpg',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657500/bacphan_mstj0s.mp3',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780727849/bacphan_axk2ow.mp4',
     2, N'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=240&fit=crop', 3,N'/lyrics/bacphan.lrc', GETDATE()),

(14, N'Túc Duyên Lofi',                N'Elly',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1781681904/Screenshot_2026-06-17_143410_yuxslt.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660154/T%C3%BAc_Duy%C3%AAn_Lofi_uisjpw.mp3',
     '',
     1, N'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop', 12,N'/lyrics/tucduyen.lrc', GETDATE()),
(15, N'Góc Nhỏ Trong Tim Lofi',       N'Elly',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1781681903/Screenshot_2026-06-17_143347_kdieme.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660154/G%C3%B3c_Nh%E1%BB%8F_Trong_Tim_Lofi_w4njus.mp3',
     '',
     1, N'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop', 12,N'/lyrics/gocnhotrongtim.lrc', GETDATE()),
(16, N'Hoang Mang Lofi',              N'Elly',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1781681905/Screenshot_2026-06-17_143435_iezm0i.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660154/Hoang_Mang_Lofi_z1hp0i.mp3',
     '',
     1, N'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop', 12 ,N'/lyrics/hoangmang.lrc', GETDATE()),
(17, N'Nhường Lại Nỗi Đau Lofi',     N'Elly',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1781681905/Screenshot_2026-06-17_143519_aea9pl.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660153/Nh%C6%B0%E1%BB%9Dng_L%E1%BA%A1i_N%E1%BB%97i_%C4%90au_Lofi_zr6bnn.mp3',
     '',
     1, N'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop', 12,N'/lyrics/nhuonglainoidau.lrc', GETDATE()),
(18, N'Em Thua Người Ta Nhiều Lắm Lofi', N'Elly',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1781681905/Screenshot_2026-06-17_143535_j5w2ti.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660153/Em_Thua_Ng%C6%B0%E1%BB%9Di_Ta_Nhi%E1%BB%81u_L%E1%BA%AFm_Lofi_uhbest.mp3',
     '',
     1, N'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop', 12,N'/lyrics/emthuanguoitanhieulam.lrc', GETDATE()),
(19, N'Bên Nhau Cả Đời Lofi',         N'Elly',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1781681905/Screenshot_2026-06-17_143554_qh7wad.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660153/B%C3%AAn_Nhau_C%E1%BA%A3_%C4%90%E1%BB%9Di_Lofi_povrxf.mp3',
     '',
     1, N'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop', 12,N'/lyrics/bennhaucadoi.lrc', GETDATE()),
(20, N'Ngôi Nhà Hạnh Phúc Lofi',      N'Elly',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1781681906/Screenshot_2026-06-17_143614_vyp80v.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660152/Ng%C3%B4i_Nh%C3%A0_H%E1%BA%A1nh_Ph%C3%BAc_Lofi_sopoqg.mp3',
     '',
     1, N'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop', 12,N'/lyrics/ngoinhahanhphuc.lrc', GETDATE()),
(21, N'Dặm Trong Tim Lofi',           N'Elly',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1781681906/Screenshot_2026-06-17_143633_livn5v.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660152/D%E1%BA%B1m_Trong_Tim_Lofi_jeca4h.mp3',
     '',
     1, N'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop', 12,N'/lyrics/damtrongtim.lrc', GETDATE()),
(22, N'Nửa Vầng Trăng Lofi',          N'Elly',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1781681906/Screenshot_2026-06-17_143653_bnur3y.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660151/N%E1%BB%ADa_V%E1%BA%A7ng_Tr%C4%83ng_Lofi_b6nhos.mp3',
     '',
     1, N'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop', 12,N'/lyrics/nuavangtrang.lrc', GETDATE()),
(23, N'Anh Lofi',                     N'Elly',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1781681907/Screenshot_2026-06-17_143703_mhecu5.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660149/Anh_Lofi_mfw3vv.mp3',
     '',
     1, N'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop', 12,N'/lyrics/anh.lrc', GETDATE()),
(24, N'Hiểu lầm', N'Changg',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113834_dvharv.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780720503/Hi%E1%BB%83u_L%E1%BA%A7m_plbimo.mp3',
     '',
     1, N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113834_dvharv.png', 13,NULL, GETDATE()),
(25, N'Em không hiểu', N'Changg',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_114001_oq3gwg.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780720503/Em_Kh%C3%B4ng_Hi%E1%BB%83u_farjaj.mp3',
     '',
     1, N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_114001_oq3gwg.png', 13,NULL, GETDATE()),
(26, N'Anh đang nơi đâu', N'Changg',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113920_iq4rr0.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1781682572/Anh_%C4%90ang_N%C6%A1i_%C4%90%C3%A2u_liucim.mp3',
     '',
     1, N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113920_iq4rr0.png', 13,NULL, GETDATE()),
(27, N'Và thế giới đã mất đi một người cô đơn', N'Changg',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113920_iq4rr0.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780720504/V%C3%A0_Th%E1%BA%BF_Gi%E1%BB%9Bi_%C4%90%C3%A3_M%E1%BA%A5t_%C4%90i_M%E1%BB%99t_Ng%C6%B0%E1%BB%9Di_C%C3%B4_%C4%90%C6%A1n_uyuhea.mp3',
     '',
     1, N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113920_iq4rr0.png', 13,NULL, GETDATE()),
(28, N'Lỡ say Bye là Bye', N'Changg',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113948_cssrtd.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780720503/L%E1%BB%A1_Say_Bye_L%C3%A0_Bye_zumayw.mp3',
     '',
     1, N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113948_cssrtd.png', 13,NULL, GETDATE()),
(29, N'Hướng Dương', N'Changg',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_114012_ixmbtl.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780720503/H%C6%B0%E1%BB%9Bng_D%C6%B0%C6%A1ng_hhczmc.mp3',
     '',
     1, N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_114012_ixmbtl.png', 13,NULL, GETDATE()),
(30, N'Sài Gòn đâu có lạnh', N'Changg',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_114021_zvpewd.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780720503/S%C3%A0i_G%C3%B2n_%C4%90%C3%A2u_C%C3%B3_L%E1%BA%A1nh_kva2qp.mp3',
     '',
     1, N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_114021_zvpewd.png', 13,NULL, GETDATE()),
(31, N'Định mệnh tình yêu', N'Changg',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721004/Screenshot_2026-06-06_114042_dvxz4p.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780720502/%C4%90%E1%BB%8Bnh_M%E1%BB%87nh_T%C3%ACnh_Y%C3%AAu_Theme_Song_From__Valor_Pass_38_-_Valentine__yr2ao6.mp3',
     '',
     1, N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721004/Screenshot_2026-06-06_114042_dvxz4p.png', 13,NULL, GETDATE()),
(32, N'Tuesday', N'Changg',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721004/Screenshot_2026-06-06_114054_gyrsup.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780720504/Tuesday_sxsmcs.mp3',
     '',
     3, N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721004/Screenshot_2026-06-06_114054_gyrsup.png', 13,NULL, GETDATE()),

(33, N'Trạm dừng chân', N'Jack',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846681/Screenshot_2026-06-07_223134_kngtgv.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846859/Tr%E1%BA%A1m_D%E1%BB%ABng_Ch%C3%A2n_vfg9th.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 2, NULL, GETDATE()),

(34, N'Yêu kiều', N'Paris',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846687/Screenshot_2026-06-07_223527_vcgvnx.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846860/Y%C3%AAu_Ki%E1%BB%81u_wd9nkb.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 15, NULL, GETDATE()),

(35, N'Quá khứ kia của anh', N'Andree Right Hand',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780847819/Screenshot_2026-06-07_225609_gn2vzw.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846859/Qu%C3%A1_Kh%E1%BB%A9_Kia_C%E1%BB%A7a_Anh_hu4di4.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 16, NULL, GETDATE()),

(36, N'Người như anh xứng đáng cô đơn', N'Vũ Cát Tường',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846691/Screenshot_2026-06-07_223711_l0u2is.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846858/NG%C6%AF%E1%BB%9CI_NH%C6%AF_ANH_X%E1%BB%A8NG_%C4%90%C3%81NG_C%C3%94_%C4%90%C6%A0N_ofcwwr.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 17, NULL, GETDATE()),

(37, N'Người im lặng gặp người hay nói', N'Hiếu Thứ Hai',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846683/Screenshot_2026-06-07_223322_g8vcih.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846857/Ng%C6%B0%E1%BB%9Di_Im_L%E1%BA%B7ng_G%E1%BA%B7p_Ng%C6%B0%E1%BB%9Di_Hay_N%C3%B3i_n8b5gj.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 18, NULL, GETDATE()),

(38, N'Nói anh nghe', N'Hoãng',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846685/Screenshot_2026-06-07_223459_wmz8cq.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846856/N%C3%B3i_Anh_Nghe_xbm1rh.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 19, NULL, GETDATE()),

(39, N'Hoa vô sắc', N'Jack',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846682/Screenshot_2026-06-07_223258_a4orju.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846856/Hoa_V%C3%B4_S%E1%BA%AFc_ediafm.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 2, NULL, GETDATE()),

(40, N'Liễu Thanh Yên', N'Jack',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846682/Screenshot_2026-06-07_223231_h094pm.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846856/LI%E1%BB%84U_THANH_Y%C3%8AN_dtfowy.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 2, NULL, GETDATE()),

(41, N'Không buông', N'Hngle',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846684/Screenshot_2026-06-07_223339_sgndlp.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846855/Kh%C3%B4ng_Bu%C3%B4ng_xewwxp.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 20, NULL, GETDATE()),

(42, N'Đứa trẻ mùa đông chí', N'Jack',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846681/Screenshot_2026-06-07_223156_hmi530.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846854/%C4%90%E1%BB%A9a_Tr%E1%BA%BB_M%C3%B9a_%C4%90%C3%B4_Ch%C3%AD_utjnrl.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 2, NULL, GETDATE()),

(43, N'Chúng ta rồi sẽ hạnh phúc', N'Jack',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846682/Screenshot_2026-06-07_223214_uq4cre.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846853/Ch%C3%BAng_Ta_R%E1%BB%93i_S%E1%BA%BD_H%E1%BA%A1nh_Ph%C3%BAc_ehqsfp.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 2, NULL, GETDATE()),

(44, N'Chờ anh về', N'Bray, Amee',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846690/Screenshot_2026-06-07_223657_fkanu6.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846852/CH%E1%BB%9C_ANH_V%E1%BB%80_v71laf.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 21, NULL, GETDATE()),

(45, N'Cho con', N'Bray',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846689/Screenshot_2026-06-07_223643_oouwbf.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846851/Cho_Con_Lullaby_pt.2_bxhnef.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 22, NULL, GETDATE()),

(46, N'Cô ta', N'Parys',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846686/Screenshot_2026-06-07_223512_lafvrz.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846851/c%C3%B4_ta_ruxfnn.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 23, NULL, GETDATE()),

(47, N'Cô đơn', N'Hngle',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846685/Screenshot_2026-06-07_223405_fidx6e.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846850/C%C3%B4_%C4%90%C6%A1n_gsbti5.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 20, NULL, GETDATE()),

(48, N'BLA BLA BLA', N'gigi D`Agostino',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780845053/Screenshot_2026-06-07_220417_urcipc.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846849/BLA_BLA_BLA_ey9grv.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 24, NULL, GETDATE()),

(49, N'Buông', N'Hngle',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846684/Screenshot_2026-06-07_223353_xltkdy.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846849/Bu%C3%B4ng_ugahyj.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 20, NULL, GETDATE()),

(50, N'100 cuộc gọi nhỡ', N'GREYD',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846688/Screenshot_2026-06-07_223601_u40yti.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846849/100_Cu%E1%BB%99c_G%E1%BB%8Di_Nh%E1%BB%A1_usiqsa.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 25, NULL, GETDATE()),

(51, N'01 ngoại lệ', N'Jack',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846682/Screenshot_2026-06-07_223245_pn5utx.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780846848/01_Ngo%E1%BA%A1i_L%E1%BB%87_k62l9q.mp3',
     NULL, 2, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 2, NULL, GETDATE()),

(52, N'Thủ đô Cypher', N'LowG',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780850119/Screenshot_2026-06-07_233402_u9ojgx.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780850255/Th%E1%BB%A7_%C4%90%C3%B4_Cypher_Remix_ccxjau.mp3',
     NULL, 3, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 26, NULL, GETDATE()),

(53, N'Ex hate me', N'Bray, Amee',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780850118/Screenshot_2026-06-07_233332_rlp3vn.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780850254/Ex_s_Hate_Me_cfshpt.mp3',
     NULL, 3, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 21, NULL, GETDATE()),

(54, N'She never know', N'JustaTee',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780850119/Screenshot_2026-06-07_233316_ctl8fr.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780850255/She_Neva_Knows_bbw5hd.mp3',
     NULL, 3, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 27, NULL, GETDATE()),

(55, N'Kim phút kim giờ', N'Hiếu Thứ Hai, HURRYKNG',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780850119/Screenshot_2026-06-07_233234_ljnmdg.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780850255/KIM_PH%C3%9AT_KIM_GI%E1%BB%9C_xwiatm.mp3',
     NULL, 3, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 28, NULL, GETDATE()),

(56, N'Bạn đời', N'Karik',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780850118/Screenshot_2026-06-07_233244_x50lfi.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780850254/B%E1%BA%A1n_%C4%90%E1%BB%9Di_rw0m4z.mp3',
     NULL, 3, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 29, NULL, GETDATE()),

(57, N'Ngủ trong phòng thu', N'MCK',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780850119/Screenshot_2026-06-07_233423_awyhk8.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780850254/Ng%E1%BB%A7_Trong_Ph%C3%B2ng_Thu_Remix_dkmvf8.mp3',
     NULL, 3, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 30, NULL, GETDATE()),

(58, N'Don''t côi', N'Ronboogz',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780850119/Screenshot_2026-06-07_233351_hr5loy.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780850253/Don_t_C%C3%B4i_dxrsmi.mp3',
     NULL, 3, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', NULL,NULL, GETDATE()),

(59, N'Ex sign', N'Hiếu Thứ Hai',
     N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780850118/Screenshot_2026-06-07_233226_uvzxur.png',
     N'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780850253/Exit_Sign_zijxdw.mp3',
     NULL, 3, N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 18, NULL, GETDATE());
SET IDENTITY_INSERT songs OFF;



CREATE TABLE albums (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(255) NOT NULL,
    CoverUrl NVARCHAR(500) NULL,
    ArtistId INT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ArtistId) REFERENCES artists(Id) ON DELETE SET NULL
);


SET IDENTITY_INSERT albums ON;
INSERT INTO albums (Id, Title, CoverUrl, ArtistId, CreatedAt) VALUES 
(1, N'Tuyển Tập Nhạc Của Sơn Tùng M-TP',
    N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780845051/Screenshot_2026-06-07_215430_vvlkgq.png',
    1, GETDATE()),
(2, N'Tuyển Tập Album Nhạc Lofi Chill - Elly',
    N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png',
    12, GETDATE()),
(3, N'Tuyển Tập Album Nhạc - Changg',
    N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113834_dvharv.png',
    13, GETDATE()),
(4, N'Những Bản Hit Của Jack-J97',
    N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657517/vebenanh_rrpaon.jpg', 2, GETDATE()),
(5, N'Tuyển Tập Nhạc Rap Cực Chất',
    N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780850119/Screenshot_2026-06-07_233402_u9ojgx.png', NULL, GETDATE()),
(6, N'V-Pop Đình Đám 2026',
    N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780846681/Screenshot_2026-06-07_223134_kngtgv.png', NULL, GETDATE()),
(7, N'Nhạc Trẻ Gây Nghiện',
    N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657516/chatgayhai_vgatml.jpg', NULL, GETDATE()),
(8, N'Bolero Tình Ca Giao Thời',
    N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1781680484/OIP_4_b3uamy.jpg', NULL, GETDATE()),
(9, N'Ballad Xoa Dịu Trái Tim',
    N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1781680483/OIP_3_zliwgp.jpg', NULL, GETDATE()),
(10, N'Acoustic Thư Giãn Cuối Tuần',
    N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1781680483/OIP_2_prerfx.jpg', NULL, GETDATE()),
(11, N'Nhạc Sàn Sôi Động Nhất',
    N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1781680483/OIP_1_qbw9of.jpg', NULL, GETDATE()),
(12, N'Indie Khám Phá Âm Nhạc Mới',
    N'https://res.cloudinary.com/dawcwuwmm/image/upload/v1781680484/OIP_jhy7qi.jpg', NULL, GETDATE());
SET IDENTITY_INSERT albums OFF;



-- ─────────────────────────────────────────────────────────
-- 4. BẢNG ALBUM_SONGS
-- ─────────────────────────────────────────────────────────
CREATE TABLE album_songs (
    AlbumId INT NOT NULL,
    SongId INT NOT NULL,
    OrderNumber INT DEFAULT 0,
    PRIMARY KEY (AlbumId, SongId),
    FOREIGN KEY (AlbumId) REFERENCES albums(Id) ON DELETE CASCADE,
    FOREIGN KEY (SongId) REFERENCES songs(Id) ON DELETE CASCADE
);


INSERT INTO album_songs (AlbumId, SongId, OrderNumber) VALUES
-- Album 1: Sơn Tùng M-TP (Song 4)
(1, 4, 1),

-- Album 2: Elly (Lofi Chill)
(2, 14, 1), (2, 15, 2), (2, 16, 3), (2, 17, 4), (2, 18, 5), (2, 19, 6), (2, 20, 7), (2, 21, 8), (2, 22, 9), (2, 23, 10),

-- Album 3: Changg
(3, 24, 1), (3, 25, 2), (3, 26, 3), (3, 27, 4), (3, 28, 5), (3, 29, 6), (3, 30, 7), (3, 31, 8), (3, 32, 9),

-- Album 4: Jack-J97
(4, 2, 1), (4, 3, 2), (4, 7, 3), (4, 13, 4), (4, 33, 5), (4, 39, 6), (4, 40, 7), (4, 42, 8), (4, 43, 9), (4, 51, 10),

-- Album 5: Rap Cực Chất (Andree, LowG, Bray, JustaTee, HIEUTHUHAI, Karik, MCK, Ronboogz)
(5, 35, 1), (5, 37, 2), (5, 44, 3), (5, 45, 4), (5, 52, 5), (5, 53, 6), (5, 54, 7), (5, 55, 8), (5, 56, 9), (5, 57, 10), (5, 58, 11), (5, 59, 12),

-- Album 6: V-Pop Đình Đám
(6, 1, 1), (6, 5, 2), (6, 6, 3), (6, 8, 4), (6, 9, 5), (6, 11, 6), (6, 12, 7), (6, 34, 8), (6, 36, 9), (6, 50, 10),

-- Album 7: Nhạc Trẻ Gây Nghiện
(7, 10, 1), (7, 38, 2), (7, 41, 3), (7, 46, 4), (7, 47, 5), (7, 49, 6),

-- Album 8: Bolero / Acoustic / Khác (phân bổ tạm các bài còn lại cho phong phú)
(8, 10, 1), (8, 11, 2),

-- Album 9: Ballad Xoa Dịu
(9, 20, 1), (9, 21, 2), (9, 5, 3), (9, 6, 4),

-- Album 10: Acoustic Thư Giãn
(10, 30, 1), (10, 31, 2), (10, 14, 3), (10, 15, 4),

-- Album 11: Nhạc Sàn
(11, 40, 1), (11, 41, 2), (11, 48, 3),

-- Album 12: Indie Khám Phá
(12, 50, 1), (12, 51, 2), (12, 8, 3), (12, 9, 4);

-- ─────────────────────────────────────────────────────────
-- 5. BẢNG PLAYLISTS VÀ PLAYLIST_SONGS
-- ─────────────────────────────────────────────────────────
CREATE TABLE playlists (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    UserId INT NOT NULL,
    Description NVARCHAR(MAX),
    CoverUrl NVARCHAR(500) NULL,
    IsPublic BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES users(Id) ON DELETE CASCADE
);


CREATE TABLE playlist_songs (
    PlaylistId INT NOT NULL,
    SongId INT NOT NULL,
    AddedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (PlaylistId, SongId),
    FOREIGN KEY (PlaylistId) REFERENCES playlists(Id) ON DELETE CASCADE,
    FOREIGN KEY (SongId) REFERENCES songs(Id) ON DELETE CASCADE
);


-- Seed 2 playlist mẫu
SET IDENTITY_INSERT playlists ON;
INSERT INTO playlists (Id, Name, UserId, Description, CoverUrl, IsPublic, CreatedAt) VALUES
(1, N'Playlist Nhạc V-Pop Yêu Thích', 1,
   N'Tuyển tập những bài V-Pop hay nhất mọi thời đại',
   N'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop', 1, GETDATE()),
(2, N'Nhạc Chill Cuối Tuần', 2,
   N'Những bản nhạc nhẹ nhàng thư giãn dành cho cuối tuần',
   N'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop', 1, GETDATE());
SET IDENTITY_INSERT playlists OFF;

-- Thêm bài hát vào playlist mẫu
INSERT INTO playlist_songs (PlaylistId, SongId, AddedAt) VALUES
(1, 4, GETDATE()), (1, 2, GETDATE()), (1, 6, GETDATE()), (1, 9, GETDATE()), (1, 11, GETDATE()),
(2, 1, GETDATE()), (2, 5, GETDATE()), (2, 14, GETDATE()), (2, 15, GETDATE()), (2, 8, GETDATE());


-- 6. BẢNG FOLLOWS (User follow Artist)
-- ─────────────────────────────────────────────────────────
CREATE TABLE follows (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    ArtistId INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES users(Id) ON DELETE CASCADE,
    FOREIGN KEY (ArtistId) REFERENCES artists(Id) ON DELETE CASCADE,
    UNIQUE (UserId, ArtistId)
);

CREATE TABLE user_follows (
    FollowerId INT NOT NULL,
    FollowedUserId INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (FollowerId, FollowedUserId),
    FOREIGN KEY (FollowerId) REFERENCES users(Id) ON DELETE CASCADE,
    FOREIGN KEY (FollowedUserId) REFERENCES users(Id) ON DELETE NO ACTION
);


INSERT INTO user_follows (FollowerId, FollowedUserId) VALUES 
(1, 2),
(1, 3),
(2, 1);


CREATE TABLE notifications (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    Payload NVARCHAR(MAX) NOT NULL,
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES users(Id) ON DELETE CASCADE
);


CREATE TABLE play_histories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    SongId INT NOT NULL,
    PlayedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES users(Id) ON DELETE CASCADE,
    FOREIGN KEY (SongId) REFERENCES songs(Id) ON DELETE CASCADE
);


CREATE TABLE favorites (
    UserId INT NOT NULL,
    SongId INT NOT NULL,
    PRIMARY KEY (UserId, SongId),
    FOREIGN KEY (UserId) REFERENCES users(Id) ON DELETE CASCADE,
    FOREIGN KEY (SongId) REFERENCES songs(Id) ON DELETE CASCADE
);


CREATE TABLE media_shares (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SenderId INT NOT NULL,
    ReceiverId INT NOT NULL,
    SongId INT NULL,
    PlaylistId INT NULL,
    SharedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (SenderId) REFERENCES users(Id) ON DELETE CASCADE,
    FOREIGN KEY (ReceiverId) REFERENCES users(Id) ON DELETE NO ACTION,
    FOREIGN KEY (SongId) REFERENCES songs(Id) ON DELETE NO ACTION,
    FOREIGN KEY (PlaylistId) REFERENCES playlists(Id) ON DELETE NO ACTION
);


CREATE TABLE user_otps (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL,
    OtpCode NVARCHAR(255) NOT NULL,
    ExpiryTime DATETIME NOT NULL,
    IsUsed BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE user_saved_albums (
    UserId INT NOT NULL,
    AlbumId INT NOT NULL,
    SavedAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (UserId, AlbumId),
    FOREIGN KEY (UserId) REFERENCES users(Id) ON DELETE CASCADE,
    FOREIGN KEY (AlbumId) REFERENCES albums(Id) ON DELETE CASCADE
);

