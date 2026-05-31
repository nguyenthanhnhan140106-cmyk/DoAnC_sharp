-- 1. Xóa sạch bách 5 bài cũ đang hiện trên web
DELETE FROM songs;
ALTER TABLE songs AUTO_INCREMENT = 1;

-- 2. Chỉ chèn duy nhất 2 bài hát Nam muốn
INSERT INTO songs (Title, Artist, CoverUrl, AudioUrl, Category, CreatedAt) VALUES
(
    'Xuất Phát Điểm', 
    'Obito, Shiki', 
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop', 
    'https://raw.githubusercontent.com/vannam52/music/main/Obito%20-%20Xu%E1%BA%A5t%20Ph%C3%A1t%20%C4%90i%E1%BB%83m.mp3', 
    'friday', 
    NOW()
),
(
    'Tell The Truth', 
    'Obito', 
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop', 
    'https://raw.githubusercontent.com/vannam52/music/main/Obito%20-%20Tell%20The%20Truth.mp3', 
    'vsound', 
    NOW()
);