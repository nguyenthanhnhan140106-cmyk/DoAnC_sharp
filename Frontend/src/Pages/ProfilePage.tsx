import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../Services/api';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/header';
import PlayerBar from '../Components/PlayerBar';
import RightSidebar from '../Components/RightSidebar';
import Footer from '../Components/Footer';
import AuthBanner from '../Components/AuthBanner';
import FollowListModal from '../Components/FollowListModal';
import { useAuth } from '../Contexts/AuthContext';
import { useMusic } from '../Contexts/MusicContext';
import { songService } from '../Services/songService';
import '../Components/Styles/ProfilePage.css';
import '../Components/Styles/HomePage.css';
import type { Song, UserProfile, Playlist } from '../types';
export default function ProfilePage() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { playSong, currentSong, isPlaying, setQueue, likedSongs } = useMusic();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [recentlyPlayedCount, setRecentlyPlayedCount] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [followingArtists, setFollowingArtists] = useState<{ artistId: number; name: string; coverUrl?: string }[]>([]);
  const [fullProfile, setFullProfile] = useState<UserProfile | null>(null);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<'followers' | 'following'>('followers');
  const [uploadedSongs, setUploadedSongs] = useState<Song[]>([]);
  const [isUploadedModalOpen, setIsUploadedModalOpen] = useState(false);
  const [contextMenuState, setContextMenuState] = useState<{ song: Song, x: number, y: number } | null>(null);
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleOpenEditProfile = () => {
    setEditDisplayName(fullProfile?.displayName || user?.username || '');
    setEditBio(fullProfile?.bio || '');
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setIsSavingProfile(true);
    try {
      await API.put(`/users/${user.id}`, {
        displayName: editDisplayName.trim() || null,
        bio: editBio.trim() || null,
      });
      const res = await API.get(`/Users/${user.id}`);
      setFullProfile(res.data);
      setIsEditProfileOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.Message || 'Cập nhật thất bại. Vui lòng thử lại.';
      alert(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    const closeMenu = () => setContextMenuState(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleDeleteUploadedSong = async (songId: number) => {
    if (!window.confirm("Are you sure you want to delete this song?")) return;
    try {
      await API.delete(`/songs/${songId}`);
      setUploadedSongs(prev => prev.filter(s => s.id !== songId));
      window.dispatchEvent(new Event('songDeleted'));
    } catch (err) {
      console.error("Error deleting song", err);
    }
  };

  const fetchFollowing = React.useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await API.get('/follow/following');
      if (Array.isArray(res.data)) setFollowingArtists(res.data);
    } catch { /* no-op */ }
  }, [isLoggedIn]);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // 1. Preview ngay lập tức (ảnh tạm trong RAM)
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setIsUploadingAvatar(true);

    try {
      // 2. Upload ảnh thẳng lên endpoint avatar (POST /api/users/{id}/avatar)
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await API.post(`/users/${user.id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const cloudinaryUrl: string = uploadRes.data?.avatarUrl ?? '';

      if (!cloudinaryUrl) throw new Error('Không nhận được URL ảnh từ server.');

      // 3. Cập nhật preview bằng URL Cloudinary thật
      setAvatarPreview(cloudinaryUrl);
      alert('Ảnh đại diện đã được cập nhật!');

    } catch (err) {
      console.error('Lỗi upload avatar:', err);
      // Nếu lỗi, reset về ảnh cũ
      setAvatarPreview(null);
      alert('Cập nhật ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploadingAvatar(false);
      // Reset input để có thể chọn lại cùng file
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };


  useEffect(() => {
    const fetchTopSongs = () => {
      songService.getAllSongs()
        .then((list: unknown) => {
          if (Array.isArray(list)) setSongs(list.slice(0, 4));
        })
        .catch((err: unknown) => console.error('❌ Lỗi:', err));
    };

    fetchTopSongs();
    
    window.addEventListener('songDeleted', fetchTopSongs);
    return () => window.removeEventListener('songDeleted', fetchTopSongs);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      API.get('/history/recent', { params: { limit: 50 } })
        .then((res) => {
          if (Array.isArray(res.data)) {
            setRecentlyPlayedCount(res.data.length);
          }
        })
        .catch(err => console.error('Lỗi lấy lịch sử:', err));

      if (user?.id) {
        API.get(`/Users/${user.id}`).then(res => setFullProfile(res.data)).catch(console.error);
        API.get(`/playlists/user/${user.id}`).then(res => setMyPlaylists(res.data)).catch(console.error);
      }
      // eslint-disable-next-line
      fetchFollowing();
    }

    // Refresh danh sách following khi có sự kiện followUpdated
    const handleFollowUpdate = () => {
      fetchFollowing();
      if (user?.id) {
        API.get(`/Users/${user.id}`).then(res => setFullProfile(res.data)).catch(console.error);
      }
    };
    const handlePlaylistUpdate = () => {
      if (user?.id) {
        API.get(`/playlists/user/${user.id}`).then(res => setMyPlaylists(res.data)).catch(console.error);
      }
    };
    window.addEventListener('followUpdated', handleFollowUpdate);
    window.addEventListener('playlistUpdated', handlePlaylistUpdate);
    // Lấy danh sách nhạc upload
    if (user?.id) {
      API.get(`/songs/user/${user.id}`)
        .then(res => {
          if (Array.isArray(res.data)) {
            setUploadedSongs(res.data);
          }
        })
        .catch(err => console.error("Lỗi lấy nhạc upload", err));
    }

    return () => {
      window.removeEventListener('followUpdated', handleFollowUpdate);
      window.removeEventListener('playlistUpdated', handlePlaylistUpdate);
    };
  }, [isLoggedIn, fetchFollowing, user?.id]);

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
              <div className="profile-avatar" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="User Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
                <div className="profile-avatar-overlay">
                  {isUploadingAvatar ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 48, height: 48, marginBottom: 8, animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                      </svg>
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 48, height: 48, marginBottom: 8 }}>
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                      <span>Choose photo</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                />
              </div>
              <div className="profile-info">
                <span className="profile-badge">Profile</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <h1 className="profile-name">{fullProfile?.displayName || fullProfile?.username || user?.username || 'User'}</h1>
                  <button
                    onClick={handleOpenEditProfile}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: '#fff',
                      borderRadius: '500px',
                      padding: '6px 18px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: '0.5px',
                      transition: 'border-color 0.2s, transform 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    Edit profile
                  </button>
                </div>
                {fullProfile?.bio && (
                  <p style={{ color: '#b3b3b3', fontSize: '14px', margin: '6px 0 0 0', maxWidth: '400px' }}>{fullProfile.bio}</p>
                )}
                <div style={{ display: 'flex', gap: '8px', color: '#fff', fontSize: '14px', fontWeight: 500, marginTop: '8px' }}>
                  <span 
                    style={{ cursor: 'pointer', transition: 'text-decoration 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    onClick={() => { setFollowModalTab('followers'); setIsFollowModalOpen(true); }}
                  >
                    {fullProfile?.followersCount || 0} Followers
                  </span>
                  <span>•</span>
                  <span 
                    style={{ cursor: 'pointer', transition: 'text-decoration 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    onClick={() => { setFollowModalTab('following'); setIsFollowModalOpen(true); }}
                  >
                    {fullProfile?.followingCount || 0} Following
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-body">
            <div className="profile-actions">
              <div className="profile-action-card" onClick={() => navigate('/playlist/liked')}>
                <div className="card-icon liked-songs">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <div className="card-info">
                  <div className="card-title">Liked song</div>
                  <div className="card-subtitle">{likedSongs?.length || 0} song{(likedSongs?.length || 0) !== 1 ? 's' : ''}</div>
                </div>
              </div>

              <div className="profile-action-card" onClick={() => navigate('/history')}>
                <div className="card-icon recently-played">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
                  </svg>
                </div>
                <div className="card-info">
                  <div className="card-title">Recently played</div>
                  <div className="card-subtitle">{recentlyPlayedCount} song{recentlyPlayedCount !== 1 ? 's' : ''}</div>
                </div>
              </div>

              <div className="profile-action-card" onClick={() => setIsUploadedModalOpen(true)}>
                <div className="card-icon uploaded">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 14V3m0 0l-4 4m4-4l4 4" />
                    <path d="M6 16.5a6 6 0 0 0 12 0" />
                  </svg>
                </div>
                <div className="card-info">
                  <div className="card-title">Uploaded</div>
                  <div className="card-subtitle">{uploadedSongs.length} item{uploadedSongs.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>

            {/* SECTION YOUR PLAYLISTS */}
            {myPlaylists.length > 0 && (
              <div className="profile-section">
                <div className="profile-section-header">
                  <h2 className="profile-section-title">Your Playlists</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px', paddingTop: '8px' }}>
                  {myPlaylists.map(playlist => (
                    <div 
                      key={playlist.id} 
                      onClick={() => navigate(`/playlist/${playlist.id}`)}
                      style={{ backgroundColor: '#181818', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.3s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#282828'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#181818'}
                    >
                      <img 
                        src={playlist.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop'} 
                        alt={playlist.name} 
                        style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '4px', marginBottom: '16px' }} 
                      />
                      <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{playlist.name}</h3>
                      <p style={{ color: '#b3b3b3', fontSize: '14px', margin: 0 }}>
                        {playlist.isPublic ? 'Public Playlist' : 'Private Playlist'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* SECTION FOLLOWING ARTISTS */}
            {followingArtists.length > 0 && (
              <div className="profile-section">
                <div className="profile-section-header">
                  <h2 className="profile-section-title">Following</h2>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', paddingTop: '8px' }}>
                  {followingArtists.map((artist) => (
                    <div key={artist.artistId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', width: '150px' }}>
                      <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', background: '#282828' }}>
                        {artist.coverUrl ? (
                          <img src={artist.coverUrl} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #535353, #282828)' }}>
                            <svg viewBox="0 0 24 24" width="60" height="60" fill="#b3b3b3">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{artist.name}</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#b3b3b3' }}>Artist</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Footer />
          </div>
        </div>
      </div>

      {isLoggedIn && <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />}
      {isLoggedIn ? <PlayerBar /> : <AuthBanner />}

      {user?.id && (
        <FollowListModal
          isOpen={isFollowModalOpen}
          onClose={() => setIsFollowModalOpen(false)}
          userId={user.id}
          initialTab={followModalTab}
        />
      )}

      {isUploadedModalOpen && (
        <div className="auth-modal-overlay" onClick={() => setIsUploadedModalOpen(false)} style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="auth-modal-content" onClick={e => e.stopPropagation()} style={{ width: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', background: '#181818', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
            <div className="follow-modal-header" style={{ padding: '24px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', color: '#fff' }}>Uploaded Items</h2>
                <button onClick={() => { setIsUploadedModalOpen(false); navigate('/upload'); }} style={{ background: '#1db954', color: '#000', border: 'none', borderRadius: '500px', padding: '6px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  Upload New
                </button>
              </div>
              <button className="close-modal-btn" onClick={() => setIsUploadedModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div className="follow-modal-body" style={{ padding: '0 24px 24px 24px', overflowY: 'auto', flex: 1 }}>
              {uploadedSongs.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#b3b3b3' }}>
                  No uploaded items yet.
                </div>
              ) : (
                <div className="profile-tracks-list" style={{ marginTop: '16px' }}>
                  {uploadedSongs.map((song, index) => {
                    const isActive = currentSong?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        className="profile-track-item"
                        onClick={(e) => handleForcePlay(e, song, index)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenuState({ song, x: e.clientX, y: e.clientY });
                        }}
                        style={{ padding: '8px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                      >
                        <div className="track-col track-index" style={{ width: '40px', textAlign: 'center' }}>
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
                        <div className="track-col track-info" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={song.coverUrl || `https://picsum.photos/seed/${song.id}/40/40`}
                            alt={song.title}
                            className="track-cover"
                            style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                          <div className="track-text">
                            <div className="track-title" style={{ color: isActive ? '#1db954' : '#fff', fontWeight: 500 }}>{song.title}</div>
                            <div className="track-artist" style={{ color: '#b3b3b3', fontSize: '14px' }}>{song.artist}</div>
                          </div>
                        </div>
                        <div className="track-col" style={{ width: '120px', color: '#b3b3b3', fontSize: '14px' }}>
                          {song.categoryName || 'Unknown Category'}
                        </div>
                        <div className="track-col" style={{ width: '100px', textAlign: 'right', color: '#b3b3b3', fontSize: '14px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                          <span>{song.createdAt ? new Date(song.createdAt).toLocaleDateString() : 'N/A'}</span>
                          {/* Nút xóa cũ bị thay thế bởi context menu */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {contextMenuState && (
        <div 
          style={{ 
            position: 'fixed', top: contextMenuState.y, left: contextMenuState.x, 
            background: '#282828', borderRadius: '4px', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 11000 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: '#fff', textAlign: 'left', cursor: 'pointer', fontSize: '14px' }}
            onMouseEnter={e => e.currentTarget.style.background = '#3e3e3e'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            onClick={() => {
              setContextMenuState(null);
              setIsUploadedModalOpen(false);
              navigate('/upload', { state: { editSong: contextMenuState.song } });
            }}
          >
            Sửa bài hát
          </button>
          <button 
            style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: '#ff4d4d', textAlign: 'left', cursor: 'pointer', fontSize: '14px' }}
            onMouseEnter={e => e.currentTarget.style.background = '#3e3e3e'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            onClick={() => {
              handleDeleteUploadedSong(contextMenuState.song.id);
              setContextMenuState(null);
            }}
          >
            Xóa bài hát
          </button>
        </div>
      )}

      {/* ===== MODAL EDIT PROFILE ===== */}
      {isEditProfileOpen && (
        <div
          onClick={() => setIsEditProfileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 20000,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#282828', borderRadius: '12px',
              padding: '32px', width: '440px', maxWidth: '90vw',
              boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
              display: 'flex', flexDirection: 'column', gap: '24px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '24px', fontWeight: 700 }}>Edit profile</h2>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '4px' }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#b3b3b3', fontSize: '13px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={e => setEditDisplayName(e.target.value)}
                  maxLength={50}
                  placeholder="Tên hiển thị..."
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#3e3e3e', border: '1px solid #535353',
                    borderRadius: '6px', padding: '12px 16px',
                    color: '#fff', fontSize: '15px', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#fff'}
                  onBlur={e => e.currentTarget.style.borderColor = '#535353'}
                />
                <p style={{ margin: '6px 0 0 0', color: '#b3b3b3', fontSize: '12px' }}>
                  {editDisplayName.length}/50
                </p>
              </div>

              <div>
                <label style={{ display: 'block', color: '#b3b3b3', fontSize: '13px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Bio
                </label>
                <textarea
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  maxLength={200}
                  placeholder="Giới thiệu bản thân..."
                  rows={3}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#3e3e3e', border: '1px solid #535353',
                    borderRadius: '6px', padding: '12px 16px',
                    color: '#fff', fontSize: '15px', outline: 'none',
                    resize: 'vertical', fontFamily: 'inherit',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#fff'}
                  onBlur={e => e.currentTarget.style.borderColor = '#535353'}
                />
                <p style={{ margin: '6px 0 0 0', color: '#b3b3b3', fontSize: '12px' }}>
                  {editBio.length}/200
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                style={{
                  background: 'none', border: 'none', color: '#fff',
                  padding: '12px 24px', borderRadius: '500px',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#3e3e3e'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile || !editDisplayName.trim()}
                style={{
                  background: isSavingProfile ? '#535353' : '#1db954',
                  border: 'none', color: '#000',
                  padding: '12px 32px', borderRadius: '500px',
                  fontSize: '14px', fontWeight: 700, cursor: isSavingProfile ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s, transform 0.1s',
                  opacity: !editDisplayName.trim() ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!isSavingProfile && editDisplayName.trim()) e.currentTarget.style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isSavingProfile ? 'Đang lưu...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
