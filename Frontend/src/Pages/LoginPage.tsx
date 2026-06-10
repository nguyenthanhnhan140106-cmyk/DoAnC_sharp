import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import '../Components/Styles/AuthPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate('/');
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
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
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

          <button type="submit" className="auth-submit-btn">Continue</button>
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
