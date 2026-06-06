import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import searchIcon from '../assets/search.svg';
import API from '../Services/api';

interface Song {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch { return []; }
  });
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const saveSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 8);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const deleteSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Gợi ý khi gõ (debounce 300ms)
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      API.get('/songs')
        .then((res: any) => {
          const all: Song[] = Array.isArray(res.data) ? res.data : [];
          const q = query.toLowerCase();
          const filtered = all
            .filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
            .slice(0, 6);
          setSuggestions(filtered);
          setShowDropdown(filtered.length > 0);
        })
        .catch(() => { });
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (term?: string) => {
    const searchTerm = (term ?? query).trim();
    if (!searchTerm) return;
    saveSearch(searchTerm);
    setShowDropdown(false);
    setQuery(searchTerm);
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleFocus = () => {
    setShowDropdown(true);
  };

  return (
    <header className="spotify-header">
      <div className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <h2 style={{ margin: 0, color: '#FF5500', fontSize: '20px', fontWeight: '900' }}>TuneVault</h2>
      </div>

      <div className="header-search-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Nút Home */}
        <button className="home-button" title="Trang chủ" onClick={() => navigate('/')}>
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
          {showDropdown && (
            <div className="search-dropdown">
              {!query.trim() ? (
                // — Hiện lịch sử tìm kiếm —
                recentSearches.length > 0 ? (
                  <>
                    <div className="search-history-header">
                      <span>Tìm kiếm gần đây</span>
                      <button className="search-history-clear" onClick={clearAll}>Xóa tất cả</button>
                    </div>
                    {recentSearches.map((term, i) => (
                      <div key={i} className="search-suggestion-item" onClick={() => handleSearch(term)}>
                        {/* Icon đồng hồ */}
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="#b3b3b3" style={{ flexShrink: 0 }}>
                          <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6z" />
                        </svg>
                        <div className="suggestion-info">
                          <span className="suggestion-title">{term}</span>
                        </div>
                        <button
                          className="search-history-delete"
                          onClick={(e) => deleteSearch(term, e)}
                          title="Xóa"
                        >×</button>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="search-history-empty">Chưa có lịch sử tìm kiếm nào</div>
                )
              ) : (
                // — Hiện gợi ý khi gõ —
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
              )}
            </div>
          )}
        </div>
      </div>

      {/* Phần profile giữ nguyên */}
      <div className="header-profile-container">
        <button className="notification-btn" title="Thông báo">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
          <div className="user-avatar" onClick={() => setIsMenuOpen(!isMenuOpen)} title="My Account">N</div>
          {isMenuOpen && (
            <div className="dropdown-menu">
              <ul className="dropdown-list">
                <li>Profile</li>
                <li>Settings</li>
                <hr className="dropdown-divider" />
                <li className="logout-text">Logout</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
