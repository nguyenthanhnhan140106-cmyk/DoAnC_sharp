import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Sidebar from '../Components/Sidebar';
import PlayerBar from '../Components/PlayerBar';
import RightSidebar from '../Components/RightSidebar';
import { useAuth } from '../Contexts/AuthContext';
import { useMusic } from '../Contexts/MusicContext';
import API from '../Services/api';
import '../Components/Styles/HomePage.css';

interface MediaShare {
  id: number;
  senderId: number;
  receiverId: number;
  songId: number | null;
  playlistId: number | null;
  sharedAt: string;
  senderName: string;
  mediaTitle: string;
  mediaCover: string | null;
  mediaType: string;
}

export default function InboxPage() {
  const { isLoggedIn } = useAuth();
  const { playSong } = useMusic();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(true);
  const [shares, setShares] = useState<MediaShare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      API.get('/notification/shared')
        .then(res => {
          setShares(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const handlePlayMedia = async (share: MediaShare) => {
    if (share.mediaType === 'song' && share.songId) {
      try {
        const res = await API.get(`/songs/${share.songId}`);
        playSong(res.data);
      } catch (err) {
        console.error("Failed to load song", err);
        alert("Không thể tải bài hát này.");
      }
    } else {
      alert('Playlist/Album playback in Inbox is under development.');
    }
  };

  return (
    <div className={`spotify-layout ${isSidebarCollapsed ? 'sidebar-hidden' : ''} ${!isLoggedIn || isRightCollapsed ? 'right-hidden' : ''}`}>
      <Header />
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <div className="main-view">
        <div className="content-wrapper" style={{ padding: '24px' }}>
          <h1 style={{ color: 'white', marginBottom: '24px' }}>Inbox (Shared with me)</h1>
          
          {loading ? (
            <p style={{ color: '#b3b3b3' }}>Loading...</p>
          ) : !isLoggedIn ? (
            <p style={{ color: '#b3b3b3' }}>Vui lòng đăng nhập để xem hộp thư.</p>
          ) : shares.length === 0 ? (
            <p style={{ color: '#b3b3b3' }}>Bạn chưa có bài hát nào được chia sẻ.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {shares.map(share => (
                <div 
                  key={share.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    background: '#181818', 
                    padding: '16px', 
                    borderRadius: '8px',
                    gap: '16px',
                    transition: 'background 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#282828'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#181818'}
                >
                  <img 
                    src={share.mediaCover || 'https://via.placeholder.com/64'} 
                    alt="cover" 
                    style={{ width: '64px', height: '64px', borderRadius: '4px', objectFit: 'cover' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '16px' }}>{share.mediaTitle}</h3>
                    <p style={{ color: '#b3b3b3', margin: 0, fontSize: '14px' }}>
                      Được chia sẻ bởi <strong style={{ color: '#fff' }}>{share.senderName}</strong> vào {new Date(share.sharedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <button 
                    onClick={() => handlePlayMedia(share)}
                    style={{ 
                      background: '#1db954', 
                      color: 'black', 
                      border: 'none', 
                      padding: '8px 24px', 
                      borderRadius: '500px', 
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Play {share.mediaType}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isLoggedIn && <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />}
      <PlayerBar />
    </div>
  );
}
