import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MusicProvider } from './Contexts/MusicContext';
import HomePage from './Pages/HomePage';
import AlbumPage from './Pages/AlbumPage';
import CategoryPage from './Pages/CategoryPage';

function App() {
  return (
    <MusicProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/album/:id" element={<AlbumPage />} />
          <Route path="/category/:catId" element={<CategoryPage />} />
        </Routes>
      </BrowserRouter>
    </MusicProvider>
  );
}

export default App;