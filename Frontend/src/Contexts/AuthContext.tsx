import React, { createContext, useContext, useState } from 'react';
import '../Components/Styles/AuthModal.css';

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  openAuthModal: (data?: { title: string; coverUrl: string }) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseJwt(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function getUserFromToken(token: string): User | null {
  const payload = parseJwt(token);
  if (!payload) return null;

  const rawId =
    payload.id ??
    payload.nameid ??
    payload.sub ??
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

  const username =
    payload.unique_name ??
    payload.name ??
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ??
    'user';

  const id = Number(rawId);
  if (!Number.isFinite(id) || id <= 0) return null;

  return { id, username: String(username) };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('token');
    return token ? getUserFromToken(token) : null;
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; coverUrl: string } | null>(null);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('isLoggedIn', 'true');

    const parsedUser = getUserFromToken(token);
    setUser(parsedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    setUser(null);
  };

  const openAuthModal = (data?: { title: string; coverUrl: string }) => {
    if (data) setModalData(data);
    setModalOpen(true);
  };

  const closeAuthModal = () => {
    setModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, login, logout, openAuthModal, closeAuthModal }}>
      {children}
      {modalOpen && <AuthModal data={modalData} onClose={closeAuthModal} />}
    </AuthContext.Provider>
  );
}

function AuthModal({ data, onClose }: { data: { title: string; coverUrl: string } | null; onClose: () => void }) {
  const handleSignup = () => {
    onClose();
    window.location.href = '/signup';
  };

  const handleLogin = () => {
    onClose();
    window.location.href = '/login';
  };

  const coverUrl = data?.coverUrl || 'https://picsum.photos/400/400';

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-bg" style={{ backgroundImage: `url(${coverUrl})` }}></div>
        <div className="auth-modal-inner">
          <img src={coverUrl} alt="Cover" className="auth-modal-cover" />
          <div className="auth-modal-info">
            <h2 className="auth-modal-title">Start listening with a<br />free TuneVault account</h2>
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
