import { useState, useEffect, useRef } from 'react';
import searchIcon from '../assets/search.svg'; 

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="spotify-header">
      <div className="header-logo">
        <h2 style={{ margin: 0, color: '#FF5500', fontSize: '20px', fontWeight: '900' }}>TuneVault</h2>
      </div>

      <div className="header-search-container">
        <div className="search-wrapper">
          <span className="search-icon">
            <img src={searchIcon} alt="Search" style={{ width: '18px', height: '18px' }} />
          </span>
          <input 
            type="text" 
            placeholder="Bạn muốn phát gì?" 
            className="search-input"
          />
        </div>
      </div>

      <div className="header-profile-container">
        
        <button className="notification-btn" title="Thông báo">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>

        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
          
          <div 
            className="user-avatar" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="My Account"
          >
            N
          </div>

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