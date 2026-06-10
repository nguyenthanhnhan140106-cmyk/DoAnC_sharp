import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/header';
import PlayerBar from '../Components/PlayerBar';
import RightSidebar from '../Components/RightSidebar';
import Footer from '../Components/Footer';
import { useMusic } from '../Contexts/MusicContext';
import { useAuth } from '../Contexts/AuthContext';
import { songService } from '../Services/songService';
import AuthBanner from '../Components/AuthBanner';
import '../Components/Styles/HomePage.css';

interface Song {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl?: string;
  category?: string;
}

const getCover = (song: Song) =>
  song.coverUrl || `https://loremflickr.com/160/160/music?lock=${song.id}`;

const CategoryPage = () => {
  const { catId } = useParams();
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const { playSong, currentSong, isPlaying } = useMusic();
  const { isLoggedIn } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  useEffect(() => {
    songService.getAllSongs()
      .then((list: any) => {
        let songList: Song[] = list || [];
        if (!Array.isArray(songList)) return;

        // Lọc danh sách theo catId
        if (catId === 'friday') {
          songList = songList.filter(s => s.category?.toLowerCase() === 'friday');
        } else if (catId === 'vsound') {
          songList = songList.filter(s => s.category?.toLowerCase() === 'vsound');
        } else if (catId === 'rap') {
          songList = songList.filter(s => s.category?.toLowerCase() === 'rap');
        }
        // Nếu catId là 'all' thì hiển thị toàn bộ

        setSongs(songList);
      })
      .catch((err) => console.error('❌ Lỗi:', err));
  }, [catId]);

  let title = "Tất cả bài hát";
  if (catId === 'friday') title = "It's New Music Friday!";
  if (catId === 'vsound') title = "V-Sound";
  if (catId === 'rap') title = "Thế Giới Rap";

  const handleForcePlay = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    playSong(song);
    setTimeout(() => {
      const allAudios = document.getElementsByTagName("audio");
      if (allAudios.length > 0 && song.audioUrl) {
        for (let i = 0; i < allAudios.length; i++) {
          const player = allAudios[i];
          player.src = song.audioUrl;
          player.load();
          player.play().catch((err) => console.log("Lỗi:", err));
        }
      }
    }, 100);
  };

  return (
    <div className={`spotify-layout ${isSidebarCollapsed ? 'sidebar-hidden' : ''} ${isRightCollapsed || !isLoggedIn ? 'right-hidden' : ''}`}>
      <Header />
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <div className="main-view">
        <div className="content-wrapper" style={{ padding: '24px' }}>
          {/* Nút quay lại */}
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer', fontSize: 24, marginBottom: 16 }}>
            ←
          </button>

          <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>{title}</h1>

          <div className="songs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '24px' }}>
            {songs.map((song, index) => {
              const isActive = currentSong?.id === song.id;
              return (
                <div 
                  key={`${song.id}-${index}`} 
                  className="song-card-item" 
                  onClick={(e) => handleForcePlay(e, song)} 
                  style={{ cursor: "pointer", minWidth: 'auto', maxWidth: 'none' }}
                >
                  <div className="song-card-img-wrapper">
                    <img 
                      src={getCover(song)} 
                      alt={song.title} 
                      className="song-card-img" 
                      onError={(e) => {
                        e.currentTarget.src = `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop`;
                      }}
                    />
                    <button
                      className={`card-play-btn ${isActive && isPlaying ? "playing" : ""}`}
                      aria-label={`Phát ${song.title}`}
                      onClick={(e) => handleForcePlay(e, song)}
                    />
                  </div>
                  <h4 className="song-card-title" style={{ color: isActive ? "#1db954" : "#fff" }}>{song.title}</h4>
                  <p className="song-card-artist">{song.artist}</p>
                </div>
              );
            })}
          </div>
          <Footer />
        </div>
      </div>

      {isLoggedIn && <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />}
      {isLoggedIn ? <PlayerBar /> : <AuthBanner />}
    </div>
  );
};

export default CategoryPage;
