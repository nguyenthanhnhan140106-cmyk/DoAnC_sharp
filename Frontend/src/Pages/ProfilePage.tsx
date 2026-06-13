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
import type { Song, UserProfile } from '../types';
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

  const fetchFollowing = React.useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await API.get('/follow/following');
      if (Array.isArray(res.data)) setFollowingArtists(res.data);
    } catch { /* no-op */ }
  }, [isLoggedIn]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  useEffect(() => {
    songService.getAllSongs()
      .then((list: unknown) => {
        //chỗ này vẫn là random để lấy top nhạc
        if (Array.isArray(list)) setSongs(list.slice(0, 4));
      })
      .catch((err: unknown) => console.error('❌ Lỗi:', err));

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
    window.addEventListener('followUpdated', handleFollowUpdate);
    return () => window.removeEventListener('followUpdated', handleFollowUpdate);
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 48, height: 48, marginBottom: 8 }}>
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  <span>Choose photo</span>
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
                <h1 className="profile-name">{user?.username || 'User'}</h1>
                <div style={{ display: 'flex', gap: '8px', color: '#fff', fontSize: '14px', fontWeight: 500, marginTop: '8px' }}>
                  <span 
                    style={{ cursor: 'pointer', transition: 'text-decoration 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    onClick={() => { setFollowModalTab('followers'); setIsFollowModalOpen(true); }}
                  >
                    {fullProfile?.totalFollowers || 0} Followers
                  </span>
                  <span>•</span>
                  <span 
                    style={{ cursor: 'pointer', transition: 'text-decoration 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    onClick={() => { setFollowModalTab('following'); setIsFollowModalOpen(true); }}
                  >
                    {fullProfile?.totalFollowing || 0} Following
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

              <div className="profile-action-card">
                <div className="card-icon uploaded">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 14V3m0 0l-4 4m4-4l4 4" />
                    <path d="M6 16.5a6 6 0 0 0 12 0" />
                  </svg>
                </div>
                <div className="card-info">
                  <div className="card-title">Uploaded</div>
                  <div className="card-subtitle">0 song • 0 video</div>
                </div>
              </div>
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
    </div>
  );
}
