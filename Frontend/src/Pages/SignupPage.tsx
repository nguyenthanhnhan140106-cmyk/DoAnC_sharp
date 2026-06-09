import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../Services/api'; // Sử dụng API service đã cấu hình interceptor

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Gửi request tới backend đã bảo mật
      await API.post('/auth/register', {
        username,
        email,
        password
      });

      alert("Đăng ký thành công! Hãy đăng nhập.");
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng ký thất bại, thử lại nhé!");
    }
  };

  return (
    <div className="auth-page">
      {/* ... giữ nguyên phần header ... */}
      
      <div className="auth-container">
        <h1>Sign up to start listening</h1>
        <form onSubmit={handleSignup} className="auth-form">
          {error && <p style={{ color: 'red' }}>{error}</p>}
          
          <div className="form-group">
            <label>Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="auth-submit-btn">Sign Up</button>
        </form>
        {/* ... giữ nguyên phần footer ... */}
      </div>
    </div>
  );
}
