import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import API from '../Services/api';

export default function Header() {
  const { isLoggedIn, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  // Giả sử bạn có các state này cho logic search
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logic Search (Debounce)
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      const q = encodeURIComponent(query.trim());
      API.get(`/songs/search?q=${q}`)
        .then((res: any) => {
          const filtered = Array.isArray(res.data) ? res.data.slice(0, 6) : [];
          setSuggestions(filtered);
          setShowDropdown(filtered.length > 0);
        })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleHomeClick = () => {
    navigate('/');
    window.dispatchEvent(new CustomEvent('RESET_HOME_TAB'));
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
        {/* Thêm input search của bạn ở đây */}
      </div>

      {/* 3. Profile hoặc Auth Buttons */}
      <div className="header-profile-container">
        {isLoggedIn ? (
          <>
            <button className="notification-btn">...</button>
            <div className="profile-dropdown-wrapper" ref={dropdownRef}>
              <div className="user-avatar" onClick={() => setIsMenuOpen(!isMenuOpen)}>N</div>
              {isMenuOpen && (
                <div className="dropdown-menu">
                  <ul className="dropdown-list">
                    <li onClick={() => setIsMenuOpen(false)}>Profile</li>
                    <li onClick={() => setIsMenuOpen(false)}>Settings</li>
                    <hr className="dropdown-divider" />
                    <li onClick={logout}>Logout</li>
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="login-link">Đăng nhập</Link>
            <Link to="/signup" className="signup-link">Đăng ký</Link>
          </div>
        )}
      </div>
    </header>
  );
}
