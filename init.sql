DELETE FROM songs;
ALTER TABLE songs AUTO_INCREMENT = 1;

INSERT INTO songs (Title, Artist, CoverUrl, AudioUrl, Category, CreatedAt) 
VALUES 
(
    'Thanh Tân',
    'VƯƠNG BÌNH',
    'http://localhost:5000/images/thanhtan.jpg',
    'http://localhost:5000/audio/thanhtan.mp3',
    'friday',
    NOW()
),
(
    'Về bên anh',
    'Jack-J97',
    'http://localhost:5000/images/vebenanh.jpg',
    'http://localhost:5000/audio/vebenanh.mp3',
    'vsound',
    NOW()
),
(
    'Sóng gió',
    'Jack-J97,K-ICM,ICM',
    'http://localhost:5000/images/songgio.jpg',
    'http://localhost:5000/audio/songgio.mp3',
    'vsound',
    NOW()
),
(
    'Nơi này có anh',
    'Sơn Tùng M-TP',
    'http://localhost:5000/images/noinaycoanh.jpg',
    'http://localhost:5000/audio/noinaycoanh.mp3',
    'vsound',
    NOW()
),
(
    'Ngày rời chuyến bay',
    'Minh Huy, Pinny',
    'http://localhost:5000/images/ngayroichuyenbay.jpg',
    'http://localhost:5000/audio/ngayroichuyenbay.mp3',
    'friday',
    NOW()
),
(
    'Mất kết nối',
    'Dương Domic',
    'http://localhost:5000/images/matketnoi.jpg',
    'http://localhost:5000/audio/matketnoi.mp3',
    'vsound',
    NOW()
),
(
    'Hồng nhan',
    'Jack-J97, K-ICM, ICM',
    'http://localhost:5000/images/hongnhan.jpg',
    'http://localhost:5000/audio/hongnhan.mp3',
    'vsound',
    NOW()
),
(
    'Em thua cô ta',
    'Thiên Đình',
    'http://localhost:5000/images/emthuacota.jpg',
    'http://localhost:5000/audio/emthuacota.mp3',
    'friday',
    NOW()
),
(
    'Em',
    'Binz, SOONBIN',
    'http://localhost:5000/images/em.jpg',
    'http://localhost:5000/audio/em.mp3',
    'vsound',
    NOW()
),
(
    'Đớn đau vô cùng',
    'DatKaa',
    'http://localhost:5000/images/dondauvocung.jpg',
    'http://localhost:5000/audio/dondauvocung.mp3',
    'friday',
    NOW()
),
(
    'Chờ anh về',
    'ANH TRAI SAY HI',
    'http://localhost:5000/images/choanhve.jpg',
    'http://localhost:5000/audio/choanhve.mp3',
    'rap',
    NOW()
),
(
    'Chất gây hại',
    'Quang Hùng MasterD',
    'http://localhost:5000/images/chatgayhai.jpg',
    'http://localhost:5000/audio/chatgayhai.mp3',
    'vsound',
    NOW()
),
(
    'Bạc phận',
    'Jack-J97, K-ICM, ICM',
    'http://localhost:5000/images/bacphan.jpg',
    'http://localhost:5000/audio/bacphan.mp3',
    'vsound',
    NOW()
)
;
