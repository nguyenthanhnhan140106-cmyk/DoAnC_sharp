import { useMusic } from '../Contexts/MusicContext';
import './Styles/HomePage.css'; // 🟢 Đường dẫn đến file CSS riêng lẻ

export default function RightSidebar() {
  // 1. Gọi bài hát đang phát từ Context ra
  const { currentSong } = useMusic();

  // 2. Nếu chưa bấm phát bài nào -> Hiện giao diện chờ chuẩn Spotify
  if (!currentSong) {
    return (
      <aside className="spotify-right-sidebar" style={{ justifyContent: 'center', alignItems: 'center', color: '#b3b3b3' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" style={{ marginBottom: '16px', color: '#535353' }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
          </svg>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Chưa phát bài nào</h3>
          <p style={{ fontSize: '14px', margin: 0 }}>Hãy chọn 1 bài hát dưới playlist nhen Nam!</p>
        </div>
      </aside>
    );
  }

  // 3. Hàm fallback xử lý ảnh bìa nếu trường hợp link trống
  const activeCover = currentSong.coverUrl || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop`;

  return (
    <aside className="spotify-right-sidebar">
      
      {/* 1. Header: Đang phát */}
      <div className="right-sidebar-header">
        <h3>Đang phát</h3>
      </div>

      {/* 2. Ảnh bìa bài hát to đùng bốc từ DB */}
      <div className="right-sidebar-cover">
        <img src={activeCover} alt={currentSong.title} />
      </div>

      {/* 3. Tên bài hát và Nút Thêm vào Thư viện */}
      <div className="right-sidebar-info">
        <div className="song-details">
          <h4 className="song-title" title={currentSong.title}>{currentSong.title}</h4>
          <p className="song-artist">{currentSong.artist}</p>
        </div>
        <button className="icon-btn" title="Lưu vào Thư viện" style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer' }}>
          <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/><path d="M11.75 8a.75.75 0 0 1-.75.75H8.75V11a.75.75 0 0 1-1.5 0V8.75H4.25a.75.75 0 0 1 0-1.5h3V4.25a.75.75 0 0 1 1.5 0v3h2.25a.75.75 0 0 1 .75.75z"/></svg>
        </button>
      </div>

      {/* 4. Khung Giới thiệu Nghệ sĩ (About the artist) */}
      <div className="artist-card">
        <p className="artist-card-title">Về nghệ sĩ</p>
        <div className="artist-card-content">
          <img 
            src={activeCover} 
            alt={currentSong.artist} 
            className="artist-avatar"
          />
          <div className="artist-details">
            <h4 className="artist-name">{currentSong.artist}</h4>
            <p className="artist-listeners">
              {currentSong.category ? `Tuyển tập: ${currentSong.category.toUpperCase()}` : 'Hệ thống Dapper SQL'}
            </p>
          </div>
        </div>
      </div>

    </aside>
  );
}