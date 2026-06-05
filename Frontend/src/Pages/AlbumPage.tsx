import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useMusic } from '../Contexts/MusicContext';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/header';
import PlayerBar from '../Components/PlayerBar';
import RightSidebar from '../Components/RightSidebar';
import '../Components/Styles/HomePage.css';

interface Song {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl?: string;
}

interface Album {
  id: number;
  title: string;
  coverUrl: string;
  artistName: string;
  songs: Song[];
}

export default function AlbumPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying } = useMusic();
  const [album, setAlbum] = useState<Album | null>(null);

  useEffect(() => {
    axios.get(`/api/albums/${id}`)
      .then(res => setAlbum(res.data))
      .catch(err => console.error(err));
  }, [id]);

  return (
    <div className="spotify-layout">
      <Header />
      <Sidebar isCollapsed={false} setIsCollapsed={() => {}} />
      <div className="main-view">
        <div className="content-wrapper">
          {!album ? (
            <div style={{ color: '#b3b3b3', padding: 40, textAlign: 'center' }}>Đang tải...</div>
          ) : (
            <>
              {/* Header album */}
              <div style={{ display: 'flex', gap: 24, marginBottom: 32, alignItems: 'flex-end' }}>
                <button onClick={() => navigate(-1)}
                  style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer', fontSize: 24 }}>
                  ←
                </button>
                <img src={album.coverUrl} alt={album.title}
                  style={{ width: 180, height: 180, borderRadius: 8, objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,.5)' }} />
                <div>
                  <p style={{ color: '#b3b3b3', fontSize: 12, margin: '0 0 8px' }}>ALBUM</p>
                  <h1 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 700 }}>{album.title}</h1>
                  <p style={{ color: '#b3b3b3', margin: 0 }}>{album.artistName} • {album.songs.length} bài hát</p>
                </div>
              </div>

              {/* Danh sách bài hát */}
              {album.songs.map((song, index) => {
                const isActive = currentSong?.id === song.id;
                return (
                  <div key={song.id} onClick={() => playSong(song)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '8px 16px', borderRadius: 4, cursor: 'pointer',
                      background: isActive ? 'rgba(29,185,84,0.1)' : 'transparent'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#282828'}
                    onMouseLeave={e => e.currentTarget.style.background = isActive ? 'rgba(29,185,84,0.1)' : 'transparent'}
                  >
                    <span style={{ width: 20, textAlign: 'center', color: isActive ? '#1db954' : '#b3b3b3' }}>
                      {isActive && isPlaying ? '▶' : index + 1}
                    </span>
                    <img src={song.coverUrl || `https://picsum.photos/seed/${song.id}/40/40`}
                      alt={song.title}
                      style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 15, color: isActive ? '#1db954' : '#fff' }}>{song.title}</p>
                      <p style={{ margin: 0, fontSize: 13, color: '#b3b3b3' }}>{song.artist}</p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
      <RightSidebar isCollapsed={false} setIsCollapsed={() => {}} />
      <PlayerBar />
    </div>
  );
}