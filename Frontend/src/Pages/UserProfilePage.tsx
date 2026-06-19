import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../Services/api";
import { useAuth } from "../Contexts/AuthContext";
import Header from '../Components/header';
import Sidebar from '../Components/Sidebar';
import PlayerBar from '../Components/PlayerBar';
import RightSidebar from '../Components/RightSidebar';
import Footer from '../Components/Footer';
import LyricsView from '../Components/LyricsView';
import FollowListModal from '../Components/FollowListModal';

import { useMusic } from "../Contexts/MusicContext";
import "../Components/Styles/HomePage.css";
import "../Components/Styles/ProfilePage.css";
import type { UserProfile, Playlist } from '../types';

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [publicPlaylists, setPublicPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const { isLoggedIn, user, openAuthModal } = useAuth();
  const { isLyricsViewOpen } = useMusic();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<'followers' | 'following'>('followers');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Fetch public user info
        const res = await API.get(`/users/${id}`);
        setProfileUser(res.data);

        // Check if currently following
        if (isLoggedIn) {
          const followRes = await API.get(`/follow/user/${id}/status`);
          setIsFollowing(followRes.data.isFollowing);
        }

        // Fetch public playlists
        const playlistsRes = await API.get(`/playlists/user/${id}`);
        if (Array.isArray(playlistsRes.data)) {
          const isSelf = user?.id === parseInt(id || "0", 10);
          setPublicPlaylists(playlistsRes.data.filter((p: Playlist) => p.isPublic || isSelf));
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, isLoggedIn]);

  const handleFollowToggle = async () => {
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    try {
      if (isFollowing) {
        await API.delete(`/follow/user/${id}`);
        setIsFollowing(false);
        setProfileUser(prev => prev ? { ...prev, followersCount: Math.max(0, prev.followersCount - 1) } : prev);
        window.dispatchEvent(new CustomEvent('SHOW_LIBRARY_TOAST', { detail: { message: 'Unfollowed user' } }));
      } else {
        await API.post(`/follow/user/${id}`);
        setIsFollowing(true);
        setProfileUser(prev => prev ? { ...prev, followersCount: prev.followersCount + 1 } : prev);
        window.dispatchEvent(new CustomEvent('SHOW_LIBRARY_TOAST', { detail: { message: 'Followed user' } }));
      }
      window.dispatchEvent(new Event('followUpdated'));
    } catch (err: any) {
      console.error("Lỗi follow user:", err);
      if (err.response?.status === 400) {
        alert(err.response.data);
      }
    }
  };

  if (loading) {
    return <div className="home-container"><div className="loading-spinner"></div></div>;
  }

  if (!profileUser) {
    return <div className="home-container"><h2 style={{color:'white', padding: 20}}>User not found</h2></div>;
  }

  const isSelf = user?.id === parseInt(id || "0", 10);

  return (
    <div className={`spotify-layout ${isSidebarCollapsed ? 'sidebar-hidden' : ''} ${!isLoggedIn || isRightCollapsed ? 'right-hidden' : ''}`}>
      <Header />
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <div className="main-view">
        {isLyricsViewOpen ? (
          <LyricsView />
        ) : (
          <div className="content-wrapper" style={{ padding: 0 }}>
            <div 
              style={{
                position: "relative",
                height: "340px",
                background: "linear-gradient(transparent 0, rgba(0,0,0,0.5) 100%), linear-gradient(135deg, #535353, #1a1a1a)",
                display: "flex",
                alignItems: "flex-end",
                padding: "24px",
                boxShadow: "inset 0 -100px 100px -20px rgba(0,0,0,0.8)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "24px", position: "relative", top: "10px" }}>
                <div style={{
                  width: "232px", height: "232px", borderRadius: "50%",
                  backgroundImage: profileUser.avatarUrl ? `url(${profileUser.avatarUrl})` : "none",
                  backgroundColor: "#282828", backgroundSize: "cover", backgroundPosition: "center",
                  boxShadow: "0 4px 60px rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {!profileUser.avatarUrl && (
                    <svg viewBox="0 0 24 24" width="80" height="80" fill="#b3b3b3">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "14px", color: "white", fontWeight: 700 }}>Profile</span>
                  <h1 style={{ margin: 0, fontSize: "96px", fontWeight: 800, color: "white", letterSpacing: "-3px", lineHeight: "1" }}>
                    {profileUser.username}
                  </h1>
                  <div style={{ display: 'flex', gap: '8px', color: '#fff', fontSize: '14px', fontWeight: 500, marginTop: '8px' }}>
                    <span 
                      style={{ cursor: 'pointer', transition: 'text-decoration 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                      onClick={() => { setFollowModalTab('followers'); setIsFollowModalOpen(true); }}
                    >
                      {profileUser.followersCount || 0} Followers
                    </span>
                    <span>•</span>
                    <span 
                      style={{ cursor: 'pointer', transition: 'text-decoration 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                      onClick={() => { setFollowModalTab('following'); setIsFollowModalOpen(true); }}
                    >
                      {profileUser.followingCount || 0} Following
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "24px", background: "linear-gradient(rgba(0,0,0,0.6) 0, #121212 100%)", minHeight: "calc(100vh - 340px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "32px", marginBottom: "32px" }}>
                {!isSelf && (
                  <button 
                    onClick={handleFollowToggle}
                    style={{
                      background: "transparent",
                      border: "1px solid #727272",
                      borderRadius: "32px",
                      color: "white",
                      padding: "6px 15px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      letterSpacing: "1px"
                    }}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
              </div>

              <h2 style={{ fontSize: "24px", fontWeight: 700, color: "white", marginBottom: "16px" }}>Public Playlists</h2>
              {publicPlaylists.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
                  {publicPlaylists.map(playlist => (
                    <div 
                      key={playlist.id} 
                      onClick={() => window.location.href = `/playlist/${playlist.id}`}
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
              ) : (
                <p style={{ color: "#b3b3b3", fontSize: "14px" }}>Người dùng này chưa có playlist công khai nào.</p>
              )}
            </div>
            <Footer />
          </div>
        )}
      </div>

      <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />
      <PlayerBar />

      {profileUser && (
        <FollowListModal
          isOpen={isFollowModalOpen}
          onClose={() => setIsFollowModalOpen(false)}
          userId={profileUser.id}
          initialTab={followModalTab}
        />
      )}
    </div>
  );
}
