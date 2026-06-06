import { useState, useRef } from 'react';
import { useMusic } from '../Contexts/MusicContext';
import './Styles/HomePage.css';

interface RightSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function RightSidebar({ isCollapsed, setIsCollapsed }: RightSidebarProps) {
  // Lấy chính xác các thuộc tính điều khiển từ MusicContext
  const musicContext = useMusic() as any;
  const currentSong = musicContext?.currentSong;
  const isPlaying = musicContext?.isPlaying;
  const togglePlay = musicContext?.togglePlay;
  const pauseSong = musicContext?.pauseSong; // Lấy thêm hàm pause chủ động nếu có

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Sử dụng ref để nhớ trạng thái nhạc trước khi bật MV
  const wasPlayingBeforeVideo = useRef(false);

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

  // Kiểm tra video hợp lệ
  const hasVideo = !!songData.videoUrl; 

  // 🟢 HÀM ĐÓNG MV THÔNG MINH - ĐÃ KHẮC PHỤC GIỰT LẶP ÂM THANH
  const handleCloseVideo = () => {
    setIsVideoOpen(false);
    
    // Sử dụng setTimeout siêu ngắn (0ms) đẩy lệnh chạy nhạc vào Event Loop sau khi Component đóng hẳn, tránh xung đột render với thẻ <video>
    setTimeout(() => {
      if (wasPlayingBeforeVideo.current && togglePlay) {
        togglePlay();
      }
      wasPlayingBeforeVideo.current = false; // Reset cờ
    }, 50);
  };

  return (
    <aside className={`spotify-right-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      
      {/* NÚT MŨI TÊN KHI THU GỌN */}
      <button className="right-expand-btn" onClick={() => setIsCollapsed(false)} title="Mở rộng bảng thông tin">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
          <path d="M11.03 1.97a.75.75 0 0 1 0 1.06L5.56 8l5.47 5.47a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0z" />
        </svg>
      </button>

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 8633eca6b2ae872eb05e616996b36970a8868c01
      {/* KHỐI CHỨA RUỘT GAN */}
      <div className="right-sidebar-full-content">
=======
      {/* 🟢 KHỐI CHỨA RUỘT GAN */}
      <div className="right-sidebar-full-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* HEADER */}
>>>>>>> 837d20ec7dd5c5c321a4d9ef50484ccb4402af41
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

<<<<<<< HEAD
        <div className="right-sidebar-info">
          <div className="song-details">
            <h4 className="song-title" title={songData.title} style={{ color: isPlaying ? '#1db954' : '#fff' }}>
              {songData.title}
            </h4>
            <p className="song-artist">{songData.artist}</p>
          </div>
        </div>

        {/* NÚT XEM VIDEO HOẶC MV ĐÃ ĐƯỢC CHUẨN HÓA STYLE */}
        <div className="right-sidebar-video-action" style={{ padding: "0 16px", marginBottom: "16px" }}>
          <button
            className={`view-video-btn ${hasVideo ? 'available' : 'disabled'}`}
            disabled={!hasVideo}
            onClick={() => {
              // 1. Ghi nhớ trạng thái phát nhạc trước đó
              wasPlayingBeforeVideo.current = isPlaying;
              
              // 2. Tạm dừng nhạc hệ thống một cách an toàn
              if (isPlaying) {
                if (pauseSong) {
                  pauseSong();
                } else if (togglePlay) {
                  togglePlay();
                }
              }
              // 3. Mở Dialog Video
              setIsVideoOpen(true);
            }}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "500px",
              border: "none",
              fontWeight: 700,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: hasVideo ? "pointer" : "not-allowed",
              backgroundColor: hasVideo ? "#1db954" : "#242424", 
              color: hasVideo ? "#fff" : "#727272",
              transition: "all 0.2s ease"
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M23 12c0 6.075-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1s11 4.925 11 11zm-13.5-4.5v9l7-4.5-7-4.5z"/>
            </svg>
            {hasVideo ? "Xem Video MV" : "Không có Video"}
          </button>
        </div>

        {/* KHỐI ABOUT THE ARTIST */}
        <div className="spotify-about-artist-box" onClick={() => setIsDialogOpen(true)} style={{ cursor: "pointer" }}>
<<<<<<< HEAD
=======
=======
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
>>>>>>> 837d20ec7dd5c5c321a4d9ef50484ccb4402af41
>>>>>>> 8633eca6b2ae872eb05e616996b36970a8868c01
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

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 8633eca6b2ae872eb05e616996b36970a8868c01
      {/* 🟢 DIALOG POPUP XEM VIDEO MV XỊN SÒ */}
      {isVideoOpen && (
        <div 
          className="spotify-dialog-overlay" 
          onClick={handleCloseVideo} 
          style={{ 
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.85)", 
            backdropFilter: "blur(12px)",          
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
        >
          <div 
            className="spotify-dialog-content video-modal" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              width: "85%",                
              maxWidth: "1100px",          
              backgroundColor: "#121212", 
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #282828",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.8)",
              display: "flex",
              flexDirection: "column",
              position: "relative"        
            }}
          >
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              padding: "18px 24px", 
              color: "#fff", 
              borderBottom: "1px solid #232323",
              backgroundColor: "#181818",
              width: "100%",               
              boxSizing: "border-box"
            }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ marginRight: "14px", display: "flex", alignItems: "center" }}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="#1db954">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ 
                    fontSize: "11px", 
                    fontWeight: 800, 
                    color: "#1db954", 
                    letterSpacing: "1.5px", 
                    textTransform: "uppercase" 
                  }}>
                    Official Music Video
                  </span>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: "17px", 
                    fontWeight: 700, 
                    letterSpacing: "-0.3px",
                    color: "#ffffff"
                  }}>
                    {songData.title} <span style={{ color: "#a7a7a7", fontWeight: 400, fontSize: "14px" }}>— {songData.artist}</span>
                  </h3>
                </div>
              </div>

              {/* NÚT "✕" - HOVER PHÓNG TO XANH LÁ */}
              <button 
                onClick={handleCloseVideo} 
                style={{ 
                  background: "rgba(255, 255, 255, 0.06)", 
                  border: "none", 
                  color: "#b3b3b3", 
                  fontSize: "13px", 
                  fontWeight: "bold",
                  width: "34px", 
                  height: "34px",
                  borderRadius: "50%",
                  cursor: "pointer", 
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  outline: "none",
                  flexShrink: 0,             
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)" 
                }}
                onMouseOver={e => {
                  e.currentTarget.style.color = "#1db954";            
                  e.currentTarget.style.backgroundColor = "rgba(29, 185, 84, 0.15)"; 
                  e.currentTarget.style.transform = "scale(1.25)";    
                }}
                onMouseOut={e => {
                  e.currentTarget.style.color = "#b3b3b3";
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.transform = "scale(1)";       
                }}
                title="Đóng cửa sổ"
              >
                ✕
              </button>
            </div>

            <div style={{ 
              width: "100%", 
              backgroundColor: "#000", 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              position: "relative"
            }}>
              {songData.videoUrl ? (
                <video
                  key={songData.videoUrl}
                  src={songData.videoUrl} 
                  controls
                  autoPlay
                  style={{
                    width: "100%",
                    maxHeight: "75vh", 
                    objectFit: "contain",
                    display: "block",
                    backgroundColor: "#000"
                  }}
                >
                  Trình duyệt của bạn không hỗ trợ thẻ phát video này.
                </video>
              ) : (
                <div style={{ color: "#888", padding: "100px 20px", textAlign: "center", fontStyle: "italic" }}>
                  Không tìm thấy tệp tin video hợp lệ.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DIALOG THÔNG TIN CA SĨ */}
=======
      {/* DIALOG THÔNG TIN CHI TIẾT */}
>>>>>>> 837d20ec7dd5c5c321a4d9ef50484ccb4402af41
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
<<<<<<< HEAD
                <div className="stat-group">
                  <p className="stat-number">{songData.followers?.toLocaleString() || "0"}</p>
                  <p style={{ color: "#b3b3b3", fontSize: "12px", margin: 0 }}>Followers</p>
                </div>
              </div>
              <div className="dialog-info-col">
                <p className="dialog-bio-text">{songData.bio || "Nghệ sĩ này chưa có tiểu sử cụ thể."}</p>
              </div>
=======

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

>>>>>>> 837d20ec7dd5c5c321a4d9ef50484ccb4402af41
            </div>
          </div>
        </div>
      )}
<<<<<<< HEAD
=======

>>>>>>> 8633eca6b2ae872eb05e616996b36970a8868c01
    </aside>
  );
}
