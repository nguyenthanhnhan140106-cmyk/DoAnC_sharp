import { useEffect, useState } from 'react';
import API from '../Services/api';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/header';
import PlayerBar from '../Components/PlayerBar';
import MainContent from '../Components/MainContent';
import RightSidebar from '../Components/RightSidebar';
import '../Components/Styles/HomePage.css';

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

  useEffect(() => {
    API.get('/songs')
      .then((res: any) => {
        const list = res.data;
        if (Array.isArray(list)) setSongs(list);
      })
      .catch((err) => console.error('❌ Lỗi:', err));
  }, []);

  return (
    <div className="spotify-layout">
      <Header />
      <Sidebar />
      <div className="main-view">
        <div className="content-wrapper">
          <MainContent songs={songs} />
        </div>
      </div>
      <RightSidebar />
      <PlayerBar />
    </div>
  );
}