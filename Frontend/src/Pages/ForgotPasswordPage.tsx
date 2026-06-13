import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../Services/api';
import "../Components/Styles/Auth.css";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) {
      setError('Vui lòng nhập email.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.post('/auth/forgot-password', { email });
      setStep(2);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || "Không thể gửi mã OTP, vui lòng kiểm tra lại email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      setError('Vui lòng điền đủ thông tin.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.post('/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      navigate('/login');
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || "Mã OTP không đúng hoặc có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1 className="auth-title">Khôi phục mật khẩu</h1>
        
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleResetPassword}>
          {step === 1 ? (
            <div className="form-group">
              <label>Email đã đăng ký</label>
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
                {loading ? "Đang gửi..." : "Gửi mã khôi phục"}
              </button>
              
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <a href="/login" style={{ color: '#b3b3b3', textDecoration: 'none', fontSize: '14px' }}>
                  Quay lại đăng nhập
                </a>
              </div>
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
                <label>Mật khẩu mới</label>
                <input 
                  className="auth-input" 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="auth-submit-btn" 
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </button>
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <a href="/login" style={{ color: '#b3b3b3', textDecoration: 'none', fontSize: '14px' }}>
                  Hủy và quay lại
                </a>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
