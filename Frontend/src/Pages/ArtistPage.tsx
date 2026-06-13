import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../Services/api";
import { useMusic } from "../Contexts/MusicContext";
import { useAuth } from "../Contexts/AuthContext";
import "../Components/Styles/HomePage.css"; // Reuse existing styles
import "../Components/Styles/ProfilePage.css"; // For banner and header styles
import Header from '../Components/header';
import Sidebar from '../Components/Sidebar';
import PlayerBar from '../Components/PlayerBar';
import RightSidebar from '../Components/RightSidebar';
import Footer from '../Components/Footer';
import LyricsView from '../Components/LyricsView';

import type { Song } from '../types';

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<{ id: number, name: string, bannerUrl?: string, followers: number } | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const { playSong, setQueue, isLyricsViewOpen } = useMusic();
  const { isLoggedIn, user, openAuthModal } = useAuth();
  
  // Trạng thái thu gọn Sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        // Fetch artist info
        const artistRes = await API.get(`/artists/${id}`);
        setArtist(artistRes.data);

        // Fetch artist songs
        const songsRes = await API.get(`/artists/${id}/songs`);
        setSongs(songsRes.data);

        // Fetch follow status if logged in
        if (isLoggedIn && user) {
          const followRes = await API.get(`/follow/check/${id}`);
          setIsFollowing(followRes.data.isFollowing);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin nghệ sĩ:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArtistData();
    }
  }, [id, isLoggedIn, user]);

  const handlePlayArtist = () => {
    if (songs.length > 0) {
      setQueue(songs);
      playSong(songs[0]);
    }
  };

  const handleFollowToggle = async () => {
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    try {
      if (isFollowing) {
        await API.delete(`/follow/${id}`);
        setIsFollowing(false);
        setArtist(prev => prev ? ({ ...prev, followers: Math.max(0, prev.followers - 1) }) : prev);
        window.dispatchEvent(new CustomEvent('SHOW_LIBRARY_TOAST', { detail: { message: 'Removed from your library' } }));
      } else {
        await API.post(`/follow/${id}`);
        setIsFollowing(true);
        setArtist(prev => prev ? ({ ...prev, followers: prev.followers + 1 }) : prev);
        window.dispatchEvent(new CustomEvent('SHOW_LIBRARY_TOAST', { detail: { message: 'Added to your library' } }));
      }
      window.dispatchEvent(new Event('followUpdated'));
    } catch (err) {
      console.error("Lỗi follow:", err);
    }
  };

  if (loading) {
    return <div style={{ color: "white", padding: "24px" }}>Đang tải...</div>;
  }

  if (!artist) {
    return <div style={{ color: "white", padding: "24px" }}>Không tìm thấy nghệ sĩ này.</div>;
  }

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
                backgroundImage: artist.bannerUrl ? `url(${artist.bannerUrl})` : "linear-gradient(transparent 0, rgba(0,0,0,0.5) 100%), linear-gradient(135deg, #2b2e3a, #1a1a1a)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "flex-end",
                padding: "24px",
                boxShadow: "inset 0 -100px 100px -20px rgba(0,0,0,0.8)"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative", top: "10px" }}>
                <h1 style={{ margin: 0, fontSize: "96px", fontWeight: 800, color: "white", letterSpacing: "-3px", lineHeight: "1" }}>
                  {artist.name}
                </h1>
                <p style={{ margin: 0, fontSize: "16px", color: "#fff", fontWeight: 500 }}>
                  {artist.followers ? artist.followers.toLocaleString() : "0"} followers
                </p>
              </div>
            </div>

            <div style={{ padding: "24px", background: "linear-gradient(rgba(0,0,0,0.6) 0, #121212 100%)", minHeight: "calc(100vh - 340px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "32px", marginBottom: "32px" }}>
                <button 
                  onClick={handlePlayArtist}
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "#1ed760",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 8px 8px rgba(0,0,0,0.3)"
                  }}
                >
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="black">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                
                <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "#b3b3b3" }} title="Shuffle">
                  <svg viewBox="0 0 16 16" width="32" height="32" fill="currentColor"><path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5zM6.417 8.04l.978-1.166 1.796 2.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 0 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 11H11.16a3.75 3.75 0 0 1-2.873-1.34l-1.87-2.22z" /></svg>
                </button>

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
              </div>

              <h2 style={{ fontSize: "24px", fontWeight: 700, color: "white", marginBottom: "16px" }}>Popular</h2>
              
              {songs.length > 0 ? (
                <div className="songs-list" style={{ marginTop: 0 }}>
                  {songs.map((song, idx) => {
                    const streams = (12345678 * (idx + 1) + song.id * 876543) % 40000000;
                    const mins = 3 + (song.id % 2);
                    const secs = (song.id * 13) % 60;
                    const durationStr = `${mins}:${secs.toString().padStart(2, '0')}`;

                    return (
                      <div 
                        className="song-item" 
                        key={song.id} 
                        onClick={() => { setQueue(songs); playSong(song); }}
                        style={{ 
                          padding: "8px 16px", 
                          display: "grid", 
                          gridTemplateColumns: "32px 1fr 100px 50px", 
                          gap: "16px", 
                          alignItems: "center", 
                          borderRadius: "4px", 
                          cursor: "pointer" 
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <div style={{ color: "#b3b3b3", fontSize: "16px", textAlign: "right", fontWeight: 500 }}>{idx + 1}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <img src={song.coverUrl || '/placeholder.png'} alt="cover" style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover" }} />
                          <p style={{ margin: 0, fontSize: "16px", fontWeight: 500, color: "white" }}>{song.title}</p>
                        </div>
                        <div style={{ color: "#b3b3b3", fontSize: "14px", textAlign: "right" }}>
                          {streams.toLocaleString()}
                        </div>
                        <div style={{ color: "#b3b3b3", fontSize: "14px", textAlign: "right" }}>
                          {durationStr}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "#b3b3b3", fontSize: "14px" }}>Chưa có bài hát nào.</p>
              )}
            </div>
            <Footer />
          </div>
        )}
      </div>

      <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />
      <PlayerBar />
    </div>
  );
}
