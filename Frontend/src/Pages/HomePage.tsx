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
import '../Components/Styles/HomePage.css';
import ErrorBoundary from '../Components/ErrorBoundary';
import TuneBot from '../Components/TuneBot/TuneBot';

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

  // Trạng thái thu gọn Left Sidebar (Cũ)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 🟢 1. KHAI BÁO THÊM: Trạng thái thu gọn Right Sidebar (Mới)
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  useEffect(() => {
    API.get('/songs')
      .then((res: any) => {
        const list = res.data;
        if (Array.isArray(list)) setSongs(list);
      })
      .catch((err) => console.error('❌ Lỗi:', err));
  }, []);

  return (
    // 🟢 2. CẬP NHẬT: Ép thêm class 'right-hidden' động dựa vào state mới
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

      {/* 🟢 3. CẬP NHẬT: Truyền State và hàm Thay đổi xuống cho RightSidebar */}
      <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />

      {/* TuneBot wrapped in error boundary */}
      <ErrorBoundary>
        <TuneBot />
      </ErrorBoundary>

      <PlayerBar />
    </div>
  );
}