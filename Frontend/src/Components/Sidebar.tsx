export default function Sidebar() {
  return (
    <aside className="spotify-sidebar">
      
      <div className="sidebar-header">
        <button className="library-btn" title="Thu gọn Thư viện của bạn">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z"/>
          </svg>
          <span className="library-text">Thư viện của bạn</span>
        </button>
        <div className="header-actions">
          <button className="icon-btn" title="Tạo danh sách phát hoặc thư mục">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z"/></svg>
          </button>
          <button className="icon-btn" title="Hiện thêm">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M7.19 1A.749.749 0 0 1 8.47.47L16 7.99l-7.53 7.521a.75.75 0 0 1-1.234-.815.75.75 0 0 1 .173-.243l5.984-5.984H1.5a.75.75 0 0 1 0-1.5h11.89L7.405 1.226A.75.75 0 0 1 7.19 1z"/></svg>
          </button>
        </div>
      </div>

      <div className="sidebar-filters">
        <button className="filter-chip">Playlists</button>
      </div>

      <div className="sidebar-search-sort">
        <button className="search-btn" title="Tìm kiếm trong Thư viện">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M7 1.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5zM.25 7a6.75 6.75 0 1 1 12.096 4.12l3.184 3.185a.75.75 0 1 1-1.06 1.06L11.304 12.2A6.75 6.75 0 0 1 .25 7z"/></svg>
        </button>
        <button className="sort-btn">
          <span>Recents</span>
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M15 14.5H5V13h10v1.5zm0-5.75H5v-1.5h10v1.5zM15 3H5V1.5h10V3zM3 3H1V1.5h2V3zm0 5.75H1v-1.5h2v1.5zm0 5.75H1V13h2v1.5z"/></svg>
        </button>
      </div>

      <div className="sidebar-content">
        
        <div className="playlist-item">
          <div className="playlist-cover default-cover">
             <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 1 0 1.5 1.5v-1.5zm13-11.667H8v11.667h1.5a1.5 1.5 0 1 0 1.5 1.5v-13.167H19V5z"/></svg>
          </div>
          <div className="playlist-info">
            <p className="playlist-title">Danh sách phát của tôi #1</p>
            <p className="playlist-subtitle">Playlist • Nam</p>
          </div>
        </div>
      </div>

    </aside>
  );
}