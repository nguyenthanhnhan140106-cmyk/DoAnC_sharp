export default function RightSidebar() {
  return (
    <aside className="spotify-right-sidebar">
      
      {/* 1. Header: Đang phát */}
      <div className="right-sidebar-header">
        <h3>Đang phát</h3>
        {/* <button className="icon-btn" title="Đóng">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M1.47 1.47a.75.75 0 0 1 1.06 0L8 6.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L9.06 8l5.47 5.47a.75.75 0 1 1-1.06 1.06L8 9.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L6.94 8 1.47 2.53a.75.75 0 0 1 0-1.06z"/></svg>
        </button> */}
      </div>

      {/* 2. Ảnh bìa bài hát to đùng */}
      <div className="right-sidebar-cover">
        <img 
          src="https://i.scdn.co/image/ab67616d0000b273b53f6b0f19c8f38fcb52994f" 
          alt="Song Cover" 
        />
      </div>

      {/* 3. Tên bài hát và Nút Thêm vào Thư viện */}
      <div className="right-sidebar-info">
        <div className="song-details">
          <h2 className="song-title">Xuất Phát Điểm</h2>
          <p className="song-artist">Obito, Shiki</p>
        </div>
        <button className="icon-btn" title="Lưu vào Thư viện">
          <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/><path d="M11.75 8a.75.75 0 0 1-.75.75H8.75V11a.75.75 0 0 1-1.5 0V8.75H4.25a.75.75 0 0 1 0-1.5h3V4.25a.75.75 0 0 1 1.5 0v3h2.25a.75.75 0 0 1 .75.75z"/></svg>
        </button>
      </div>

      {/* 4. Khung Giới thiệu Nghệ sĩ (About the artist) */}
      <div className="artist-card">
        <p className="artist-card-title">Về nghệ sĩ</p>
        <div className="artist-card-content">
          <img 
            src="https://i.scdn.co/image/ab6761610000e5ebb53f6b0f19c8f38fcb52994f" 
            alt="Artist" 
            className="artist-avatar"
          />
          <div className="artist-details">
            <h4 className="artist-name">Obito</h4>
            <p className="artist-listeners">449,123 người nghe hàng tháng</p>
          </div>
        </div>
      </div>

    </aside>
  );
}