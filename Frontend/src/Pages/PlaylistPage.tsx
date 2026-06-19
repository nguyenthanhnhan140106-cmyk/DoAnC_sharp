import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMusic } from '../Contexts/MusicContext';
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

import type { Song, Playlist } from '../types';

export default function PlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying, togglePlay, setQueue, addToQueue, toggleLikeSong, isSongLiked, likedSongs, openAddToPlaylistModal, showToast } = useMusic();
  const { isLoggedIn, user } = useAuth();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSongMenu, setActiveSongMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [submenuSearchQuery, setSubmenuSearchQuery] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<{type: string, id: number, title: string, cover: string} | null>(null);

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
        
        const songHeaders: any = {};
        if (token) songHeaders['Authorization'] = `Bearer ${token}`;

        const addRes = await fetch(`/api/playlists/${newPlaylist.id}/songs/${song.id}`, {
          method: 'POST',
          headers: songHeaders
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

  const handleTogglePrivacy = async () => {
    if (!playlist || playlist.id === ('liked' as any) || !user) return;
    try {
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const newIsPublic = !playlist.isPublic;
      const res = await fetch(`/api/playlists/${playlist.id}/privacy`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(newIsPublic)
      });
      if (res.ok) {
        setPlaylist(prev => prev ? { ...prev, isPublic: newIsPublic } : prev);
        showToast?.(`Đã đổi playlist sang trạng thái ${newIsPublic ? 'Công khai' : 'Riêng tư'}`);
      } else {
        const text = await res.text();
        showToast?.(text || 'Không thể thay đổi trạng thái.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (id === 'liked') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlaylist({
        id: 'liked' as unknown as number,
        name: 'Liked Songs',
        userId: user?.id || 0,
        coverUrl: 'none',
        creatorName: user?.username || 'Bạn',
        isPublic: false,
        songs: likedSongs || [],
      });
      setShowSearch(false);
      return;
    }

    if (id) {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      fetch(`/api/playlists/${id}`, { headers })
        .then(res => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then(data => {
          setPlaylist(data);
          setShowSearch(data.songs.length === 0);
        })
        .catch(err => {
          console.error(err);
          navigate('/'); // Về trang chủ nếu lỗi
        });
    }
  }, [id, navigate, likedSongs, user]);

  const handleSearch = (query: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetch(`/api/songs/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => setSearchResults(data))
        .catch(err => console.error(err));
    }, 500);
    setSearchTimeout(timeout);
  };

  const handleAddSong = async (song: Song) => {
    if (!playlist) return;

    if ((playlist.songs || []).some(s => s.id === song.id)) {
      showToast?.("Bài hát này đã có trong danh sách phát.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/playlists/${playlist.id}/songs/${song.id}`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        // Cập nhật giao diện: thêm bài hát vào danh sách playlist
        setPlaylist({
          ...playlist,
          coverUrl: song.coverUrl, // Cập nhật hình ảnh của Playlist thành hình bài hát vừa thêm
          songs: [...(playlist.songs || []), song]
        });
        window.dispatchEvent(new Event('playlistUpdated'));
      } else {
        const error = await res.text();
        alert(error || "Không thể thêm bài hát");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlayClick = (song: Song, index: number) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      if (playlist) {
        setQueue((playlist.songs || []), index);
      }
      playSong(song);
    }
  };

  const handlePlayAll = () => {
    if (playlist && (playlist.songs || []).length > 0) {
      setQueue((playlist.songs || []), 0);
      playSong((playlist.songs || [])[0]);
    }
  };

  // Xáo trộn và phát playlist
  const handleShufflePlay = () => {
    if (!playlist || (playlist.songs || []).length === 0) return;
    const shuffled = [...(playlist.songs || [])].sort(() => Math.random() - 0.5);
    setQueue(shuffled, 0);
    playSong(shuffled[0]);
  };

  // Thêm fl_attachment vào Cloudinary URL để ép tải xuống
  const toDownloadUrl = (url: string) => {
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/fl_attachment/');
    }
    return url;
  };

  // Tải xuống tất cả bài hát
  const handleDownloadAll = async () => {
    if (!playlist || (playlist.songs || []).length === 0) return;
    setIsDownloading(true);
    const songsWithAudio = (playlist.songs || []).filter(s => s.audioUrl);
    if (songsWithAudio.length === 0) {
      showToast?.('Không có bài hát nào có link nhạc để tải.');
      setIsDownloading(false);
      return;
    }
    showToast?.(`Đang tải ${songsWithAudio.length} bài hát...`);
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
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
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

  const coverUrl = id === 'liked' ? '' : playlist?.coverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop";

  return (
    <div className={`spotify-layout ${!isLoggedIn ? 'right-hidden' : ''}`}>
      <Header />
      <Sidebar isCollapsed={false} setIsCollapsed={() => { }} />
      <div className="main-view">
        <div className="content-wrapper" style={{ position: 'relative', minHeight: '100vh' }}>
          {!playlist ? (
            <div style={{ color: '#b3b3b3', padding: 40, textAlign: 'center' }}>Đang tải danh sách phát...</div>
          ) : (
            <>
              {/* Dynamic background */}
              <div 
                className="playlist-page-bg"
                style={{
                  background: id === 'liked' ? 'linear-gradient(to bottom, #450af5, #121212)' : `url(${coverUrl})`,
                  filter: id === 'liked' ? 'none' : 'blur(120px) saturate(250%)',
                  opacity: id === 'liked' ? 1 : 0.55
                }} 
              />
              {id !== 'liked' && <div className="playlist-page-bg-gradient" />}

              {/* Nội dung playlist nổi lên trên nền */}
              <div className="playlist-content-top">
                {/* Header playlist */}
                <div className="playlist-header-container">
                  {id === 'liked' ? (
                    <div className="playlist-cover-liked">
                      <svg viewBox="0 0 24 24" width="80" height="80" fill="#fff"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </div>
                  ) : (
                    <img src={coverUrl} alt={playlist.name} className="playlist-cover-img" />
                  )}
                  <div>
                    <p className="playlist-type-label">Playlist</p>
                    <h1 className="playlist-title-text">{playlist.name}</h1>
                    <p className="playlist-meta-info">
                      <a href="/profile" className="playlist-creator-link">
                        {playlist.creatorName}
                      </a> • {(playlist.songs || []).length} bài hát
                    </p>
                    {playlist.description && (
                       <p className="playlist-description">{playlist.description}</p>
                    )}
                  </div>
                </div>

                {/* Các nút điều khiển */}
                <div className="playlist-action-bar">
                  <button
                    onClick={handlePlayAll}
                    className="playlist-play-btn"
                    style={{
                      opacity: (playlist.songs || []).length > 0 ? 1 : 0.5,
                      pointerEvents: (playlist.songs || []).length > 0 ? 'auto' : 'none'
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="#000"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z" /></svg>
                  </button>

                  {/* Nút Shuffle */}
                  <button
                    className="playlist-icon-btn"
                    title="Phát ngẫu nhiên"
                    onClick={handleShufflePlay}
                    style={{ color: '#b3b3b3', transition: 'color 0.15s, transform 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#b3b3b3'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <svg viewBox="0 0 16 16" width="32" height="32" fill="currentColor"><path d="M13.151.922a.75.75 0 10-1.06 1.06L13.109 3H11.16a3.75 3.75 0 00-2.873 1.34l-6.173 7.356A2.25 2.25 0 01.39 12.5H0V14h.391a3.75 3.75 0 002.873-1.34l6.173-7.356a2.25 2.25 0 011.724-.804h1.947l-1.017 1.018a.75.75 0 001.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 00.39 3.5zM11.16 12.5h1.95l-1.017-1.018a.75.75 0 111.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 11-1.06-1.06l1.018-1.018H11.16a3.75 3.75 0 01-2.873-1.34l-1.625-1.936.979-1.167 1.625 1.936a2.25 2.25 0 001.724.804z" /></svg>
                  </button>

                  {id !== 'liked' && (
                    <>


                      {/* Nút Download */}
                      <button
                        className="playlist-icon-btn"
                        title={isDownloading ? 'Đang tải...' : 'Tải xuống tất cả bài hát'}
                        onClick={handleDownloadAll}
                        disabled={isDownloading}
                        style={{
                          color: isDownloading ? '#1db954' : '#b3b3b3',
                          opacity: isDownloading ? 0.6 : 1,
                          transition: 'color 0.15s, transform 0.15s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = isDownloading ? '#1db954' : '#b3b3b3'; e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        <svg viewBox="0 0 16 16" width="32" height="32" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zM7.25 4v4.44l-1.47-1.47-1.06 1.06L8 11.31l3.28-3.28-1.06-1.06-1.47 1.47V4h-1.5z" /></svg>
                      </button>

                      {/* Nút Toggle Privacy */}
                      {user && user.id === playlist.userId && (
                        <button
                          className="playlist-icon-btn"
                          title={playlist.isPublic ? 'Công khai (Nhấn để đổi thành Riêng tư)' : 'Riêng tư (Nhấn để đổi thành Công khai)'}
                          onClick={handleTogglePrivacy}
                          style={{
                            color: playlist.isPublic ? '#1db954' : '#b3b3b3',
                            transition: 'color 0.15s, transform 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = playlist.isPublic ? '#1db954' : '#b3b3b3'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                          {playlist.isPublic ? (
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                          )}
                        </button>
                      )}

                      {/* Nút More Options */}
                      <div className="album-more-menu-container" ref={menuRef}>
                        <button className="playlist-icon-btn" title="Tùy chọn khác" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                          <svg viewBox="0 0 16 16" width="32" height="32" fill="currentColor"><path d="M3 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
                        </button>
                        {isMenuOpen && (
                          <ul className="album-dropdown-menu">
                        <li
                          onClick={() => {
                            if ((playlist.songs || []).length > 0) {
                              addToQueue((playlist.songs || []));
                              showToast?.(`Đã thêm ${(playlist.songs || []).length} bài vào hàng chờ`);
                              setIsMenuOpen(false);
                            }
                          }}
                        >
                          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M16 15H2v-1.5h14V15zm0-4.5H2V9h14v1.5zm-8.034-6A5.484 5.484 0 017.187 3H14V1.5H7.187a5.484 5.484 0 01.779-1.5H16v6H7.966zM2 2V.5h3.5v6H2v-1.5H.5V2H2z" /></svg>
                          Add to queue
                        </li>
                        <li className="album-dropdown-divider"></li>
                        <li onClick={(e) => { 
                          e.stopPropagation(); 
                          if (!isLoggedIn) {
                            showToast?.('Vui lòng đăng nhập để chia sẻ!');
                          } else {
                            setShareData({
                              type: 'playlist',
                              id: playlist.id,
                              title: playlist.name,
                              cover: playlist.coverUrl || ''
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
                </>
              )}
            </div>

                <div style={{ padding: '0 32px' }}>
                  {/* Danh sách bài hát */}
                  <div style={{ marginTop: 16 }}>
                    {(playlist.songs || []).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px 0 20px', color: '#b3b3b3' }}>
                      </div>
                    )}
                    
                    {/* Header Bảng */}
                    {(playlist.songs || []).length > 0 && (
                      <div style={{
                        display: 'grid', gridTemplateColumns: '50px 2fr 1.5fr 1fr 100px',
                        padding: '8px 16px', color: '#b3b3b3', fontSize: 14, fontWeight: 500,
                        borderBottom: '1px solid rgba(255,255,255,.1)', marginBottom: 16
                      }}>
                        <div>#</div>
                        <div>Title</div>
                        <div>Album</div>
                        <div>Date added</div>
                        <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {/* Đã bỏ icon Clock theo yêu cầu */}
                        </div>
                      </div>
                    )}

                    {(playlist.songs || []).map((song, idx) => {
                      const isCurrent = currentSong?.id === song.id;
                      
                      // Tính toán khoảng thời gian đã thêm
                      let dateAddedText = "Just now";
                      if (song.addedAt) {
                        const diff = Math.floor((new Date().getTime() - new Date(song.addedAt).getTime()) / 1000);
                        if (diff < 60) dateAddedText = "Just now";
                        else if (diff < 3600) dateAddedText = `${Math.floor(diff / 60)} minutes ago`;
                        else if (diff < 86400) dateAddedText = `${Math.floor(diff / 3600)} hours ago`;
                        else dateAddedText = `${Math.floor(diff / 86400)} days ago`;
                      }

                      return (
                        <div
                          key={`playlist-song-${song.id}-${idx}`}
                          onMouseEnter={() => setHoveredIndex(idx)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          style={{
                            display: 'grid', gridTemplateColumns: '50px 2fr 1.5fr 1fr 100px',
                            alignItems: 'center', padding: '8px 16px', borderRadius: 4,
                            backgroundColor: (hoveredIndex === idx || activeSongMenu === idx) ? 'rgba(255,255,255,.1)' : 'transparent',
                            cursor: 'pointer', transition: 'background-color 0.2s'
                          }}
                          onClick={() => handlePlayClick(song, idx)}
                        >
                          {/* Số thứ tự hoặc Icon Play */}
                          <div style={{ color: isCurrent ? '#1ed760' : '#b3b3b3', width: 24 }}>
                            {hoveredIndex === idx ? (
                              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>
                                {(isCurrent && isPlaying) ? (
                                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>
                                ) : (
                                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/></svg>
                                )}
                              </button>
                            ) : (
                              <span>{isCurrent && isPlaying ? <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" alt="playing" width="14" height="14" /> : idx + 1}</span>
                            )}
                          </div>

                          {/* Thông tin bài hát */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={song.coverUrl} alt={song.title} style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ color: isCurrent ? '#1ed760' : '#fff', fontSize: 16, fontWeight: 500 }}>{song.title}</span>
                              <span style={{ color: '#b3b3b3', fontSize: 14 }}>{song.artist}</span>
                            </div>
                          </div>

                          {/* Album */}
                          <div style={{ color: '#b3b3b3', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 16 }}>
                            {song.title} {/* Dùng tạm title làm tên Album vì CSDL chưa có bảng Album */}
                          </div>

                          {/* Date added */}
                          <div style={{ color: '#b3b3b3', fontSize: 14 }}>
                            {dateAddedText}
                          </div>

                          {/* Nút Cộng và 3 chấm */}
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

                            {(hoveredIndex === idx || activeSongMenu === idx || isSongLiked(song.id)) && (
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
                            
                            {(hoveredIndex === idx || activeSongMenu === idx) && (
                              <div className="album-more-menu-container" style={{ position: 'relative' }}>
                                <button style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: 4 }} title="Tùy chọn khác"
                                  onClick={(e) => { e.stopPropagation(); setActiveSongMenu(activeSongMenu === idx ? null : idx); setSubmenuSearchQuery(''); }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#b3b3b3'}>
                                  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M3 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
                                </button>
                                {activeSongMenu === idx && (
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

                  {/* Phần tìm kiếm bài hát thêm vào Playlist (Chỉ hiện khi playlist trống) */}
                  {showSearch && (
                    <div style={{ marginTop: 20, paddingTop: 20, paddingBottom: 120 }}>
                      <h2 style={{ color: '#fff', fontSize: 24, margin: '0 0 16px', fontWeight: 700 }}>Let's find something for your playlist</h2>
                      <div style={{ position: 'relative', width: 350, marginBottom: 24 }}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#b3b3b3" style={{ position: 'absolute', top: 10, left: 12 }}>
                          <path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.279-9.407-9.279zm-7.407 9.279c0-4.006 3.302-7.279 7.407-7.279s7.407 3.273 7.407 7.279-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.279z"/>
                        </svg>
                        <input 
                          type="text" 
                          placeholder="Search for songs or episodes" 
                          style={{
                            width: '100%', padding: '10px 10px 10px 40px', borderRadius: 4, border: 'none',
                            backgroundColor: 'rgba(255,255,255,.1)', color: '#fff', fontSize: 14, outline: 'none'
                          }}
                          onChange={(e) => handleSearch(e.target.value)}
                        />
                      </div>

                      {/* Kết quả tìm kiếm */}
                      {searchResults.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 100 }}>
                          {searchResults.map((song, idx) => (
                            <div key={`search-song-${song.id}-${idx}`} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '8px 16px', borderRadius: 4, transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <img src={song.coverUrl} alt={song.title} style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ color: '#fff', fontSize: 16, fontWeight: 500 }}>{song.title}</span>
                                  <span style={{ color: '#b3b3b3', fontSize: 14 }}>{song.artist}</span>
                                </div>
                              </div>
                              {(playlist.songs || []).some(s => s.id === song.id) ? (
                                <button
                                  disabled
                                  style={{
                                    padding: '4px 16px', borderRadius: 20, border: '1px solid #1db954',
                                    background: 'transparent', color: '#1db954', fontSize: 13, fontWeight: 600,
                                    cursor: 'not-allowed', opacity: 0.7
                                  }}
                                >
                                  Added
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAddSong(song)}
                                  style={{
                                    padding: '4px 16px', borderRadius: 20, border: '1px solid #b3b3b3',
                                    background: 'transparent', color: '#fff', fontSize: 13, fontWeight: 600,
                                    cursor: 'pointer', transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#b3b3b3'; e.currentTarget.style.transform = 'scale(1)'; }}
                                >
                                  Add
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          <Footer />
        </div>
      </div>

      <RightSidebar isCollapsed={!isLoggedIn} setIsCollapsed={() => { }} />
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
