import { useEffect, useState } from 'react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/header';
import PlayerBar from '../Components/PlayerBar';
import MainContent from '../Components/MainContent';
import RightSidebar from '../Components/RightSidebar';
import Footer from '../Components/Footer';
import LyricsView from '../Components/LyricsView';
import { useMusic } from '../Contexts/MusicContext';
import { songService } from '../Services/songService';
import '../Components/Styles/HomePage.css';
import ErrorBoundary from '../Components/ErrorBoundary';
import TuneBot from '../Components/TuneBot/TuneBot';
import AuthBanner from '../Components/AuthBanner';
import { useAuth } from '../Contexts/AuthContext';

import type { Song } from '../types';
export default function HomePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const { isLyricsViewOpen } = useMusic();
  const { isLoggedIn } = useAuth();

  // Trạng thái thu gọn Left Sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Trạng thái thu gọn Right Sidebar
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  useEffect(() => {
    const fetchSongs = () => {
      songService.getAllSongs()
        .then((list: unknown) => {
          if (Array.isArray(list)) setSongs(list);
        })
        .catch((err: unknown) => console.error('❌ Lỗi:', err));
    };

    fetchSongs();
    
    window.addEventListener('songDeleted', fetchSongs);
    return () => window.removeEventListener('songDeleted', fetchSongs);
  }, []);

  return (
    <div className={`spotify-layout ${isSidebarCollapsed ? 'sidebar-hidden' : ''} ${isRightCollapsed ? 'right-hidden' : ''}`}>
      <Header />

      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <div className="main-view">
        {isLyricsViewOpen ? (
          <LyricsView />
        ) : (
          <div className="content-wrapper">
            <MainContent songs={songs} />
            <Footer />
          </div>
        )}
      </div>

      {/* Right Sidebar luôn hiện vì đã có ProtectedRoute đảm bảo đã login */}
      <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />

      {/* TuneBot wrapped in error boundary */}
      <ErrorBoundary>
        <TuneBot />
      </ErrorBoundary>

      {isLoggedIn ? <PlayerBar /> : <AuthBanner />}
    </div>
  );
}