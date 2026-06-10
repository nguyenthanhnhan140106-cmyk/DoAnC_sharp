import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MusicProvider } from './Contexts/MusicContext';
import { AuthProvider } from './Contexts/AuthContext';
import HomePage from './Pages/HomePage';
import AlbumPage from './Pages/AlbumPage';
import CategoryPage from './Pages/CategoryPage';
import SearchPage from './Pages/SearchPage';
import LoginPage from './Pages/LoginPage';
import SignupPage from './Pages/SignupPage';
import ProfilePage from './Pages/ProfilePage';
import PlaylistPage from './Pages/PlaylistPage';
import NotificationPage from './Pages/NotificationPage';
import AddToPlaylistModal from './Components/AddToPlaylistModal';
import Toast from './Components/Toast';

function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/album/:id" element={<AlbumPage />} />
            <Route path="/playlist/:id" element={<PlaylistPage />} />
            <Route path="/category/:catId" element={<CategoryPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationPage />} />
          </Routes>

          <AddToPlaylistModal />
          <Toast />
        </BrowserRouter>
      </MusicProvider>
    </AuthProvider>
  );
}

export default App;
