import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Components/Styles/Auth.css';

export default function SignupPage() {
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Giả lập gọi API thành công -> chuyển trạng thái
    setIsOtpSent(true); 
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">
          {isOtpSent ? "Xác thực tài khoản" : "Đăng ký TuneVault"}
        </h1>
        
        {!isOtpSent ? (
          <form onSubmit={handleRegister} className="auth-form">
            <input type="email" placeholder="Email của bạn" className="auth-input" required />
            <input type="password" placeholder="Mật khẩu" className="auth-input" required />
            <button type="submit" className="auth-submit-btn">Tiếp tục</button>
            <p className="auth-link">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <p style={{ color: '#b3b3b3', fontSize: '14px', marginBottom: '16px' }}>
              Chúng mình đã gửi mã xác thực vào email của bạn.
            </p>
            <input 
              type="text" 
              placeholder="Nhập 6 chữ số OTP" 
              className="auth-input" 
              maxLength={6} 
              style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px' }}
            />
            <button className="auth-submit-btn">Xác nhận đăng ký</button>
            <button 
              type="button" 
              className="auth-link" 
              style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '10px' }}
              onClick={() => setIsOtpSent(false)}
            >
              Gửi lại mã?
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
