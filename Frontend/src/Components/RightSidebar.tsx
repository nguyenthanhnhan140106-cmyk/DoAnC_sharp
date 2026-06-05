import { useState } from 'react';
import { useMusic } from '../Contexts/MusicContext';
import './Styles/HomePage.css';

interface RightSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function RightSidebar({ isCollapsed, setIsCollapsed }: RightSidebarProps) {
  // Bổ sung lấy queue, playSong và isPlaying từ Context
  const { currentSong, queue, playSong, isPlaying } = useMusic();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!currentSong) {
    return (
      <aside className={`spotify-right-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="right-sidebar-no-song-wrapper" style={{ textAlign: 'center', padding: '20px', color: '#b3b3b3' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Chưa phát bài nào</h3>
          <p style={{ fontSize: '14px', margin: 0 }}>Hãy chọn 1 bài hát dưới playlist nhen Nam!</p>
        </div>
        {isCollapsed && (
          <button className="right-expand-btn" onClick={() => setIsCollapsed(false)} title="Mở rộng">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M11.03 1.97a.75.75 0 0 1 0 1.06L5.56 8l5.47 5.47a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0z" />
            </svg>
          </button>
        )}
      </aside>
    );
  }

  const songData = currentSong as any;
  const activeCover = songData.coverUrl || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop`;
  const artistBanner = songData.artistBanner || `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=240&fit=crop`;

  // Tính toán danh sách "Tiếp theo" từ hàng chờ
  const currentIndex = queue.findIndex(s => s.id === currentSong.id);
  const nextSongs = currentIndex !== -1 ? queue.slice(currentIndex + 1) : [];

  return (
    <aside className={`spotify-right-sidebar ${isCollapsed ? 'collapsed' : ''}`}>

      {/* 🟢 NÚT MŨI TÊN KHI THU GỌN */}
      <button className="right-expand-btn" onClick={() => setIsCollapsed(false)} title="Mở rộng bảng thông tin">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
          <path d="M11.03 1.97a.75.75 0 0 1 0 1.06L5.56 8l5.47 5.47a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0z" />
        </svg>
      </button>

      {/* 🟢 KHỐI CHỨA RUỘT GAN */}
      <div className="right-sidebar-full-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* HEADER */}
        <div className="right-sidebar-header">
          <h3>Danh sách phát</h3>
          <button className="right-close-icon-btn" onClick={() => setIsCollapsed(true)} title="Thu gọn bảng thông tin">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H3zm1-2h16V4H4v16zm8-13v10l-5-5 5-5z" />
            </svg>
          </button>
        </div>

        {/* BÀI HÁT ĐANG PHÁT */}
        <div>
          <div className="right-sidebar-cover" style={{ marginBottom: '12px' }}>
            <img src={activeCover} alt={songData.title} />
          </div>

          <div className="right-sidebar-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="song-details" style={{ flex: 1, overflow: 'hidden' }}>
              <h4 className="song-title" title={songData.title} style={{ color: isPlaying ? '#1db954' : '#fff' }}>
                {songData.title}
              </h4>
              <p className="song-artist">{songData.artist}</p>
            </div>
            {/* Equalizer mini nhảy múa khi đang phát */}
            {isPlaying && (
              <div className="equalizer" style={{ transform: 'scale(0.8)', marginLeft: '8px' }}>
                <span></span><span></span><span></span>
              </div>
            )}
          </div>
        </div>

        {/* DANH SÁCH BÀI TIẾP THEO (Chỉ hiện nếu đang trong Album có nhiều bài) */}
        {nextSongs.length > 0 && (
          <div className="queue-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#fff' }}>Tiếp theo</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {nextSongs.map((song) => (
                <div
                  key={`next-${song.id}`}
                  onClick={() => playSong(song)} // Bấm vào để hát bài này luôn
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '6px' }}
                  className="queue-hover-item"
                >
                  <img
                    src={song.coverUrl || `https://picsum.photos/seed/${song.id}/40/40`}
                    alt={song.title}
                    style={{ width: 40, height: 40, borderRadius: '4px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {song.title}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#b3b3b3' }}>{song.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* THÔNG TIN NGHỆ SĨ (Giữ nguyên hộp thoại) */}
        <div className="spotify-about-artist-box" onClick={() => setIsDialogOpen(true)} style={{ marginTop: 'auto' }}>
          <div className="about-artist-banner">
            <img src={artistBanner} alt={songData.artist} />
            <div className="about-artist-title-overlay"><span>About the artist</span></div>
          </div>
          <div className="about-artist-body">
            <h4 className="about-artist-name">{songData.artist}</h4>
            <p className="about-monthly-listeners">
              {songData.monthlyListeners ? `${songData.monthlyListeners.toLocaleString()} monthly listeners` : 'Click để xem chi tiết'}
            </p>
          </div>
        </div>
      </div>

      {/* DIALOG THÔNG TIN CHI TIẾT */}
      {isDialogOpen && (
        <div className="spotify-dialog-overlay" onClick={() => setIsDialogOpen(false)}>
          <div className="spotify-artist-panel" onClick={(e) => e.stopPropagation()}>

            {/* Ảnh Banner Siêu Bự Nằm Trên Cùng */}
            <div className="artist-panel-header">
              <img src={artistBanner} alt={songData.artist} className="artist-panel-banner" />
              <button className="panel-close-btn" onClick={() => setIsDialogOpen(false)}>✕</button>
            </div>

            <div className="artist-panel-body">
              {/* CỘT TRÁI: Các con số thống kê */}
              <div className="artist-panel-stats">
                <div className="stat-block">
                  <h2>{songData.followers?.toLocaleString() || "0"}</h2>
                  <p>Followers</p>
                </div>
                <div className="stat-block">
                  <h2>{songData.monthlyListeners?.toLocaleString() || "0"}</h2>
                  <p>Monthly Listeners</p>
                </div>

                {songData.worldRank > 0 && (
                  <div className="stat-block">
                    <h2>#{songData.worldRank}</h2>
                    <p>World Rank</p>
                  </div>
                )}

                {/* Các icon mạng xã hội giả lập */}
                <div className="social-links">
                  <div className="social-item"><span className="icon">f</span> Facebook</div>
                  <div className="social-item"><span className="icon">📷</span> Instagram</div>
                </div>
              </div>

              {/* CỘT PHẢI: Tiểu sử và Badge Verified */}
              <div className="artist-panel-info">
                <div className="artist-bio-header">
                  <img src={activeCover} alt={songData.artist} className="bio-avatar" />
                  <span className="bio-author">Posted By {songData.artist}</span>
                </div>

                <p className="artist-bio-text">
                  {songData.bio || "Nghệ sĩ này chưa có tiểu sử."}
                </p>

                {/* Khối Badge Verified y hệt Spotify */}
                <div className="verified-badge-card">
                  <div className="badge-title">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="#1db954">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span>Verified by Spotify</span>
                  </div>
                  <p>Nghệ sĩ này đã có lượng người hâm mộ ổn định để đủ điều kiện xét duyệt và đã đáp ứng tiêu chí xác thực hồ sơ của Spotify.</p>
                </div>

                {/* Khối Registered Artist */}
                <div className="registered-artist-card">
                  <div className="badge-title">Registered artist</div>
                  <p>Nghệ sĩ này đã nhận quyền sở hữu hồ sơ trên Spotify for Artists.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </aside>
  );
}
