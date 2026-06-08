import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import '../Components/Styles/Auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); // Giả sử bạn có hàm login trong AuthContext
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Gọi API đăng nhập ở đây
      await login(email, password);
      navigate('/'); // Quay về trang chủ sau khi đăng nhập thành công
    } catch (error) {
      console.error("Đăng nhập thất bại", error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">Đăng nhập vào TuneVault</h1>
        
        <form onSubmit={handleLogin} className="auth-form">
          <input 
            type="email" 
            placeholder="Email hoặc tên người dùng" 
            className="auth-input" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            className="auth-input" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          
          <button type="submit" className="auth-submit-btn">Đăng nhập</button>
        </form>

        <p className="auth-link">
          Chưa có tài khoản? <Link to="/signup">Đăng ký tại đây</Link>
        </p>
      </div>
    </div>
  );
}
