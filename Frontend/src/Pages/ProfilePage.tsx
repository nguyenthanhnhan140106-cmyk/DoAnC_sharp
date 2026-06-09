import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../Services/api';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/header';
import PlayerBar from '../Components/PlayerBar';
import RightSidebar from '../Components/RightSidebar';
import Footer from '../Components/Footer';
import AuthBanner from '../Components/AuthBanner';
import { useAuth } from '../Contexts/AuthContext';
import { useMusic } from '../Contexts/MusicContext';
import { songService } from '../Services/songService';
import '../Components/Styles/ProfilePage.css';
import '../Components/Styles/HomePage.css';

interface Song {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl?: string;
  category?: string;
}

export default function ProfilePage() {
  const { isLoggedIn } = useAuth();
  const { playSong, currentSong, isPlaying, setQueue } = useMusic();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  useEffect(() => {
    // Lấy đại 4 bài hát làm top tracks (mock data for now)
    songService.getAllSongs()
      .then((list: any) => {
        if (Array.isArray(list)) setSongs(list.slice(0, 4));
      })
      .catch((err: any) => console.error('❌ Lỗi:', err));
  }, []);

  const handleForcePlay = (e: React.MouseEvent, song: Song, index: number) => {
    e.stopPropagation();
    setQueue(songs, index);
    playSong(song);
    setTimeout(() => {
      const allAudios = document.getElementsByTagName("audio");
      if (allAudios.length > 0 && song.audioUrl) {
        for (let i = 0; i < allAudios.length; i++) {
          const player = allAudios[i];
          player.src = song.audioUrl;
          player.load();
          player.play().catch(err => console.log(err));
        }
      }
    }, 100);
  };

  return (
    <div className={`spotify-layout ${isSidebarCollapsed ? 'sidebar-hidden' : ''} ${!isLoggedIn || isRightCollapsed ? 'right-hidden' : ''}`}>
      <Header />
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <div className="main-view">
        <div className="content-wrapper" style={{ padding: 0 }}>
          
          <div className="profile-header-container">
            <div className="profile-header-bg"></div>
            <div className="profile-header-content">
              <div className="profile-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="profile-info">
                <span className="profile-badge">Profile</span>
                <h1 className="profile-name">Văn Nam</h1>
              </div>
            </div>
            {/* The edit details button is positioned relatively within header content */}
            <div className="profile-edit-btn-wrapper">
              <button className="profile-edit-btn">Edit details</button>
            </div>
          </div>

          <div className="profile-body">
            <div className="profile-actions">
              <button className="profile-action-btn" title="Settings">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                  <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
                </svg>
              </button>
              <button className="profile-action-btn" title="More options">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                  <circle cx="5" cy="12" r="2"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                  <circle cx="19" cy="12" r="2"></circle>
                </svg>
              </button>
            </div>

            <div className="profile-section">
              <div className="profile-section-header">
                <div>
                  <h2 className="profile-section-title">Top tracks this month</h2>
                  <p className="profile-section-subtitle">Only visible to you</p>
                </div>
                <button className="profile-show-all">Show all</button>
              </div>
              
              <div className="profile-tracks-list">
                {songs.map((song, index) => {
                  const isActive = currentSong?.id === song.id;
                  return (
                    <div 
                      key={song.id} 
                      className="profile-track-item"
                      onClick={(e) => handleForcePlay(e, song, index)}
                    >
                      <div className="track-col track-index">
                        {isActive && isPlaying ? (
                          <div className="equalizer" style={{ width: '14px', height: '14px' }}>
                            <span style={{ backgroundColor: '#1db954' }}></span>
                            <span style={{ backgroundColor: '#1db954' }}></span>
                            <span style={{ backgroundColor: '#1db954' }}></span>
                          </div>
                        ) : (
                          <span className="track-number">{index + 1}</span>
                        )}
                        <button className="track-play-btn">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </div>

                      <div className="track-col track-info">
                        <img 
                          src={song.coverUrl || `https://picsum.photos/seed/${song.id}/40/40`} 
                          alt={song.title} 
                          className="track-cover" 
                        />
                        <div className="track-text">
                          <div className="track-title" style={{ color: isActive ? '#1db954' : '#fff' }}>{song.title}</div>
                          <div className="track-artist">{song.artist}</div>
                        </div>
                      </div>

                      <div className="track-col track-album">
                        Từng Ngày Như Mãi Mãi
                      </div>

                      <div className="track-col track-duration">
                        3:12
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Footer />
          </div>
        </div>
      </div>

      {isLoggedIn && <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />}
      {isLoggedIn ? <PlayerBar /> : <AuthBanner />}
    </div>
  );
}
