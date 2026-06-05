import { useState } from 'react';
import { useMusic } from '../Contexts/MusicContext';
import './Styles/HomePage.css';

interface RightSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function RightSidebar({ isCollapsed, setIsCollapsed }: RightSidebarProps) {
  const { currentSong } = useMusic();
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
              <path d="M11.03 1.97a.75.75 0 0 1 0 1.06L5.56 8l5.47 5.47a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0z"/>
            </svg>
          </button>
        )}
      </aside>
    );
  }

  const songData = currentSong as any;
  const activeCover = songData.coverUrl || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop`;
  const artistBanner = songData.artistBanner || `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=240&fit=crop`;

  return (
    <aside className={`spotify-right-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      
      {/* 🟢 NÚT MŨI TÊN KHI THU GỌN (Luôn ẩn, chỉ hiện ra bằng CSS khi dính class .collapsed) */}
      <button className="right-expand-btn" onClick={() => setIsCollapsed(false)} title="Mở rộng bảng thông tin">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
          <path d="M11.03 1.97a.75.75 0 0 1 0 1.06L5.56 8l5.47 5.47a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0z"/>
        </svg>
      </button>

      {/* 🟢 KHỐI CHỨA RUỘT GAN: Sẽ bị ẩn dứt khoát bằng CSS khi thu gọn */}
      <div className="right-sidebar-full-content">
        <div className="right-sidebar-header">
          <h3>Đang phát</h3>
          <button className="right-close-icon-btn" onClick={() => setIsCollapsed(true)} title="Thu gọn bảng thông tin">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H3zm1-2h16V4H4v16zm8-13v10l-5-5 5-5z"/>
            </svg>
          </button>
        </div>

        <div className="right-sidebar-cover">
          <img src={activeCover} alt={songData.title} />
        </div>

        <div className="right-sidebar-info">
          <div className="song-details">
            <h4 className="song-title" title={songData.title}>{songData.title}</h4>
            <p className="song-artist">{songData.artist}</p>
          </div>
        </div>

        <div className="spotify-about-artist-box" onClick={() => setIsDialogOpen(true)}>
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

      {/* Dialog giữ nguyên bên dưới */}
      {isDialogOpen && (
        <div className="spotify-dialog-overlay" onClick={() => setIsDialogOpen(false)}>
          <div className="spotify-dialog-content" onClick={(e) => e.stopPropagation()}>
            <button className="dialog-close-btn" onClick={() => setIsDialogOpen(false)}>✕</button>
            <div className="dialog-image-wrapper"><img src={activeCover} alt={songData.artist} /></div>
            <div className="dialog-body-layout">
              <div className="dialog-stats-col">
                {songData.worldRank > 0 && (
                  <div className="world-rank-badge"><span className="rank-number">#{songData.worldRank}</span></div>
                )}
                <div className="stat-group"><p className="stat-number">{songData.followers?.toLocaleString()}</p></div>
              </div>
              <div className="dialog-info-col"><p className="dialog-bio-text">{songData.bio}</p></div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}