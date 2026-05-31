import HomePage from './Pages/HomePage';
import { MusicProvider } from '../src/Contexts/MusicContext';
function App() {
  return (
    <MusicProvider>
      {/* Gọi trang chủ Spotify vào chạy chính */}
      <HomePage />
    </MusicProvider>
  );
}

export default App;