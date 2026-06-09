import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Styles/AuthBanner.css';

export default function AuthBanner() {
  const navigate = useNavigate();

  return (
    <div className="auth-banner" onClick={() => navigate('/signup')}>
      <div className="auth-banner-text">
        <p className="auth-banner-title">Preview of TuneVault</p>
        <p className="auth-banner-subtitle">Sign up to get unlimited songs and podcasts with occasional ads. No credit card needed.</p>
      </div>
      <button className="auth-banner-btn" onClick={(e) => {
        e.stopPropagation();
        navigate('/signup');
      }}>Sign up free</button>
    </div>
  );
}
