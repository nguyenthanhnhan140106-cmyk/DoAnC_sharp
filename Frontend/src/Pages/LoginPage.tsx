import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../Services/api';
import { useAuth } from '../Contexts/AuthContext';
import '../Components/Styles/AuthPage.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', {
        username,
        password,
      });

      const token = res.data?.token || res.data?.Token;
      if (!token) throw new Error('Backend không trả về token.');

      login(token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.Message || err.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="auth-logo" onClick={() => navigate('/')}>
          <h2>TuneVault</h2>
        </div>
      </div>

      <div className="auth-container">
        <h1>Welcome back</h1>

        <form onSubmit={handleLogin} className="auth-form">
          {error && <p style={{ color: '#ff6b6b', marginBottom: '12px' }}>{error}</p>}

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Continue'}
          </button>
        </form>

        <p className="auth-redirect" style={{ marginTop: '32px' }}>
          Don't have an account? <span onClick={() => navigate('/signup')}>Sign up</span>
        </p>
      </div>

      <div className="auth-footer">
        <p>This site is protected by reCAPTCHA and the Google <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a> apply.</p>
      </div>
    </div>
  );
}
