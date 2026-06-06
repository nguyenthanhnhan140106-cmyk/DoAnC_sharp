-- =========================================================
-- TUNEVAULT - SCRIPT KHỞI TẠO DATABASE VỚI CLOUDINARY LINKS
-- =========================================================

DROP TABLE IF EXISTS album_songs;
DROP TABLE IF EXISTS albums;
DROP TABLE IF EXISTS songs;
DROP TABLE IF EXISTS artists;

-- ─────────────────────────────────────────────────────────
-- 1. BẢNG NGHỆ SĨ
-- ─────────────────────────────────────────────────────────
CREATE TABLE artists (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL UNIQUE,
    WorldRank INT DEFAULT 0,
    Followers INT DEFAULT 0,
    MonthlyListeners INT DEFAULT 0,
    Bio TEXT NULL,
    IsVerified BOOLEAN DEFAULT TRUE
);

INSERT INTO artists (Id, Name, WorldRank, Followers, MonthlyListeners, Bio, IsVerified) VALUES 
(1,  'Sơn Tùng M-TP',      36,  3446275, 62093978, 'Sơn Tùng M-TP là ca sĩ, nhạc sĩ tiên phong của dòng nhạc Pop hiện đại tại Việt Nam, sở hữu lượng fan hâm mộ quốc tế đông đảo.', 1),
(2,  'Jack-J97',           120, 1546275, 24093978, 'Jack - Trịnh Trần Phương Tuấn là nam ca sĩ sở hữu chất giọng miền Tây đặc trưng cùng hàng loạt bản hit kỷ lục trăm triệu views.', 1),
(3,  'Jack-J97,K-ICM,ICM',  88, 2100500, 31500200, 'Bộ ba kết hợp đình đám tạo nên kỷ nguyên nhạc điện tử phối khí nhạc cụ dân tộc độc bản tại thị trường nhạc Việt.', 1),
(4,  'DatKaa',             450,  446275,  3421895, 'DatKaa (Nguyễn Tấn Đạt) mang đến làn gió âm nhạc mộc mạc, chất phác nhưng đầy lôi cuốn của người con Nam Bộ.', 1),
(5,  'Quang Hùng MasterD',  95, 1285400, 18560000, 'Nam ca sĩ, nhạc sĩ tài năng sở hữu lượng người hâm mộ cực khủng tại Thái Lan và các nước Đông Nam Á.', 1),
(6,  'Dương Domic',        154,  856000,  7230000, 'Dương Domic là nhân tố bùng nổ sở hữu tư duy tạo hit thời thượng cùng khả năng trình diễn sân khấu toàn diện.', 1),
(7,  'Binz, SOONBIN',       52, 2856000, 42090000, 'Sự kết hợp hoàn hảo giữa ông hoàng thơ rap lãng tử Binz và hoàng tử R&B sở hữu chất giọng đầy kỹ thuật SOOBIN.', 1),
(8,  'ANH TRAI SAY HI',     11, 5420000, 85600000, 'Tổ hợp các nghệ sĩ xu hướng tạo nên những sân khấu trình diễn đỉnh cao và dẫn đầu mọi bảng xếp hạng thịnh hành.', 1),
(9,  'VƯƠNG BÌNH',         680,  125000,   980000, 'Giọng ca Indie mới nổi đầy triển vọng với những giai điệu lofi trầm buồn, sâu lắng đánh trúng tâm lý giới trẻ.', 1),
(10, 'Minh Huy, Pinny',    720,   95000,   560000, 'Cặp đôi nghệ sĩ trẻ tự do với phong cách âm nhạc Acoustic nhẹ nhàng, mang đậm hơi thở thanh xuân.', 1),
(11, 'Thiên Đình',         810,   45000,   310000, 'Dự án âm nhạc thể nghiệm mang màu sắc cổ trang kết hợp điện tử huyền ảo độc đáo.', 1),
(12, 'Elly', 320, 580000, 4200000, 'Elly là nghệ sĩ Lofi Chill nổi tiếng với những giai điệu nhẹ nhàng, thư giãn mang đậm phong cách chill độc đáo.', 1),
(13, 'Changg', 250, 450000, 3200000, 'Changg là một giọng ca trẻ đầy tiềm năng với những bản hit nổi bật trên các nền tảng mạng xã hội.', 1);


-- ─────────────────────────────────────────────────────────
-- 2. BẢNG BÀI HÁT (CLOUDINARY LINKS)
-- ─────────────────────────────────────────────────────────
CREATE TABLE songs (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Artist VARCHAR(255) NOT NULL,
    CoverUrl VARCHAR(500) NULL,
    AudioUrl VARCHAR(500) NULL,
    Category VARCHAR(100) NULL,
    ArtistBanner VARCHAR(500) NULL,
    ArtistId INT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ArtistId) REFERENCES artists(Id) ON DELETE SET NULL
);

INSERT INTO songs (Id, Title, Artist, CoverUrl, AudioUrl, Category, ArtistBanner, ArtistId, CreatedAt) VALUES 
(1,  'Thanh Tân',           'VƯƠNG BÌNH',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657517/thanhtan_olnawd.jpg',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657507/thanhtan_tnaf1e.mp3',
     'friday', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=240&fit=crop', 9, NOW()),

(2,  'Về bên anh',          'Jack-J97',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657517/vebenanh_rrpaon.jpg',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657507/vebenanh_kf3kmi.mp3',
     'vsound', 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=240&fit=crop', 2, NOW()),

(3,  'Sóng gió',            'Jack-J97,K-ICM,ICM',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657517/songgio_kb1ndq.jpg',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657506/songgio_zreqh8.mp3',
     'vsound', 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=240&fit=crop', 3, NOW()),

(4,  'Nơi này có anh',      'Sơn Tùng M-TP',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657517/noinaycoanh_t4adrb.jpg',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657502/noinaycoanh_eo4kxd.mp3',
     'vsound', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 1, NOW()),

(5,  'Ngày rời chuyến bay', 'Minh Huy, Pinny',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657517/ngayroichuyenbay_ytirxp.jpg',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657503/ngayroichuyenbay_xovjt2.mp3',
     'friday', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=240&fit=crop', 10, NOW()),

(6,  'Mất kết nối',         'Dương Domic',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657517/matketnoi_xr8gpa.jpg',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657504/matketnoi_otbz56.mp3',
     'vsound', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&h=240&fit=crop', 6, NOW()),

(7,  'Hồng nhan',           'Jack-J97, K-ICM, ICM',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657516/hongnhan_isqcez.jpg',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657499/hongnhan_f6rlrh.mp3',
     'vsound', 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=240&fit=crop', 3, NOW()),

(8,  'Em thua cô ta',       'Thiên Đình',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657516/emthuacota_uugowq.jpg',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657501/emthuacota_nbuyyp.mp3',
     'friday', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=240&fit=crop', 11, NOW()),

(9,  'Em',                  'Binz, SOONBIN',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657516/em_d1ahp5.jpg',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657502/em_brfzsn.mp3',
     'vsound', 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=500&h=240&fit=crop', 7, NOW()),

(10, 'Đớn đau vô cùng',     'DatKaa',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657516/dondauvocung_qyamxw.jpg',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657507/dondauvocung_htprq8.mp3',
     'friday', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=240&fit=crop', 4, NOW()),

(11, 'Chờ anh về',          'ANH TRAI SAY HI',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657516/choanhve_xa6mtg.jpg',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657506/choanhve_zfitwt.mp3',
     'rap', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&h=240&fit=crop', 8, NOW()),

(12, 'Chất gây hại',        'Quang Hùng MasterD',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657516/chatgayhai_vgatml.jpg',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657502/chatgayhai_coic6r.mp3',
     'vsound', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=240&fit=crop', 5, NOW()),

(13, 'Bạc phận',            'Jack-J97, K-ICM, ICM',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657516/bacphan_cylj9h.jpg',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780657500/bacphan_mstj0s.mp3',
     'vsound', 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=240&fit=crop', 3, NOW()),

(14, 'Túc Duyên Lofi',                'Elly',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660154/T%C3%BAc_Duy%C3%AAn_Lofi_uisjpw.mp3',
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png', 12, NOW()),
(15, 'Góc Nhỏ Trong Tim Lofi',       'Elly',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660154/G%C3%B3c_Nh%E1%BB%8F_Trong_Tim_Lofi_w4njus.mp3',
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png', 12, NOW()),
(16, 'Hoang Mang Lofi',              'Elly',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660154/Hoang_Mang_Lofi_z1hp0i.mp3',
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png', 12 , NOW()),
(17, 'Nhường Lại Nỗi Đau Lofi',     'Elly',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660153/Nh%C6%B0%E1%BB%9Dng_L%E1%BA%A1i_N%E1%BB%97i_%C4%90au_Lofi_zr6bnn.mp3',
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png', 12, NOW()),
(18, 'Em Thua Người Ta Nhiều Lắm Lofi', 'Elly',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660153/Em_Thua_Ng%C6%B0%E1%BB%9Di_Ta_Nhi%E1%BB%81u_L%E1%BA%AFm_Lofi_uhbest.mp3',
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png', 12, NOW()),
(19, 'Bên Nhau Cả Đời Lofi',         'Elly',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660153/B%C3%AAn_Nhau_C%E1%BA%A3_%C4%90%E1%BB%9Di_Lofi_povrxf.mp3',
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png', 12, NOW()),
(20, 'Ngôi Nhà Hạnh Phúc Lofi',      'Elly',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660152/Ng%C3%B4i_Nh%C3%A0_H%E1%BA%A1nh_Ph%C3%BAc_Lofi_sopoqg.mp3',
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png', 12, NOW()),
(21, 'Dặm Trong Tim Lofi',           'Elly',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660152/D%E1%BA%B1m_Trong_Tim_Lofi_jeca4h.mp3',
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png', 12, NOW()),
(22, 'Nửa Vầng Trăng Lofi',          'Elly',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660151/N%E1%BB%ADa_V%E1%BA%A7ng_Tr%C4%83ng_Lofi_b6nhos.mp3',
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png', 12, NOW()),
(23, 'Anh Lofi',                     'Elly',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780660149/Anh_Lofi_mfw3vv.mp3',
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png', 12, NOW()),
(24, 'Hiểu lầm', 'Changg',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113834_dvharv.png',
     NULL,
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113834_dvharv.png', 13, NOW()),
(25, 'Em không hiểu', 'Changg',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_114001_oq3gwg.png',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780720503/Em_Kh%C3%B4ng_Hi%E1%BB%83u_farjaj.mp3',
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_114001_oq3gwg.png', 13, NOW()),
(26, 'Anh đang nơi đâu', 'Changg',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113920_iq4rr0.png',
     NULL,
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113920_iq4rr0.png', 13, NOW()),
(27, 'Và thế giới đã mất đi một người cô đơn', 'Changg',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113920_iq4rr0.png',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780720504/V%C3%A0_Th%E1%BA%BF_Gi%E1%BB%9Bi_%C4%90%C3%A3_M%E1%BA%A5t_%C4%90i_M%E1%BB%99t_Ng%C6%B0%E1%BB%9Di_C%C3%B4_%C4%90%C6%A1n_uyuhea.mp3',
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113920_iq4rr0.png', 13, NOW()),
(28, 'Lỡ say Bye là Bye', 'Changg',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113948_cssrtd.png',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780720503/L%E1%BB%A1_Say_Bye_L%C3%A0_Bye_zumayw.mp3',
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113948_cssrtd.png', 13, NOW()),
(29, 'Hướng Dương', 'Changg',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_114012_ixmbtl.png',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780720503/H%C6%B0%E1%BB%9Bng_D%C6%B0%C6%A1ng_hhczmc.mp3',
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_114012_ixmbtl.png', 13, NOW()),
(30, 'Sài Gòn đâu có lạnh', 'Changg',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_114021_zvpewd.png',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780720503/S%C3%A0i_G%C3%B2n_%C4%90%C3%A2u_C%C3%B3_L%E1%BA%A1nh_kva2qp.mp3',
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_114021_zvpewd.png', 13, NOW()),
(31, 'Định mệnh tình yêu', 'Changg',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721004/Screenshot_2026-06-06_114042_dvxz4p.png',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780720502/%C4%90%E1%BB%8Bnh_M%E1%BB%87nh_T%C3%ACnh_Y%C3%AAu_Theme_Song_From__Valor_Pass_38_-_Valentine__yr2ao6.mp3',
     'friday', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721004/Screenshot_2026-06-06_114042_dvxz4p.png', 13, NOW()),
(32, 'Tuesday', 'Changg',
     'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721004/Screenshot_2026-06-06_114054_gyrsup.png',
     'https://res.cloudinary.com/dawcwuwmm/video/upload/v1780720504/Tuesday_sxsmcs.mp3',
     'rap', 'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721004/Screenshot_2026-06-06_114054_gyrsup.png', 13, NOW());


CREATE TABLE albums (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    CoverUrl VARCHAR(500) NULL,
    ArtistId INT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ArtistId) REFERENCES artists(Id) ON DELETE SET NULL
);

INSERT INTO albums (Id, Title, CoverUrl, ArtistId, CreatedAt) VALUES 
(1, 'Tuyển Tập TuneVault Hot Hits',
    'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780657517/noinaycoanh_t4adrb.jpg',
    NULL, NOW()),
(2, 'Tuyển Tập Album Nhạc Lofi Chill - Elly',
    'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780660046/Screenshot_2026-06-05_184624_q5mqnh.png',
    12, NOW()),
(3, 'Tuyển Tập Album Nhạc - Changg',
    'https://res.cloudinary.com/dawcwuwmm/image/upload/v1780721003/Screenshot_2026-06-06_113834_dvharv.png',
    13, NOW());


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
(1, 1,  1),
(1, 2,  2),
(1, 3,  3),
(1, 4,  4),
(1, 5,  5),
(1, 6,  6),
(1, 7,  7),
(1, 8,  8),
(1, 9,  9),
(1, 10, 10),

(2, 14, 1),
(2, 15, 2),
(2, 16, 3),
(2, 17, 4),
(2, 18, 5),
(2, 19, 6),
(2, 20, 7),
(2, 21, 8),
(2, 22, 9),
(2, 23, 10),

(3, 24, 1),
(3, 25, 2),
(3, 26, 3),
(3, 27, 4),
(3, 28, 5),
(3, 29, 6),
(3, 30, 7),
(3, 31, 8),
(3, 32, 9);


-- ─────────────────────────────────────────────────────────
-- 5. BẢNG MEDIA_TAGS (Phân loại tự động)
-- ─────────────────────────────────────────────────────────
CREATE TABLE media_tags (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    SongId INT NOT NULL,
    Tag VARCHAR(50) NOT NULL,
    FOREIGN KEY (SongId) REFERENCES songs(Id) ON DELETE CASCADE
);

COMMIT;
