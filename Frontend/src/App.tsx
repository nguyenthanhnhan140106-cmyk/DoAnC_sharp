import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MusicProvider } from './Contexts/MusicContext';
import { AuthProvider } from './Contexts/AuthContext';
import { NotificationProvider } from './Contexts/NotificationContext';
import ProtectedRoute from './Components/ProtectedRoute';
import HomePage from './Pages/HomePage';
import AlbumPage from './Pages/AlbumPage';
import CategoryPage from './Pages/CategoryPage';
import SearchPage from './Pages/SearchPage';
import LoginPage from './Pages/LoginPage';
import SignupPage from './Pages/SignupPage';
import ForgotPasswordPage from './Pages/ForgotPasswordPage';
import ProfilePage from './Pages/ProfilePage';
import PlaylistPage from './Pages/PlaylistPage';
import ListeningHistoryPage from './Pages/ListeningHistoryPage';
import UploadPage from './Pages/UploadPage';
import NotificationsPage from './Pages/NotificationsPage';
import ArtistPage from './Pages/ArtistPage';
import UserProfilePage from './Pages/UserProfilePage';
import InboxPage from './Pages/InboxPage';
import VideoPage from './Pages/VideoPage';
import AddToPlaylistModal from './Components/AddToPlaylistModal';
import Toast from './Components/Toast';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MusicProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes - không cần đăng nhập */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected routes - cần đăng nhập */}
              <Route path="/" element={<HomePage />} />
              <Route path="/album/:id" element={<AlbumPage />} />
              <Route path="/playlist/:id" element={<PlaylistPage />} />
              <Route path="/category/:catId" element={<CategoryPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/artist/:id" element={<ArtistPage />} />
              <Route path="/user/:id" element={<UserProfilePage />} />
              <Route path="/video/:id" element={<VideoPage />} />

              {/* Các trang bắt buộc đăng nhập */}
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><ListeningHistoryPage /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
            </Routes>
            <AddToPlaylistModal />
            <Toast />
          </BrowserRouter>
        </MusicProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
