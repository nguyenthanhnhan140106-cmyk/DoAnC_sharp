import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMusic } from '../Contexts/MusicContext';
import { albumService } from '../Services/albumService';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/header';
import PlayerBar from '../Components/PlayerBar';
import RightSidebar from '../Components/RightSidebar';
import Footer from '../Components/Footer';
import { useAuth } from '../Contexts/AuthContext';
import AuthBanner from '../Components/AuthBanner';
import '../Components/Styles/HomePage.css';

interface Song {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  artistBanner?: string;
  artistId?: number;
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
  const { playSong, currentSong, isPlaying, togglePlay, setQueue, toggleLikeSong, isSongLiked, openAddToPlaylistModal } = useMusic() as any;
  const { isLoggedIn } = useAuth();
  const [album, setAlbum] = useState<Album | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Viết thêm một hàm useEffect để khi bạn nhấn chuột ra ngoài, cái Menu sẽ tự động biến mất!
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      albumService.getAlbumById(id)
        .then((res: any) => setAlbum(res))
        .catch((err: any) => console.error(err));
    }
  }, [id]);

  const handlePlayClick = (song: Song, index: number) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      if (album) {
        setQueue(album.songs, index);
      }
      playSong(song);
    }
  };

  return (
    <div className={`spotify-layout ${!isLoggedIn ? 'right-hidden' : ''}`}>
      <Header />
      <Sidebar isCollapsed={false} setIsCollapsed={() => { }} />
      <div className="main-view">
        <div className="content-wrapper" style={{ position: 'relative', minHeight: '100vh' }}>
          {!album ? (
            <div style={{ color: '#b3b3b3', padding: 40, textAlign: 'center' }}>Đang tải...</div>
          ) : (
            <>
              {/* Dynamic background từ ảnh bìa album */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 380,
                backgroundImage: `url(${album.coverUrl})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'blur(120px) saturate(250%)',
                opacity: 0.55, zIndex: 0, pointerEvents: 'none',
                transition: 'background-image 0.8s ease-in-out'
              }} />
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 380,
                background: 'linear-gradient(to bottom, rgba(18,18,18,0) 0%, rgba(18,18,18,0.5) 65%, #121212 100%)',
                zIndex: 1, pointerEvents: 'none'
              }} />

              {/* Nội dung album nổi lên trên nền */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                {/* Header album */}
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
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

                {/* Thanh công cụ (Play, Shuffle, ...) */}
                <div className="album-action-bar">
                  <button
                    className="album-play-btn"
                    title="Phát Album"
                    onClick={() => {
                      if (album.songs.length > 0) {
                        setQueue(album.songs, 0);
                        playSong(album.songs[0]);
                      }
                    }}
                  >
                    <svg viewBox="0 0 24 24"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z" /></svg>
                  </button>

                  <button className="album-action-icon" title="Trộn bài">
                    <svg viewBox="0 0 16 16" width="32" height="32"><path d="M13.151.922a.75.75 0 10-1.06 1.06L13.109 3H11.16a3.75 3.75 0 00-2.873 1.34l-6.173 7.356A2.25 2.25 0 01.39 12.5H0V14h.391a3.75 3.75 0 002.873-1.34l6.173-7.356a2.25 2.25 0 011.724-.804h1.947l-1.017 1.018a.75.75 0 001.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 00.39 3.5zM11.16 12.5h1.95l-1.017-1.018a.75.75 0 111.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 11-1.06-1.06l1.018-1.018H11.16a3.75 3.75 0 01-2.873-1.34l-1.625-1.936.979-1.167 1.625 1.936a2.25 2.25 0 001.724.804z" /></svg>
                  </button>

                  <button className="album-action-icon" title="Thêm vào thư viện">
                    <svg viewBox="0 0 16 16" width="32" height="32"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm8.5-3.5v3h3v1.5h-3v3h-1.5v-3h-3v-1.5h3v-3h1.5z" /></svg>
                  </button>

                  <button className="album-action-icon" title="Tải xuống">
                    <svg viewBox="0 0 16 16" width="32" height="32"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zM7.25 4v4.44l-1.47-1.47-1.06 1.06L8 11.31l3.28-3.28-1.06-1.06-1.47 1.47V4h-1.5z" /></svg>
                  </button>

                  <div className="album-more-menu-container" ref={menuRef}>
                    <button
                      className="album-action-icon"
                      title="Tùy chọn khác"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                      <svg viewBox="0 0 16 16" width="32" height="32"><path d="M3 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
                    </button>

                    {isMenuOpen && (
                      <ul className="album-dropdown-menu">
                        <li>
                          <svg viewBox="0 0 16 16"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm8.5-3.5v3h3v1.5h-3v3h-1.5v-3h-3v-1.5h3v-3h1.5z" /></svg>
                          Add to Your Library
                        </li>
                        <li>
                          <svg viewBox="0 0 16 16"><path d="M16 15H2v-1.5h14V15zm0-4.5H2V9h14v1.5zm-8.034-6A5.484 5.484 0 017.187 3H14V1.5H7.187a5.484 5.484 0 01.779-1.5H16v6H7.966zM2 2V.5h3.5v6H2v-1.5H.5V2H2z" /></svg>
                          Add to queue
                        </li>
                        <li className="album-dropdown-divider"></li>
                        <li className="has-submenu">
                          <svg viewBox="0 0 16 16"><path d="M14 7v1.5h-4.5V13h-1.5V8.5H3.5V7h4.5V2.5h1.5V7H14z" /></svg>
                          <span>Add to playlist</span>
                          {/* Biểu tượng mũi tên chỉ sang phải */}
                          <svg className="submenu-arrow" viewBox="0 0 16 16"><path d="M4 14l8-6-8-6v12z" /></svg>

                          {/* Khối Sub-menu sẽ tự động bung ra khi hover */}
                          <div className="album-submenu">
                            <div className="submenu-search">
                              <svg viewBox="0 0 16 16"><path d="M7 1.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM0 7a7 7 0 1112.59 4.53l3.94 3.94-1.06 1.06-3.94-3.94A7 7 0 010 7z" /></svg>
                              <input type="text" placeholder="Find a playlist" />
                            </div>

                            <div className="submenu-item">
                              <svg viewBox="0 0 16 16"><path d="M14 7v1.5h-4.5V13h-1.5V8.5H3.5V7h4.5V2.5h1.5V7H14z" /></svg>
                              New playlist
                            </div>

                            <div className="album-dropdown-divider"></div>

                            {/* Danh sách playlist sẽ được gọi từ API sau này */}
                          </div>
                        </li>
                        <li className="album-dropdown-divider"></li>
                        <li>
                          <svg viewBox="0 0 16 16"><path d="M12.5 2.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM9 5a3.5 3.5 0 116.5 1.95L11.57 9.87a4.5 4.5 0 11-4.04-6.84L9 5z" /></svg>
                          Share
                        </li>
                      </ul>
                    )}
                  </div>

                </div>

                {/* Danh sách bài hát */}
                {album.songs.map((song, index) => {
                  const isActive = currentSong?.id === song.id;
                  const isHovered = hoveredIndex === index;
                  return (
                    <div key={song.id}
                      onClick={() => handlePlayClick(song, index)}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '8px 16px', borderRadius: 4, cursor: 'pointer',
                        background: isHovered ? '#282828' : isActive ? 'rgba(29,185,84,0.1)' : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <div style={{ width: 20, textAlign: 'center', color: isActive ? '#1db954' : '#b3b3b3', position: 'relative', height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isHovered ? (
                          <span style={{ color: '#fff', fontSize: 15, lineHeight: 1 }}>
                            {isActive && isPlaying ? '⏸' : '▶'}
                          </span>
                        ) : isActive && isPlaying ? (
                          <div className="equalizer">
                            <span></span><span></span><span></span>
                          </div>
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <img src={song.coverUrl || `https://picsum.photos/seed/${song.id}/40/40`}
                        alt={song.title}
                        style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: 15, color: isActive ? '#1db954' : '#fff' }}>{song.title}</p>
                          <p style={{ margin: 0, fontSize: 13, color: '#b3b3b3' }}>{song.artist}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, gap: 16 }}>
                          {(isHovered || isSongLiked(song.id)) && (
                            <button style={{ background: 'none', border: 'none', color: isSongLiked(song.id) ? '#1db954' : '#b3b3b3', cursor: 'pointer', padding: 4 }} title={isSongLiked(song.id) ? "Đã lưu vào Liked Songs" : "Thêm vào danh sách phát"}
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                if (isSongLiked(song.id)) {
                                  openAddToPlaylistModal(song, e);
                                } else {
                                  toggleLikeSong(song);
                                }
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = isSongLiked(song.id) ? '#1ed760' : '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = isSongLiked(song.id) ? '#1db954' : '#b3b3b3'}>
                              {isSongLiked(song.id) ? (
                                <svg viewBox="0 0 16 16" width="16" height="16">
                                  <circle cx="8" cy="8" r="8" fill="#1ed760" />
                                  <path d="M11.466 5.255a.75.75 0 0 1 1.05 1.048l-5.602 5.862a.75.75 0 0 1-1.077.018l-2.45-2.585a.75.75 0 0 1 1.085-1.026l1.928 2.034 5.066-5.351z" fill="#000" />
                                </svg>
                              ) : (
                                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                                  <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm8.5-3.5v3h3v1.5h-3v3h-1.5v-3h-3v-1.5h3v-3h1.5z"/>
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                })}
              </div>
              <Footer />
            </>
          )}
        </div>
      </div>
      {isLoggedIn && <RightSidebar isCollapsed={false} setIsCollapsed={() => { }} />}
      {isLoggedIn ? <PlayerBar /> : <AuthBanner />}
    </div>
  );
}