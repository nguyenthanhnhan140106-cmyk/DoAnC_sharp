import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { useMusic } from "../Contexts/MusicContext";
import API from "../Services/api";
import { libraryService } from "../Services/libraryService";
import type { SavedAlbum } from "../Services/libraryService";
import type { Playlist, FollowedArtist } from "../types";
import "./Styles/HomePage.css";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { isLoggedIn, user } = useAuth();
  const { likedSongs, setQueue, playSong } = useMusic();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    if (user && user.id) {
      const cached = localStorage.getItem(`sidebar_playlists_${user.id}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch { /* ignore error */ }
      }
    }
    return [];
  });
  const [savedAlbums, setSavedAlbums] = useState<SavedAlbum[]>([]);
  const [followedArtists, setFollowedArtists] = useState<FollowedArtist[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, playlistId: number | string } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [libraryToast, setLibraryToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPlaylists = async () => {
    try {
      const res = await API.get(`/playlists/user/${user?.id}`);
      const data = res.data;
      setPlaylists(data);
      localStorage.setItem(`sidebar_playlists_${user?.id}`, JSON.stringify(data));
    } catch {
      // ignore
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const fetchSavedAlbums = async () => {
    try {
      const albums = await libraryService.getSavedAlbums();
      setSavedAlbums(albums);
    } catch (err) {
      console.error("Lỗi lấy danh sách album đã lưu:", err);
    }
  };

  const fetchFollowedArtists = async () => {
    try {
      const res = await API.get(`/follow/following?t=${new Date().getTime()}`);
      if (Array.isArray(res.data)) {
        setFollowedArtists(res.data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách nghệ sĩ follow:", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchPlaylists();
      fetchSavedAlbums();
      fetchFollowedArtists();
    } else {
      setPlaylists([]);
      setSavedAlbums([]);
      setFollowedArtists([]);
      setIsLoadingPlaylists(false);
    }

    const handlePlaylistUpdate = () => {
      if (isLoggedIn && user) fetchPlaylists();
    };
    const handleLibraryUpdate = () => {
      if (isLoggedIn && user) fetchSavedAlbums();
    };
    const handleFollowUpdate = () => {
      if (isLoggedIn && user) {
        fetchFollowedArtists();
      }
    };

    window.addEventListener('playlistUpdated', handlePlaylistUpdate);
    window.addEventListener('libraryUpdated', handleLibraryUpdate);
    window.addEventListener('followUpdated', handleFollowUpdate);

    const handleLibraryToast = (e: Event) => {
      const msg = (e as CustomEvent).detail?.message || '';
      setLibraryToast({ message: msg, visible: true });
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setLibraryToast({ message: '', visible: false }), 3000);
    };
    window.addEventListener('SHOW_LIBRARY_TOAST', handleLibraryToast);

    return () => {
      window.removeEventListener('playlistUpdated', handlePlaylistUpdate);
      window.removeEventListener('libraryUpdated', handleLibraryUpdate);
      window.removeEventListener('followUpdated', handleFollowUpdate);
      window.removeEventListener('SHOW_LIBRARY_TOAST', handleLibraryToast);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user]);

  const handleCreatePlaylist = async () => {
    if (!isLoggedIn || !user) {
      alert("Vui lòng đăng nhập để tạo danh sách phát!");
      return;
    }

    setIsMenuOpen(false);

    // Tính toán số thứ tự tiếp theo cho Playlist
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
      const res = await API.post(`/playlists/user/${user.id}`, {
        name: `Playlist #${nextNumber}`,
        description: "",
        coverUrl: ""
      });

      const newPlaylist = res.data;
      const updated = [...playlists, newPlaylist];
      setPlaylists(updated);
      localStorage.setItem(`sidebar_playlists_${user.id}`, JSON.stringify(updated));
      navigate(`/playlist/${newPlaylist.id}`);
    } catch (err) {
      console.error("Có lỗi khi tạo danh sách phát:", err);
      alert("Có lỗi khi tạo danh sách phát.");
    }
  };

  const handleDeletePlaylist = async () => {
    if (!contextMenu || !contextMenu.playlistId) return;
    try {
      await API.delete(`/playlists/${contextMenu.playlistId}`);
      const updated = playlists.filter(p => p.id !== contextMenu.playlistId);
      setPlaylists(updated);
      if (user && user.id) {
        localStorage.setItem(`sidebar_playlists_${user.id}`, JSON.stringify(updated));
      }
      setContextMenu(null);
      window.dispatchEvent(new Event('playlistUpdated'));
      if (window.location.pathname === `/playlist/${contextMenu.playlistId}`) {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi xóa danh sách phát.");
    }
  };

  const handleNavigateToggle = (path: string) => {
    if (window.location.pathname === path) {
      navigate('/');
    } else {
      navigate(path);
    }
  };

  const handleDoublePlayLiked = () => {
    if (likedSongs && likedSongs.length > 0) {
      setQueue(likedSongs);
      playSong(likedSongs[0]);
    }
  };

  const handleDoublePlayPlaylist = async (plId: number) => {
    try {
      const res = await API.get(`/playlists/${plId}`);
      const data = res.data;
      if (data.songs && data.songs.length > 0) {
        setQueue(data.songs);
        playSong(data.songs[0]);
      }
    } catch (err) {
      console.error("Lỗi khi phát playlist:", err);
    }
  };

  // Click ra ngoài đóng menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
    <aside className={`spotify-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button
          className="library-btn"
          title={isCollapsed ? "Mở rộng Thư viện của bạn" : "Thu gọn Thư viện của bạn"}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z" />
          </svg>
          {!isCollapsed && <span className="library-text">Thư viện của bạn</span>}
        </button>

        {!isCollapsed && (
          <div className="header-actions">
            <div style={{ position: "relative" }} ref={menuRef}>
              <button className="icon-btn" title="Tạo danh sách phát hoặc thư mục" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z" /></svg>
              </button>

              {isMenuOpen && (
                <div style={{
                  position: "absolute", top: "120%", left: 0,
                  backgroundColor: "#282828", borderRadius: 4, padding: 4,
                  minWidth: 200, zIndex: 100, boxShadow: "0 16px 24px rgba(0,0,0,.3), 0 6px 8px rgba(0,0,0,.2)"
                }}>
                  <button onClick={handleCreatePlaylist} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px", width: "100%",
                    background: "transparent", border: "none", color: "#fff", cursor: "pointer",
                    textAlign: "left", borderRadius: 2
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z" /></svg>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Playlist</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#b3b3b3" }}>Create a playlist with songs or episodes</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
            {/* Đã xóa nút Mũi tên (Hiện thêm) */}
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="sidebar-filters">
          <button className="filter-chip">Playlists</button>
        </div>
      )}

      {!isCollapsed && (
        <div className="sidebar-search-sort">
          <button className="search-btn" title="Tìm kiếm trong Thư viện">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M7 1.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5zM.25 7a6.75 6.75 0 1 1 12.096 4.12l3.184 3.185a.75.75 0 1 1-1.06 1.06L11.304 12.2A6.75 6.75 0 0 1 .25 7z" /></svg>
          </button>
          <button className="sort-btn">
            <span>Recents</span>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M15 14.5H5V13h10v1.5zm0-5.75H5v-1.5h10v1.5zM15 3H5V1.5h10V3zM3 3H1V1.5h2V3zm0 5.75H1v-1.5h2v1.5zm0 5.75H1V13h2v1.5z" /></svg>
          </button>
        </div>
      )}

      <div className="sidebar-content">
        <div
          className="playlist-item"
          title="Liked Songs"
          onClick={() => handleNavigateToggle('/playlist/liked')}
          onDoubleClick={handleDoublePlayLiked}
        >
          <div className="playlist-cover default-cover" style={{ background: 'linear-gradient(135deg, #450af5, #8e8ee5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
          </div>
          {!isCollapsed && (
            <div className="playlist-info">
              <p className="playlist-title">Liked Songs</p>
              <p className="playlist-subtitle">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="#1db954" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}>
                  <path d="M8.822.797a2.72 2.72 0 013.847 0l2.534 2.533a2.72 2.72 0 010 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 01-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337L8.822.797z"></path>
                </svg>
                Playlist • {likedSongs?.length || 0} song{likedSongs?.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {isLoggedIn && (
          <div
            className="playlist-item"
            title="Listening history"
            onClick={() => handleNavigateToggle('/history')}
          >
            <div className="playlist-cover default-cover" style={{ background: 'linear-gradient(135deg, #1db954, #1ed760)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1zm1.5 12.25h-4a.5.5 0 0 1 0-1h3.5V6.5a.5.5 0 0 1 1 0v6.75z" /></svg>
            </div>
            {!isCollapsed && (
              <div className="playlist-info">
                <p className="playlist-title">History</p>
                <p className="playlist-subtitle">Recently played</p>
              </div>
            )}
          </div>
        )}

        {/* Section Albums đã lưu vào thư viện */}
        {isLoggedIn && savedAlbums.length > 0 && savedAlbums.map((album) => (
          <div
            key={`album-${album.id}`}
            className="playlist-item"
            title={album.title}
            onClick={() => navigate(`/album/${album.id}`)}
          >
            <div
              className="playlist-cover default-cover"
              style={album.coverUrl
                ? { backgroundImage: `url(${album.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: 'linear-gradient(135deg, #5038a0, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
              }
            >
              {!album.coverUrl && (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              )}
            </div>
            {!isCollapsed && (
              <div className="playlist-info">
                <p className="playlist-title">{album.title}</p>
                <p className="playlist-subtitle">Album • {album.artistName}</p>
              </div>
            )}
          </div>
        ))}

        {isLoggedIn && followedArtists.length > 0 && followedArtists.map((artist) => (
          <div
            key={`artist-${artist.artistId}`}
            className="playlist-item"
            title={artist.artistName}
            onClick={() => {
              const targetPath = `/artist/${artist.artistId}`;
              if (location.pathname === targetPath) {
                navigate("/");
              } else {
                navigate(targetPath);
              }
            }}
          >
            <div
              className="playlist-cover default-cover"
              style={artist.imageUrl
                ? { backgroundImage: `url(${artist.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '50%' }
                : { background: 'linear-gradient(135deg, #a03850, #f65c8b)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }
              }
            >
              {!artist.imageUrl && (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              )}
            </div>
            {!isCollapsed && (
              <div className="playlist-info">
                <p className="playlist-title">{artist.artistName}</p>
                <p className="playlist-subtitle">Artist</p>
              </div>
            )}
          </div>
        ))}

        {playlists.map((pl) => (
          <div
            key={pl.id}
            className="playlist-item"
            title={pl.name}
            onClick={() => handleNavigateToggle(`/playlist/${pl.id}`)}
            onDoubleClick={() => handleDoublePlayPlaylist(pl.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, playlistId: pl.id });
            }}
          >
            <div className="playlist-cover default-cover" style={pl.coverUrl ? { backgroundImage: `url(${pl.coverUrl})`, backgroundSize: 'cover' } : {}}>
              {!pl.coverUrl && <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 1 0 1.5 1.5v-1.5zm13-11.667H8v11.667h1.5a1.5 1.5 0 1 0 1.5 1.5v-13.167H19V5z" /></svg>}
            </div>
            {!isCollapsed && (
              <div className="playlist-info">
                <p className="playlist-title">{pl.name}</p>
                <p className="playlist-subtitle">Playlist • {pl.creatorName || "Nam"}</p>
              </div>
            )}
          </div>
        ))}
        {!isLoadingPlaylists && playlists.length === 0 && !isCollapsed && (
          <div style={{ padding: "0 16px", color: "#b3b3b3", fontSize: 13, marginTop: 12 }}>
            Chưa có danh sách phát nào. Bấm dấu + để tạo.
          </div>
        )}
      </div>

      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: '#282828',
            borderRadius: 4,
            padding: 4,
            minWidth: 220,
            zIndex: 1000,
            boxShadow: '0 16px 24px rgba(0,0,0,.3), 0 6px 8px rgba(0,0,0,.2)'
          }}
        >
          <ul className="album-dropdown-menu" style={{ position: 'static', padding: 0, margin: 0, border: 'none', boxShadow: 'none' }}>
            <li onClick={() => { alert('Add playlist to queue functionality is under development'); setContextMenu(null); }}>
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M16 15H2v-1.5h14V15zm0-4.5H2V9h14v1.5zm-8.034-6A5.484 5.484 0 017.187 3H14V1.5H7.187a5.484 5.484 0 01.779-1.5H16v6H7.966zM2 2V.5h3.5v6H2v-1.5H.5V2H2z" /></svg>
              Add to queue
            </li>
            <li onClick={() => { alert('Add to playlist functionality is under development'); setContextMenu(null); }}>
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M15 15H1v-1.5h14V15zm0-4.5H1V9h14v1.5zm-8.034-6A5.484 5.484 0 016.187 3H13V1.5H6.187a5.484 5.484 0 01.779-1.5H15v6H6.966zM1 2V.5h3.5v6H1v-1.5H.5V2H1z" /></svg>
              Add to playlist
            </li>
            <li className="album-dropdown-divider"></li>
            <li onClick={handleDeletePlaylist}>
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M15.53 2.47a.75.75 0 0 1 0 1.06L6.53 12.53a.75.75 0 0 1-1.06 0L1.47 8.53a.75.75 0 0 1 1.06-1.06l3.47 3.47 8.47-8.47a.75.75 0 0 1 1.06 0z" /></svg>
              Delete
            </li>
          </ul>
        </div>
      )}
    </aside>

      {/* TOAST THÔNG BÁO FOLLOW/UNFOLLOW */}
      {libraryToast.visible && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '24px',
          backgroundColor: '#1db954',
          color: '#000',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideUpFade 0.3s ease',
          pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
          {libraryToast.message}
        </div>
      )}
    </>
  );
}