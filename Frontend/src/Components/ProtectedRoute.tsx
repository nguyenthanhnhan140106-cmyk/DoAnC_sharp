import { Navigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute: Bọc các route cần đăng nhập.
 * Nếu chưa đăng nhập → tự động chuyển hướng về /login.
 * Nếu đã đăng nhập → hiển thị children bình thường.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
