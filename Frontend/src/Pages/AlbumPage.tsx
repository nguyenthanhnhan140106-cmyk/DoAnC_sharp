import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMusic } from '../Contexts/MusicContext';
import { albumService } from '../Services/albumService';
import { libraryService } from '../Services/libraryService';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/header';
import PlayerBar from '../Components/PlayerBar';
import RightSidebar from '../Components/RightSidebar';
import Footer from '../Components/Footer';
import { useAuth } from '../Contexts/AuthContext';
import AuthBanner from '../Components/AuthBanner';
import ShareModal from '../Components/ShareModal';
import '../Components/Styles/HomePage.css';
import '../Components/Styles/PlaylistPage.css';

import type { Song, Album, Playlist } from '../types';
export default function AlbumPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying, togglePlay, setQueue, addToQueue, toggleLikeSong, isSongLiked, openAddToPlaylistModal, showToast } = useMusic();
  const { isLoggedIn, user } = useAuth();
  const [album, setAlbum] = useState<Album | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSongMenu, setActiveSongMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [submenuSearchQuery, setSubmenuSearchQuery] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<{type: string, id: number, title: string, cover: string} | null>(null);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Viết thêm một hàm useEffect để khi bạn nhấn chuột ra ngoài, cái Menu sẽ tự động biến mất!
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('.album-more-menu-container')) {
        return;
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      setActiveSongMenu(null);
      setSubmenuSearchQuery('');
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/playlists/user/${user.id}`)
        .then(res => res.json())
        .then(data => setPlaylists(data))
        .catch(err => console.error(err));
    }
  }, [user]);

  useEffect(() => {
    const handlePlaylistUpdate = () => {
      if (user?.id) {
        fetch(`/api/playlists/user/${user.id}`)
          .then(res => res.json())
          .then(data => setPlaylists(data))
          .catch(err => console.error(err));
      }
    };
    window.addEventListener('playlistUpdated', handlePlaylistUpdate);
    return () => window.removeEventListener('playlistUpdated', handlePlaylistUpdate);
  }, [user]);

  const handleAddSongToPlaylist = async (song: Song, playlistId: number) => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/playlists/${playlistId}/songs/${song.id}`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        const targetPlaylist = playlists.find(p => p.id === playlistId);
        const playlistName = targetPlaylist ? targetPlaylist.name : "Playlist";
        showToast(`Added to ${playlistName}`, song.coverUrl);
        window.dispatchEvent(new Event('playlistUpdated'));
        setActiveSongMenu(null);
      } else {
        const errText = await res.text();
        showToast(errText || "Không thể thêm bài hát.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePlaylistAndAddSong = async (song: Song) => {
    if (!user) return;
    let maxNumber = 0;
    playlists.forEach(p => {
      const match = p.name.match(/#(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    });
    const nextNumber = maxNumber + 1;

    try {
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/playlists/user/${user.id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: `Playlist #${nextNumber}`,
          description: '',
          coverUrl: ''
        })
      });

      if (res.ok) {
        const newPlaylist = await res.json();
        const addHeaders: any = {};
        if (token) addHeaders['Authorization'] = `Bearer ${token}`;

        const addRes = await fetch(`/api/playlists/${newPlaylist.id}/songs/${song.id}`, {
          method: 'POST',
          headers: addHeaders
        });
        if (addRes.ok) {
          showToast(`Added to ${newPlaylist.name}`, song.coverUrl);
          setPlaylists(prev => [...prev, newPlaylist]);
          window.dispatchEvent(new Event('playlistUpdated'));
          setActiveSongMenu(null);
        } else {
          showToast("Đã tạo danh sách phát mới nhưng không thể thêm bài hát.");
        }
      } else {
        showToast("Không thể tạo danh sách phát mới.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAllSongsToPlaylist = async (songs: Song[], playlistId: number) => {
    try {
      const targetPlaylist = playlists.find(p => p.id === playlistId);
      const playlistName = targetPlaylist ? targetPlaylist.name : "Playlist";
      
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const results = await Promise.all(
        songs.map(song =>
          fetch(`/api/playlists/${playlistId}/songs/${song.id}`, { method: 'POST', headers })
        )
      );
      
      const successCount = results.filter(res => res.ok).length;
      if (successCount > 0) {
        showToast(`Added to ${playlistName}`, songs[0]?.coverUrl);
        window.dispatchEvent(new Event('playlistUpdated'));
        setIsMenuOpen(false);
      } else {
        showToast("Không thể thêm bài hát vào Playlist (các bài hát có thể đã tồn tại).");
      }
    } catch (err) {
      console.error(err);
      showToast("Có lỗi xảy ra khi thêm bài hát.");
    }
  };

  const handleCreatePlaylistAndAddSongs = async (songs: Song[]) => {
    if (!user) return;
    let maxNumber = 0;
    playlists.forEach(p => {
      const match = p.name.match(/#(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    });
    const nextNumber = maxNumber + 1;
    const newName = `Playlist #${nextNumber}`;

    try {
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/playlists/user/${user.id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newName,
          description: '',
          coverUrl: ''
        })
      });

      if (res.ok) {
        const newPlaylist = await res.json();
        
        const songHeaders: any = {};
        if (token) songHeaders['Authorization'] = `Bearer ${token}`;

        const results = await Promise.all(
          songs.map(song =>
            fetch(`/api/playlists/${newPlaylist.id}/songs/${song.id}`, { method: 'POST', headers: songHeaders })
          )
        );
        
        const successCount = results.filter(r => r.ok).length;
        if (successCount > 0) {
          showToast(`Added to ${newPlaylist.name}`, songs[0]?.coverUrl);
          setPlaylists(prev => [...prev, newPlaylist]);
          window.dispatchEvent(new Event('playlistUpdated'));
          setIsMenuOpen(false);
        } else {
          showToast("Đã tạo danh sách phát mới nhưng không thể thêm bài hát.");
        }
      } else {
        showToast("Không thể tạo danh sách phát mới.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      albumService.getAlbumById(id)
        .then((res: Album) => setAlbum(res))
        .catch((err: unknown) => console.error(err));
      // Kiểm tra trạng thái đã lưu vào thư viện chưa
      if (isLoggedIn) {
        libraryService.getAlbumStatus(Number(id))
          .then(saved => setIsInLibrary(saved))
          .catch(() => setIsInLibrary(false));
      }
    }
  }, [id, isLoggedIn]);

  // Xáo trộn và phát album
  const handleShufflePlay = () => {
    if (!album || (album.songs || []).length === 0) return;
    const shuffled = [...(album.songs || [])].sort(() => Math.random() - 0.5);
    setQueue(shuffled, 0);
    playSong(shuffled[0]);
  };

  // Toggle lưu/xóa album khỏi thư viện
  const handleToggleLibrary = async () => {
    if (!isLoggedIn || !album) return;
    setLibraryLoading(true);
    try {
      if (isInLibrary) {
        await libraryService.removeAlbum(album.id);
        setIsInLibrary(false);
        showToast?.('Đã xóa khỏi thư viện');
      } else {
        await libraryService.saveAlbum(album.id);
        setIsInLibrary(true);
        showToast?.(`Đã thêm "${album.title}" vào thư viện`, album.coverUrl);
      }
      window.dispatchEvent(new Event('libraryUpdated'));
    } catch (err) {
      console.error('Library toggle error:', err);
    } finally {
      setLibraryLoading(false);
    }
  };

  // Thêm fl_attachment vào Cloudinary URL để ép trình duyệt tải xuống
  const toDownloadUrl = (url: string) => {
    // Chèn fl_attachment sau /upload/ trong URL Cloudinary
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/fl_attachment/');
    }
    return url;
  };

  // Tải xuống tất cả bài hát
  const handleDownloadAll = async () => {
    if (!album || (album.songs || []).length === 0) return;
    setIsDownloading(true);
    const songsWithAudio = (album.songs || []).filter(s => s.audioUrl);
    if (songsWithAudio.length === 0) {
      showToast?.('Không có bài hát nào có link nhạc để tải.');
      setIsDownloading(false);
      return;
    }

    showToast?.(`Đang tải ${songsWithAudio.length} bài hát...`);

    // Tải từng bài tuần tự: fetch blob → tạo link download → click
    for (let i = 0; i < songsWithAudio.length; i++) {
      const song = songsWithAudio[i];
      try {
        const downloadUrl = toDownloadUrl(song.audioUrl!);
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `${song.title} - ${song.artist}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Giải phóng bộ nhớ
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

        // Delay giữa các bài để trình duyệt không bị overwhelm
        if (i < songsWithAudio.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } catch (err) {
        console.error(`Lỗi tải bài "${song.title}":`, err);
        showToast?.(`Không thể tải: ${song.title}`);
      }
    }

    setIsDownloading(false);
    showToast?.(`Đã tải xong ${songsWithAudio.length} bài hát!`);
  };

  const handlePlayClick = (song: Song, index: number) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      if (album) {
        setQueue((album.songs || []), index);
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
                    <p style={{ color: '#b3b3b3', margin: 0 }}>{album.artistName} • {(album.songs || []).length} bài hát</p>
                  </div>
                </div>

                {/* Thanh công cụ (Play, Shuffle, ...) */}
                <div className="album-action-bar">
                  <button
                    className="album-play-btn"
                    title="Phát Album"
                    onClick={() => {
                      if ((album.songs || []).length > 0) {
                        setQueue((album.songs || []), 0);
                        playSong((album.songs || [])[0]);
                      }
                    }}
                  >
                    <svg viewBox="0 0 24 24"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z" /></svg>
                  </button>

                  {/* Nút Shuffle - xáo trộn thứ tự bài rồi phát */}
                  <button
                    className="album-action-icon"
                    title="Phát ngẫu nhiên"
                    onClick={handleShufflePlay}
                    style={{ color: '#b3b3b3', transition: 'color 0.15s, transform 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#b3b3b3'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <svg viewBox="0 0 16 16" width="32" height="32"><path d="M13.151.922a.75.75 0 10-1.06 1.06L13.109 3H11.16a3.75 3.75 0 00-2.873 1.34l-6.173 7.356A2.25 2.25 0 01.39 12.5H0V14h.391a3.75 3.75 0 002.873-1.34l6.173-7.356a2.25 2.25 0 011.724-.804h1.947l-1.017 1.018a.75.75 0 001.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 00.39 3.5zM11.16 12.5h1.95l-1.017-1.018a.75.75 0 111.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 11-1.06-1.06l1.018-1.018H11.16a3.75 3.75 0 01-2.873-1.34l-1.625-1.936.979-1.167 1.625 1.936a2.25 2.25 0 001.724.804z" /></svg>
                  </button>

                  {/* Nút + Thêm vào thư viện — xanh khi đã lưu */}
                  <button
                    className="album-action-icon"
                    title={isInLibrary ? 'Xóa khỏi thư viện' : 'Thêm vào thư viện'}
                    onClick={handleToggleLibrary}
                    disabled={libraryLoading}
                    style={{
                      color: isInLibrary ? '#1db954' : '#b3b3b3',
                      transition: 'color 0.15s, transform 0.15s',
                      opacity: libraryLoading ? 0.5 : 1
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    {isInLibrary ? (
                      // Icon ✓ tròn xanh khi đã lưu
                      <svg viewBox="0 0 16 16" width="32" height="32" fill="currentColor">
                        <circle cx="8" cy="8" r="7" fill="#1db954" />
                        <path d="M11.5 5.5l-4.5 4.5-2-2" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 16 16" width="32" height="32" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm8.5-3.5v3h3v1.5h-3v3h-1.5v-3h-3v-1.5h3v-3h1.5z" /></svg>
                    )}
                  </button>

                  {/* Nút Tải xuống */}
                  <button
                    className="album-action-icon"
                    title={isDownloading ? 'Đang tải...' : 'Tải xuống tất cả bài hát'}
                    onClick={handleDownloadAll}
                    disabled={isDownloading}
                    style={{
                      color: isDownloading ? '#1db954' : '#b3b3b3',
                      transition: 'color 0.15s, transform 0.15s',
                      opacity: isDownloading ? 0.6 : 1
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = isDownloading ? '#1db954' : '#b3b3b3'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <svg viewBox="0 0 16 16" width="32" height="32" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zM7.25 4v4.44l-1.47-1.47-1.06 1.06L8 11.31l3.28-3.28-1.06-1.06-1.47 1.47V4h-1.5z" /></svg>
                  </button>

                  <div className="album-more-menu-container" ref={menuRef}>
                    <button className="playlist-icon-btn" title="Tùy chọn khác" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                      <svg viewBox="0 0 16 16" width="32" height="32" fill="currentColor"><path d="M3 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
                    </button>
                    {isMenuOpen && (
                      <ul className="album-dropdown-menu">
                        {/* Add/Remove from Library — đổi giao diện khi đã lưu */}
                        <li
                          onClick={() => { handleToggleLibrary(); setIsMenuOpen(false); }}
                          style={{ color: isInLibrary ? '#1db954' : '#fff' }}
                        >
                          {isInLibrary ? (
                            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                              <circle cx="8" cy="8" r="8" fill="#1db954" />
                              <path d="M11.466 5.255a.75.75 0 0 1 1.05 1.048l-5.602 5.862a.75.75 0 0 1-1.077.018l-2.45-2.585a.75.75 0 0 1 1.085-1.026l1.928 2.034 5.066-5.351z" fill="#000" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm8.5-3.5v3h3v1.5h-3v3h-1.5v-3h-3v-1.5h3v-3h1.5z" /></svg>
                          )}
                          {isInLibrary ? 'Remove from Your Library' : 'Add to Your Library'}
                        </li>
                        <li
                          onClick={() => {
                            if ((album.songs || []).length > 0) {
                              addToQueue((album.songs || []));
                              showToast?.(`Đã thêm ${(album.songs || []).length} bài vào hàng chờ`);
                              setIsMenuOpen(false);
                            }
                          }}
                        >
                          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M16 15H2v-1.5h14V15zm0-4.5H2V9h14v1.5zm-8.034-6A5.484 5.484 0 017.187 3H14V1.5H7.187a5.484 5.484 0 01.779-1.5H16v6H7.966zM2 2V.5h3.5v6H2v-1.5H.5V2H2z" /></svg>
                          Add to queue
                        </li>
                        <li className="album-dropdown-divider"></li>
                        <li className="has-submenu" onClick={(e) => e.stopPropagation()}>
                          <svg viewBox="0 0 16 16"><path d="M15 15H1v-1.5h14V15zm0-4.5H1V9h14v1.5zm-8.034-6A5.484 5.484 0 016.187 3H13V1.5H6.187a5.484 5.484 0 01.779-1.5H15v6H6.966zM1 2V.5h3.5v6H1v-1.5H.5V2H1z" /></svg>
                          Add to playlist
                          <svg viewBox="0 0 16 16" className="submenu-arrow"><path d="M14 8L6 14V2z" /></svg>
                          <div className="album-submenu" style={{ left: 'auto', right: '100%', marginRight: 0, paddingRight: 8, top: 0, backgroundColor: 'transparent', boxShadow: 'none', paddingTop: 0, paddingBottom: 0, width: 228 }}>
                            <div style={{ backgroundColor: '#282828', borderRadius: 4, boxShadow: '0 16px 24px rgba(0, 0, 0, 0.5)', padding: '4px 0', width: 220 }}>
                              <div className="submenu-search" onClick={(e) => e.stopPropagation()}>
                                <svg viewBox="0 0 16 16"><path d="M7 1.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM0 7a7 7 0 1112.59 4.53l3.94 3.94-1.06 1.06-3.94-3.94A7 7 0 010 7z" /></svg>
                                <input 
                                  type="text" 
                                  placeholder="Find a playlist" 
                                  value={submenuSearchQuery}
                                  onChange={(e) => setSubmenuSearchQuery(e.target.value)}
                                />
                              </div>
                              <div className="submenu-item" onClick={(e) => { e.stopPropagation(); handleCreatePlaylistAndAddSongs((album.songs || [])); }}>
                                <svg viewBox="0 0 16 16"><path d="M14 7v1.5h-4.5V13h-1.5V8.5H3.5V7h4.5V2.5h1.5V7H14z" /></svg>
                                New playlist
                              </div>
                              <div className="album-dropdown-divider"></div>
                              <div className="submenu-playlists-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {playlists
                                  .filter(pl => pl.name.toLowerCase().includes(submenuSearchQuery.toLowerCase()))
                                  .map(pl => (
                                    <div 
                                      key={pl.id} 
                                      className="submenu-item" 
                                      onClick={(e) => { e.stopPropagation(); handleAddAllSongsToPlaylist((album.songs || []), pl.id); }}
                                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', fontSize: 13 }}
                                    >
                                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.name}</span>
                                    </div>
                                  ))
                                }
                              </div>
                            </div>
                          </div>
                        </li>
                        <li className="album-dropdown-divider"></li>
                        <li onClick={(e) => { 
                          e.stopPropagation(); 
                          if (!isLoggedIn) {
                            showToast?.('Vui lòng đăng nhập để chia sẻ!');
                          } else {
                            setShareData({
                              type: 'album',
                              id: album.id,
                              title: album.title,
                              cover: album.coverUrl
                            });
                            setIsShareModalOpen(true);
                          }
                          setIsMenuOpen(false); 
                        }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                            <polyline points="16 6 12 2 8 6"></polyline>
                            <line x1="12" y1="2" x2="12" y2="15"></line>
                          </svg>
                          Share
                        </li>
                      </ul>
                    )}
                  </div>

                </div>

                {/* Danh sách bài hát */}
                {(album.songs || []).map((song, index) => {
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
                          {song.videoUrl && (
                            <button 
                              style={{ background: 'none', border: '1px solid #b3b3b3', borderRadius: '4px', color: '#b3b3b3', cursor: 'pointer', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}
                              title="Xem MV"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/video/${song.id}`);
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#fff'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = '#b3b3b3'; e.currentTarget.style.borderColor = '#b3b3b3'; }}
                            >
                              MV
                            </button>
                          )}

                          {(isHovered || activeSongMenu === index || isSongLiked(song.id)) && (
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
                  {(isHovered || activeSongMenu === index) && (
                            <div className="album-more-menu-container" style={{ position: 'relative' }}>
                              <button style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: 4 }} title="Tùy chọn khác"
                                onClick={(e) => { e.stopPropagation(); setActiveSongMenu(activeSongMenu === index ? null : index); setSubmenuSearchQuery(''); }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#b3b3b3'}>
                                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M3 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
                              </button>
                              {activeSongMenu === index && (
                                  <ul className="album-dropdown-menu" style={{ bottom: '100%', right: 0, left: 'auto', top: 'auto', marginBottom: 8, zIndex: 1000 }} onClick={(e) => e.stopPropagation()}>
                                    <li onClick={(e) => { e.stopPropagation(); addToQueue([song]); showToast?.('Đã thêm bài hát vào hàng chờ'); setActiveSongMenu(null); }}>
                                      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M16 15H2v-1.5h14V15zm0-4.5H2V9h14v1.5zm-8.034-6A5.484 5.484 0 017.187 3H14V1.5H7.187a5.484 5.484 0 01.779-1.5H16v6H7.966zM2 2V.5h3.5v6H2v-1.5H.5V2H2z" /></svg>
                                      Add to queue
                                    </li>
                                    <li className="album-dropdown-divider"></li>
                                  <li className="has-submenu" onClick={(e) => e.stopPropagation()}>
                                    <svg viewBox="0 0 16 16"><path d="M15 15H1v-1.5h14V15zm0-4.5H1V9h14v1.5zm-8.034-6A5.484 5.484 0 016.187 3H13V1.5H6.187a5.484 5.484 0 01.779-1.5H15v6H6.966zM1 2V.5h3.5v6H1v-1.5H.5V2H1z" /></svg>
                                    Add to playlist
                                    <svg viewBox="0 0 16 16" className="submenu-arrow"><path d="M14 8L6 14V2z" /></svg>
                                    <div className="album-submenu" style={{ left: 'auto', right: '100%', marginRight: 0, paddingRight: 8, top: 0, backgroundColor: 'transparent', boxShadow: 'none', paddingTop: 0, paddingBottom: 0, width: 228 }}>
                                      <div style={{ backgroundColor: '#282828', borderRadius: 4, boxShadow: '0 16px 24px rgba(0, 0, 0, 0.5)', padding: '4px 0', width: 220 }}>
                                        <div className="submenu-search" onClick={(e) => e.stopPropagation()}>
                                          <svg viewBox="0 0 16 16"><path d="M7 1.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM0 7a7 7 0 1112.59 4.53l3.94 3.94-1.06 1.06-3.94-3.94A7 7 0 010 7z" /></svg>
                                          <input 
                                            type="text" 
                                            placeholder="Find a playlist" 
                                            value={submenuSearchQuery}
                                            onChange={(e) => setSubmenuSearchQuery(e.target.value)}
                                          />
                                        </div>
                                        <div className="submenu-item" onClick={(e) => { e.stopPropagation(); handleCreatePlaylistAndAddSong(song); }}>
                                          <svg viewBox="0 0 16 16"><path d="M14 7v1.5h-4.5V13h-1.5V8.5H3.5V7h4.5V2.5h1.5V7H14z" /></svg>
                                          New playlist
                                        </div>
                                        <div className="album-dropdown-divider"></div>
                                        <div className="submenu-playlists-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                          {playlists
                                            .filter(pl => pl.name.toLowerCase().includes(submenuSearchQuery.toLowerCase()))
                                            .map(pl => (
                                              <div 
                                                key={pl.id} 
                                                className="submenu-item" 
                                                onClick={(e) => { e.stopPropagation(); handleAddSongToPlaylist(song, pl.id); }}
                                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', fontSize: 13 }}
                                              >
                                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.name}</span>
                                              </div>
                                            ))
                                          }
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                  <li className="album-dropdown-divider"></li>
                                  <li onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (!isLoggedIn) {
                                      showToast?.('Vui lòng đăng nhập để chia sẻ bài hát!');
                                    } else {
                                      setShareData({
                                        type: 'song',
                                        id: song.id,
                                        title: song.title,
                                        cover: song.coverUrl || ''
                                      });
                                      setIsShareModalOpen(true);
                                    }
                                    setActiveSongMenu(null); 
                                  }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                                      <polyline points="16 6 12 2 8 6"></polyline>
                                      <line x1="12" y1="2" x2="12" y2="15"></line>
                                    </svg>
                                    Share
                                  </li>
                                </ul>
                              )}
                            </div>
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

      {shareData && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setShareData(null);
          }}
          mediaType={shareData.type}
          mediaId={shareData.id}
          mediaTitle={shareData.title}
          mediaCover={shareData.cover}
        />
      )}
    </div>
  );
}