import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../Services/api';
import "../Components/Styles/Auth.css";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      // Gửi email để lấy OTP
      await API.post('/auth/send-otp', { email });
      setStep(2);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || "Không thể gửi mã OTP, kiểm tra lại email.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Xác thực OTP
      await API.post('/auth/verify-otp', { Email: email, Otp: otp });
      
      // 2. Đăng ký tài khoản nếu OTP đúng
      await API.post('/auth/register', { Username: username, Email: email, Password: password });
      
      alert("Đăng ký thành công!");
      navigate('/login');
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string, errors?: { error: string }[] } } };
      if (errorResponse.response?.data?.errors && Array.isArray(errorResponse.response.data.errors)) {
        // Gộp tất cả các lỗi Validation từ FluentValidation lại
        const errorMsgs = errorResponse.response.data.errors.map(e => e.error).join(" | ");
        setError(`Lỗi: ${errorMsgs}`);
      } else {
        setError(errorResponse.response?.data?.message || "Mã OTP không đúng hoặc đăng ký thất bại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1 className="auth-title">
          {step === 1 ? "Sign up to start listening" : "Verify your Email"}
        </h1>
        
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSignup}>
          {step === 1 ? (
            <div className="form-group">
              <label>Email address</label>
              <input 
                className="auth-input" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <button 
                type="button" 
                className="auth-submit-btn" 
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? "Đang gửi..." : "Gửi mã xác thực"}
              </button>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Nhập mã OTP</label>
                <input 
                  className="auth-input" 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input 
                  className="auth-input" 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  className="auth-input" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="auth-submit-btn" 
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
