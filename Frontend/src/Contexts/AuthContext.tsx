import React, { createContext, useContext, useState, useEffect } from 'react';
import '../Components/Styles/AuthModal.css';

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, username: string) => void;
  logout: () => void;
  openAuthModal: (data?: { title: string, coverUrl: string }) => void;
  closeAuthModal: () => void;
}

// Hàm giải mã JWT để lấy payload (id, username...)
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Lấy user từ token đã lưu trong localStorage
function getUserFromToken(token: string | null): User | null {
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload) return null;
  // JWT claims: "id" và ClaimTypes.Name (http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name)
  const id = payload['id'] ? parseInt(payload['id']) : 0;
  const username = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] 
    || payload['unique_name'] 
    || payload['name'] 
    || '';
  if (!id) return null;
  return { id, username };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true' && !!localStorage.getItem('token');
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const savedToken = localStorage.getItem('token');
    return getUserFromToken(savedToken);
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string, coverUrl: string } | null>(null);

  const login = (newToken: string, username: string) => {
    // Giải mã token để lấy thông tin user thực tế
    const parsedUser = getUserFromToken(newToken);
    setToken(newToken);
    setIsLoggedIn(true);
    // Dùng user từ token nếu có, hoặc fallback về username được truyền vào
    setUser(parsedUser || { id: 0, username: username });
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
  };

  const openAuthModal = (data?: { title: string, coverUrl: string }) => {
    if (data) setModalData(data);
    setModalOpen(true);
  };

  const closeAuthModal = () => {
    setModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, login, logout, openAuthModal, closeAuthModal }}>
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
