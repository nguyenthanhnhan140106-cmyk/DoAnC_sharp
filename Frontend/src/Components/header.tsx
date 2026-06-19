import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import searchIcon from '../assets/search.svg';
import { songService } from '../Services/songService';
import { useNotification } from '../Contexts/NotificationContext';
import { useAuth } from '../Contexts/AuthContext';
import { useMusic } from '../Contexts/MusicContext';
import type { Song } from '../types';

export default function Header() {
  const { isLoggedIn, logout } = useAuth();
  const music = useMusic();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  // Giả sử bạn có các state này cho logic search
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { unreadCount } = useNotification();

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Bỏ useEffect getMyNotifications ở đây vì đã chuyển vào NotificationContext

  // Logic Search (Debounce)
  useEffect(() => {
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      const q = query.trim();
      songService.searchSongs(q)
        .then((list: unknown) => {
          const filtered: Song[] = Array.isArray(list) ? list.slice(0, 6) : [];
          setSuggestions(filtered);
          setShowDropdown(filtered.length > 0);
        })
        .catch(() => { });
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleHomeClick = () => {
    if (location.pathname === '/') {
      window.location.reload();
    } else {
      navigate('/');
      window.dispatchEvent(new CustomEvent('RESET_HOME_TAB'));
    }
  };

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery !== undefined ? searchQuery : query;
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`);
      setShowDropdown(false);
    }
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    if (music && music.isPlaying && music.togglePlay) {
      music.togglePlay();
    }
    logout();
    window.location.href = '/';
  };

  return (
    <header className="spotify-header">
      {/* 1. Logo */}
      <div className="header-logo" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
        <h2 style={{ margin: 0, color: '#FF5500', fontSize: '20px', fontWeight: '900' }}>TuneVault</h2>
      </div>

      {/* 2. Search & Home */}
      <div className="header-search-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button className="home-button" title="Trang chủ" onClick={handleHomeClick}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z"></path>
          </svg>
        </button>

        {/* Search */}
        <div className="search-wrapper" ref={searchRef} style={{ position: 'relative' }}>
          <span className="search-icon">
            <img src={searchIcon} alt="Search" style={{ width: '18px', height: '18px' }} />
          </span>
          <input
            type="text"
            placeholder="Bạn muốn phát gì?"
            className="search-input"
            value={query}
            onChange={e => { setQuery(e.target.value); }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            onFocus={handleFocus}
          />
          {/* Nút tìm kiếm nâng cao */}
          <button className="search-advanced-btn" onClick={() => handleSearch()} title="Tìm kiếm">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5zM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5z" />
            </svg>
          </button>

          {/* Dropdown: Lịch sử khi rỗng, Gợi ý khi gõ */}
          {showDropdown && query.trim() && (
            <div className="search-dropdown">
              {/* — Hiện gợi ý khi gõ — */}
              <>
                {suggestions.map(song => (
                  <div
                    key={song.id}
                    className="search-suggestion-item"
                    onClick={() => {
                      handleSearch(song.title);
                    }}
                  >
                    <img
                      src={song.coverUrl || `https://loremflickr.com/40/40/music?lock=${song.id}`}
                      alt={song.title}
                      className="suggestion-cover"
                    />
                    <div className="suggestion-info">
                      <span className="suggestion-title">{song.title}</span>
                      <span className="suggestion-artist">{song.artist}</span>
                    </div>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#b3b3b3">
                      <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
                    </svg>
                  </div>
                ))}
                <div className="search-suggestion-footer" onClick={() => handleSearch()}>
                  Tìm tất cả kết quả cho "<strong>{query}</strong>"
                </div>
              </>
            </div>
          )}
        </div>
      </div>

      {/* Phần profile hoặc Auth buttons */}
      <div className="header-profile-container">
        {isLoggedIn ? (
          <>
            <button className="header-circle-btn" title="Tải bài hát lên" onClick={() => navigate('/upload')}>
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 14V3m0 0l-4 4m4-4l4 4" />
                <path d="M6 16.5a6 6 0 0 0 12 0" />
              </svg>
            </button>
            <button 
              className={`notification-btn ${location.pathname === '/notifications' ? 'active' : ''}`}
              title="Thông báo"
              onClick={() => {
                if (location.pathname === '/notifications') {
                  navigate(-1); // Đang ở trang thông báo → quay lại
                } else {
                  navigate('/notifications'); // Đi vào trang thông báo
                }
              }}
              style={{ position: 'relative' }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {unreadCount > 0 && (
                <span className="notification-badge" style={{
                  position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#e91429', color: 'white',
                  borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="profile-dropdown-wrapper" ref={dropdownRef}>
              <div className="user-avatar" onClick={() => setIsMenuOpen(!isMenuOpen)} title="My Account">N</div>
              {isMenuOpen && (
                <div className="dropdown-menu">
                  <ul className="dropdown-list">
                    <li onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}>Profile</li>
                    <hr className="dropdown-divider" />
                    <li className="logout-text" onClick={handleLogout}>Logout</li>
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="auth-buttons">
            <button className="signup-btn" onClick={() => navigate('/signup')}>Sign up</button>
            <button className="login-btn" onClick={() => navigate('/login')}>Log in</button>
          </div>
        )}
      </div>
    </header>
  );
}
