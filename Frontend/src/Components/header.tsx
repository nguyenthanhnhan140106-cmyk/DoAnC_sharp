import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import searchIcon from '../assets/search.svg';
import API from '../Services/api';

export default function Header() {
  const { isLoggedIn, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Xử lý đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="spotify-header">
      {/* 1. Logo */}
      <div className="header-logo" onClick={() => navigate('/')}>
        <h2>TuneVault</h2>
      </div>

      {/* 2. Search Container (Giữ nguyên logic của bạn) */}
      <div className="header-search-container">
        {/* ... (Search input code của bạn) ... */}
      </div>

      {/* 3. Profile hoặc Auth Buttons (KHU VỰC CẦN CHỈNH) */}
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
          /* Cấu trúc chuẩn để không bị lệch */
          <div className="auth-buttons">
            <Link to="/login" className="login-link">Đăng nhập</Link>
            <Link to="/signup" className="signup-link">Đăng ký</Link>
          </div>
        )}
      </div>
    </header>
  );
}
