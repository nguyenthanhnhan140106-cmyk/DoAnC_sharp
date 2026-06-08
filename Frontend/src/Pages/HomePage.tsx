import { useEffect, useState } from 'react';
import API from '../Services/api';
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
import { useAuth } from '../Contexts/AuthContext';
import AuthBanner from '../Components/AuthBanner';

interface Song {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl?: string;
  category?: string;
}

export default function HomePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const { isLyricsViewOpen } = useMusic();
  const { isLoggedIn } = useAuth();

  // Trạng thái thu gọn Left Sidebar (Cũ)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 🟢 1. KHAI BÁO THÊM: Trạng thái thu gọn Right Sidebar (Mới)
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  useEffect(() => {
    songService.getAllSongs()
      .then((list: any) => {
        if (Array.isArray(list)) setSongs(list);
      })
      .catch((err: any) => console.error('❌ Lỗi:', err));
  }, []);

  return (
    // 🟢 2. CẬP NHẬT: Ép thêm class 'right-hidden' động dựa vào state mới hoặc khi chưa login
    <div className={`spotify-layout ${isSidebarCollapsed ? 'sidebar-hidden' : ''} ${isRightCollapsed || !isLoggedIn ? 'right-hidden' : ''}`}>
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

      {/* 🟢 3. CẬP NHẬT: Truyền State và hàm Thay đổi xuống cho RightSidebar. Chỉ hiện nếu đã login */}
      {isLoggedIn && <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />}

      {/* TuneBot wrapped in error boundary */}
      <ErrorBoundary>
        <TuneBot />
      </ErrorBoundary>

      {isLoggedIn ? <PlayerBar /> : <AuthBanner />}
    </div>
  );
}