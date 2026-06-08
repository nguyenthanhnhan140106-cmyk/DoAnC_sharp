import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import '../Components/Styles/AuthPage.css';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
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
        <h1>Sign up to start listening</h1>
        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label>Email address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              required 
            />
          </div>

          <button type="submit" className="auth-submit-btn">Next</button>
        </form>

        <p className="auth-redirect" style={{ marginTop: '32px' }}>
          Already have an account? <span onClick={() => navigate('/login')}>Log in</span>
        </p>
      </div>
      
      <div className="auth-footer">
        <p>This site is protected by reCAPTCHA and the Google <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a> apply.</p>
      </div>
    </div>
  );
}
