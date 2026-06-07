import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MusicProvider } from './Contexts/MusicContext';
import { AuthProvider } from './Contexts/AuthContext'; // Import AuthProvider
import HomePage from './Pages/HomePage';
import AlbumPage from './Pages/AlbumPage';
import CategoryPage from './Pages/CategoryPage';
import SearchPage from './Pages/SearchPage';
import LoginPage from './Pages/LoginPage';   // Import trang Login
import SignupPage from './Pages/SignupPage'; // Import trang Signup

function App() {
  return (
    <AuthProvider> {/* Bọc AuthProvider ở ngoài cùng hoặc bao quanh Routes */}
      <MusicProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/album/:id" element={<AlbumPage />} />
            <Route path="/category/:catId" element={<CategoryPage />} />
            <Route path="/search" element={<SearchPage />} />
            
            {/* Thêm Route cho Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </BrowserRouter>
      </MusicProvider>
    </AuthProvider>
  );
}

export default App;
