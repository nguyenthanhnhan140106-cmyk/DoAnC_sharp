import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Components/header';
import Sidebar from '../Components/Sidebar';
import { useAuth } from '../Contexts/AuthContext';
import { useMusic } from '../Contexts/MusicContext';
import API from '../Services/api';
import '../Components/Styles/HomePage.css';

interface SongDetails {
  id: number;
  title: string;
  artist: string;
  videoUrl: string;
  coverUrl: string;
}

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { pauseSong, showToast } = useMusic();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [song, setSong] = useState<SongDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pauseSong();

    API.get(`/songs/${id}`)
      .then(res => {
        const songData = res.data?.data || res.data;
        setSong(songData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        showToast('Không tìm thấy video này!');
        navigate('/');
      });
      
  }, [id]);

  return (
    <div className={`spotify-layout ${isSidebarCollapsed ? 'sidebar-hidden' : ''} right-hidden`}>
      <Header />
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <div className="main-view">
        <div className="content-wrapper" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          {loading ? (
            <p style={{ color: '#b3b3b3' }}>Loading Video...</p>
          ) : !song ? (
            <p style={{ color: '#b3b3b3' }}>Video không tồn tại.</p>
          ) : (
            <>
              <button 
                onClick={() => navigate(-1)} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#b3b3b3', 
                  cursor: 'pointer', 
                  fontSize: '16px', 
                  marginBottom: '16px',
                  alignSelf: 'flex-start' 
                }}
              >
                &larr; Back
              </button>
              <h1 style={{ color: 'white', marginBottom: '8px' }}>{song.title}</h1>
              <p style={{ color: '#b3b3b3', marginBottom: '24px' }}>{song.artist}</p>
              
              <div style={{ flex: 1, backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {song.videoUrl ? (
                  <video 
                    controls 
                    autoPlay 
                    style={{ width: '100%', height: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                    poster={song.coverUrl || undefined}
                  >
                    <source src={song.videoUrl} type="video/mp4" />
                    Trình duyệt của bạn không hỗ trợ thẻ video.
                  </video>
                ) : (
                  <div style={{ color: '#b3b3b3' }}>Bài hát này không có video (MV).</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
