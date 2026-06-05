import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MusicProvider } from './Contexts/MusicContext';
import HomePage from './Pages/HomePage';
import AlbumPage from './Pages/AlbumPage';

function App() {
  return (
    <MusicProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/album/:id" element={<AlbumPage />} />
        </Routes>
      </BrowserRouter>
    </MusicProvider>
  );
}

export default App;