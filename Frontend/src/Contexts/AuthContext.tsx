import React, { createContext, useContext, useState, useEffect } from 'react';
import '../Components/Styles/AuthModal.css';

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
  openAuthModal: (data?: { title: string, coverUrl: string }) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  
  const [user, setUser] = useState<User | null>(() => {
    // Tạm thời mock user mặc định nếu đã login
    return localStorage.getItem('isLoggedIn') === 'true' ? { id: 1, username: 'testuser' } : null;
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string, coverUrl: string } | null>(null);

  const login = () => {
    setIsLoggedIn(true);
    setUser({ id: 1, username: 'testuser' });
    localStorage.setItem('isLoggedIn', 'true');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
  };

  const openAuthModal = (data?: { title: string, coverUrl: string }) => {
    if (data) setModalData(data);
    setModalOpen(true);
  };

  const closeAuthModal = () => {
    setModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, openAuthModal, closeAuthModal }}>
      {children}
      {modalOpen && (
        <AuthModal 
          data={modalData} 
          onClose={closeAuthModal} 
        />
      )}
    </AuthContext.Provider>
  );
}

function AuthModal({ data, onClose }: { data: { title: string, coverUrl: string } | null, onClose: () => void }) {
  // Navigate function won't work easily here outside Router if AuthProvider is outside Router.
  // Wait, in App.tsx AuthProvider is OUTSIDE BrowserRouter!
  // We can just use window.location.href or pass a simple handler.
  const handleSignup = () => {
    onClose();
    window.location.href = '/signup';
  };
  const handleLogin = () => {
    onClose();
    window.location.href = '/login';
  };

  const coverUrl = data?.coverUrl || "https://picsum.photos/400/400";

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
        <div className="auth-modal-bg" style={{ backgroundImage: `url(${coverUrl})` }}></div>
        <div className="auth-modal-inner">
          <img src={coverUrl} alt="Cover" className="auth-modal-cover" />
          <div className="auth-modal-info">
            <h2 className="auth-modal-title">Start listening with a<br/>free TuneVault account</h2>
            <button className="auth-modal-signup-btn" onClick={handleSignup}>Sign up free</button>
            <button className="auth-modal-download-btn">Download app</button>
            <div className="auth-modal-login-text">
              Already have an account? <span className="auth-modal-login-link" onClick={handleLogin}>Log in</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
