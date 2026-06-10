import { useState, useRef, useEffect } from 'react';
import { useMusic } from '../Contexts/MusicContext';
import LyricsView from './LyricsView';
import type { Song } from '../hooks/useAudioPlayer';
import './Styles/HomePage.css';

interface RightSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function RightSidebar({ isCollapsed, setIsCollapsed }: RightSidebarProps) {
  // Lấy chính xác các thuộc tính điều khiển từ MusicContext
  const musicContext = useMusic() as any;
  const currentSong = musicContext?.currentSong;
  const isPlaying = musicContext?.isPlaying;
  const togglePlay = musicContext?.togglePlay;
  const pauseSong = musicContext?.pauseSong; // Lấy thêm hàm pause chủ động nếu có
  const queue = musicContext?.queue || [];
  const isQueueViewOpen = musicContext?.isQueueViewOpen || false;
  const toggleQueueView = musicContext?.toggleQueueView;
  const isLyricsViewOpen = musicContext?.isLyricsViewOpen || false;
  const toggleLyricsView = musicContext?.toggleLyricsView;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isRecentViewOpen, setIsRecentViewOpen] = useState(false);
  const [recentSongs, setRecentSongs] = useState<any[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [recentError, setRecentError] = useState<string | null>(null);

  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close more menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sử dụng ref để nhớ trạng thái nhạc trước khi bật MV
  const wasPlayingBeforeVideo = useRef(false);

  // 🟢 Lắng nghe sự kiện bật Video từ các nơi khác (như trang chủ)
  useEffect(() => {
    const handleOpenVideoModal = () => {
      wasPlayingBeforeVideo.current = true; // Lưu cờ
      setIsVideoOpen(true);
    };
    window.addEventListener('OPEN_VIDEO_MODAL', handleOpenVideoModal);
    return () => window.removeEventListener('OPEN_VIDEO_MODAL', handleOpenVideoModal);
  }, []);

  // 🟢 Fetch recently played songs
  useEffect(() => {
    if (!isRecentViewOpen) return;

    // 🔥 NGAY LẬP TỨC: Show local recentlyPlayed từ context (real-time, không chờ backend)
    const localRecent = musicContext?.recentlyPlayed || [];
    setRecentSongs(localRecent);
    setRecentError(null);

    const controller = new AbortController();

    const fetchRecent = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return; // Dùng local data là đủ nếu không có token
        }

        const url = 'http://localhost:5000/api/history/recent?limit=10';

        const response = await fetch(url, {
          method: "GET",
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          return; // Dùng local data
        }

        if (!response.ok) {
          const bodyText = await response.text().catch(() => '');
          console.error('Recent API error:', response.status, bodyText);
          return; // Dùng local data nếu backend fail
        }

        const data = await response.json();

        const payload = Array.isArray(data)
          ? data
          : Array.isArray(data?.songs)
          ? data.songs
          : [];

        const parsed: Song[] = payload.map((item: any) => ({
          id: Number(item.id),
          title: item.title ?? item.name ?? 'Unknown title',
          artist: item.artist ?? item.artistName ?? 'Unknown artist',
          coverUrl: item.coverUrl ?? item.imageUrl ?? undefined,
          audioUrl: item.audioUrl ?? undefined,
        }));

        setRecentSongs(parsed);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to load recent songs:', err);
          // Giữ local data, không cần show error
        }
      }
    };

    // Fetch backend để sync (không blocking, optional)
    fetchRecent();

    return () => controller.abort();
  }, [isRecentViewOpen, currentSong?.id, musicContext?.recentlyPlayed]);

  useEffect(() => {
    if (!isRecentViewOpen) return;
    if (isQueueViewOpen && toggleQueueView) toggleQueueView();
    if (isLyricsViewOpen && toggleLyricsView) toggleLyricsView();
  }, [isRecentViewOpen, isQueueViewOpen, isLyricsViewOpen, toggleQueueView, toggleLyricsView]);

  useEffect(() => {
    if (isQueueViewOpen || isLyricsViewOpen) {
      setIsRecentViewOpen(false);
    }
  }, [isQueueViewOpen, isLyricsViewOpen]);

  if (!currentSong) {
    return (
      <aside className={`spotify-right-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="right-sidebar-no-song-wrapper" style={{ textAlign: 'center', padding: '20px', color: '#b3b3b3' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Chưa phát bài nào</h3>
          <p style={{ fontSize: '14px', margin: 0 }}>Hãy chọn 1 bài hát dưới playlist nhen Nam!</p>
        </div>
        {isCollapsed && (
          <button className="right-expand-btn" onClick={() => setIsCollapsed(false)} title="Mở rộng">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M11.03 1.97a.75.75 0 0 1 0 1.06L5.56 8l5.47 5.47a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0z" />
            </svg>
          </button>
        )}
      </aside>
    );
  }

  if (isQueueViewOpen || isLyricsViewOpen || isRecentViewOpen) {
    // Handler to switch between tabs
    const handleShowRecentView = () => {
      if (isQueueViewOpen && toggleQueueView) toggleQueueView();
      if (isLyricsViewOpen && toggleLyricsView) toggleLyricsView();
      setIsRecentViewOpen(true);
    };

    const handleShowQueueView = () => {
      if (!isQueueViewOpen && toggleQueueView) toggleQueueView();
      setIsRecentViewOpen(false);
    };

    const currentIndex = queue.findIndex((s: any) => s?.id === currentSong?.id);
    const nextUpQueue = currentIndex !== -1 ? queue.slice(currentIndex + 1) : queue;

    // Show Recently Viewed
    if (isRecentViewOpen && !isQueueViewOpen && !isLyricsViewOpen) {
      return (
        <aside className={`spotify-right-sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{ padding: '24px 16px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #282828', flex: 1 }}>
              <button
                onClick={handleShowQueueView}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#b3b3b3',
                  fontSize: '14px',
                  fontWeight: 700,
                  padding: '12px 8px',
                  cursor: 'pointer',
                  borderBottom: '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                Queue
              </button>
              <button
                onClick={handleShowRecentView}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#1db954',
                  fontSize: '14px',
                  fontWeight: 700,
                  padding: '12px 8px',
                  cursor: 'pointer',
                  borderBottom: '2px solid #1db954'
                }}
              >
                Recently Played
              </button>
            </div>
            <button onClick={() => setIsRecentViewOpen(false)} style={{ background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '4px' }}>
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z" />
              </svg>
            </button>
          </div>

          {/* Recently Played Content */}
          <div>
            {isLoadingRecent ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#b3b3b3', fontSize: '14px' }}>
                Đang tải bài gần đây...
              </div>
            ) : recentError ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#ff4444', fontSize: '14px' }}>
                {recentError}
              </div>
            ) : recentSongs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#b3b3b3', fontSize: '14px' }}>
                Chưa có bài gần đây
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentSongs.map((song: any, idx: number) => (
                  <div
                    key={`${song.id}-${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s',
                      backgroundColor: 'transparent'
                    }}
                    onClick={() => musicContext?.playSong(song)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <img
                      src={song.coverUrl || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop`}
                      alt={song.title}
                      style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {song.title}
                      </p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#b3b3b3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {song.artist}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      );
    }

    // Show Queue (original view with tab)
    return (
      <aside className={`spotify-right-sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{ padding: '24px 16px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #282828', flex: 1 }}>
            <button
              onClick={() => {}}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1db954',
                fontSize: '14px',
                fontWeight: 700,
                padding: '12px 8px',
                cursor: 'pointer',
                borderBottom: '2px solid #1db954'
              }}
            >
              Queue
            </button>
            <button
              onClick={handleShowRecentView}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#b3b3b3',
                fontSize: '14px',
                fontWeight: 700,
                padding: '12px 8px',
                cursor: 'pointer',
                borderBottom: '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              Recently Played
            </button>
          </div>
          <button onClick={toggleQueueView} style={{ background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '4px' }}>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z" />
            </svg>
          </button>
        </div>

        {/* Now playing */}
        <div style={{ marginBottom: '32px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#fff' }}>Now playing</h4>
          {currentSong && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={currentSong.coverUrl || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop`} alt={currentSong.title} style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
              <div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1db954' }}>{currentSong.title}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#b3b3b3' }}>{currentSong.artist}</p>
              </div>
            </div>
          )}
        </div>

        {/* Next up */}
        <div>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#fff' }}>Next up</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {nextUpQueue?.map((song: any, idx: number) => {
              if (!song) return null;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px 0' }} onClick={() => musicContext?.playSong(song)}>
                  <img src={song?.coverUrl || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop`} alt={song?.title || 'Unknown'} style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fff' }}>{song?.title || 'Unknown Song'}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#b3b3b3' }}>{song?.artist || 'Unknown Artist'}</p>
                  </div>
                </div>
              );
            })}
            {(!nextUpQueue || nextUpQueue.length === 0) && (
              <p style={{ fontSize: '14px', color: '#b3b3b3' }}>Không có bài hát nào tiếp theo.</p>
            )}
          </div>
        </div>
      </aside>
    );
  }

  const songData = currentSong as any;
  const activeCover = songData.coverUrl || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop`;
  const artistBanner = songData.artistBanner || `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=240&fit=crop`;

  // Kiểm tra video hợp lệ
  const hasVideo = !!songData.videoUrl;

  // 🟢 HÀM ĐÓNG MV THÔNG MINH - ĐÃ KHẮC PHỤC GIỰT LẶP ÂM THANH
  const handleCloseVideo = () => {
    setIsVideoOpen(false);
    setTimeout(() => {
      if (wasPlayingBeforeVideo.current && togglePlay) {
        togglePlay();
      }
      wasPlayingBeforeVideo.current = false; // Reset cờ
    }, 50);
  };

  return (
    <aside className={`spotify-right-sidebar ${isCollapsed ? 'collapsed' : ''}`}>

      {/* NÚT MŨI TÊN KHI THU GỌN */}
      <button className="right-expand-btn" onClick={() => setIsCollapsed(false)} title="Mở rộng bảng thông tin">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
          <path d="M11.03 1.97a.75.75 0 0 1 0 1.06L5.56 8l5.47 5.47a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0z" />
        </svg>
      </button>

      {/* KHỐI CHỨA RUỘT GAN */}
      <div className="right-sidebar-full-content">
        <div className="right-sidebar-header">
          <h3>Đang phát</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 100 }} ref={moreMenuRef}>
            <button
              className="right-more-icon-btn"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              title="Khác"
              style={{ background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '4px' }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M4.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
              </svg>
            </button>

            {/* DROPDOWN MENU 3 CHẤM GIỐNG TRANG ALBUM */}
            {isMoreMenuOpen && (
              <ul
                className="album-dropdown-menu"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  left: 'auto', // Quan trọng: ghi đè left: 0 của CSS gốc
                  marginTop: '8px',
                  zIndex: 1000,
                  width: '240px'
                }}
              >
                <li>
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z" /><path d="M11.75 8a.75.75 0 0 1-.75.75H8.75V11.5a.75.75 0 0 1-1.5 0V8.75H4.5a.75.75 0 0 1 0-1.5h2.75V4.5a.75.75 0 0 1 1.5 0v2.75h2.75a.75.75 0 0 1 .75.75z" /></svg>
                  <span>Add to Your Library</span>
                </li>
                <li>
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M16 15H2v-1.5h14V15zm0-4.5H2V9h14v1.5zm-8.034-6A5.484 5.484 0 0 1 7.187 6H13.5a.75.75 0 0 0 0-1.5H7.187a5.484 5.484 0 0 1 .779-1.5h5.534a.75.75 0 0 0 0-1.5H6.984a6.967 6.967 0 0 0-1.28-1.077L4.496.643a.75.75 0 0 0-1.06 1.06l1.284 1.284A6.974 6.974 0 0 0 .5 8c0 3.866 3.134 7 7 7 2.1 0 4.02-.924 5.334-2.392l-1.121-1.015A5.483 5.483 0 0 1 7.5 13.5a5.5 5.5 0 1 1 0-11c1.332 0 2.554.474 3.512 1.26l-1.26 1.26a.75.75 0 0 0 .531 1.28h3.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-1.28-.53l-1.287 1.287zM7.5 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /></svg>
                  <span>Add to queue</span>
                </li>
                <li className="album-dropdown-divider"></li>
                <li className="has-submenu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z" /></svg>
                    <span>Add to playlist</span>
                  </div>
                  <svg className="submenu-arrow" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M5.5 13.5l5.5-5.5-5.5-5.5v11z" /></svg>
                </li>
                <li className="album-dropdown-divider"></li>
                <li>
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M12.5 2.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-3.5 2a3.5 3.5 0 1 1 6.5 1.77L9.57 10.3A3.492 3.492 0 0 1 10.5 12a3.5 3.5 0 1 1-6.196-2.247l2.844-3.555A3.493 3.493 0 0 1 6.5 4.5a3.5 3.5 0 0 1 2.5-1.02v1.02a2 2 0 1 0-1.748 3.01l3.056 3.82a2 2 0 1 0 1.636-2.73l-2.944-3.68v.58z" /></svg>
                  <span>Share</span>
                </li>
              </ul>
            )}

            <button className="right-close-icon-btn" onClick={() => setIsCollapsed(true)} title="Thu gọn bảng thông tin">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H3zm1-2h16V4H4v16zm8-13v10l-5-5 5-5z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="right-sidebar-cover">
          <img src={activeCover} alt={songData.title} />
        </div>

        <div className="right-sidebar-info">
          <div className="song-details">
            <h4 className="song-title" title={songData.title} style={{ color: isPlaying ? '#1db954' : '#fff' }}>
              {songData.title}
            </h4>
            <p className="song-artist">{songData.artist}</p>
          </div>
        </div>

        {/* NÚT XEM VIDEO HOẶC MV ĐÃ ĐƯỢC CHUẨN HÓA STYLE */}
        {hasVideo && (
          <div className="right-sidebar-video-action" style={{ padding: "0 16px", marginBottom: "16px" }}>
            <button
              className="view-video-btn available"
              onClick={() => {
                // 1. Ghi nhớ trạng thái phát nhạc trước đó
                wasPlayingBeforeVideo.current = isPlaying;

                // 2. Tạm dừng nhạc hệ thống một cách an toàn
                if (isPlaying) {
                  if (pauseSong) {
                    pauseSong();
                  } else if (togglePlay) {
                    togglePlay();
                  }
                }
                // 3. Mở Dialog Video
                setIsVideoOpen(true);
              }}
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: "500px",
                border: "none",
                fontWeight: 700,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
                backgroundColor: "#1db954",
                color: "#fff",
                transition: "all 0.2s ease"
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M23 12c0 6.075-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1s11 4.925 11 11zm-13.5-4.5v9l7-4.5-7-4.5z" />
              </svg>
              Xem Video MV
            </button>
          </div>
        )}

        {/* KHỐI ABOUT THE ARTIST */}
        <div className="spotify-about-artist-box" onClick={() => setIsDialogOpen(true)} style={{ cursor: "pointer" }}>
          <div className="about-artist-banner">
            <img src={artistBanner} alt={songData.artist} />
            <div className="about-artist-title-overlay"><span>About the artist</span></div>
          </div>
          <div className="about-artist-body">
            <h4 className="about-artist-name">{songData.artist}</h4>
            <p className="about-monthly-listeners">
              {songData.monthlyListeners ? `${songData.monthlyListeners.toLocaleString()} monthly listeners` : 'Click để xem chi tiết'}
            </p>
          </div>
        </div>

        {/* KHỐI CREDITS */}
        <div className="spotify-right-sidebar-box" style={{ backgroundColor: '#242424', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>Credits</h4>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#b3b3b3', cursor: 'pointer' }}>Show all</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fff' }}>{songData.artist}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#b3b3b3' }}>Main Artist • Producer</p>
            </div>
            <button style={{ background: 'transparent', border: '1px solid #727272', borderRadius: '500px', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '4px 14px', cursor: 'pointer' }}>
              Follow
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fff' }}>Trần Tất Thiện Tâm</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#b3b3b3' }}>Composer • Lyricist</p>
            </div>
          </div>
        </div>

        {/* KHỐI NEXT IN QUEUE */}
        <div className="spotify-right-sidebar-box" style={{ backgroundColor: '#242424', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>Next in queue</h4>
            <span 
              onClick={() => {
                if (!isQueueViewOpen && toggleQueueView) {
                  toggleQueueView();
                }
              }}
              style={{ fontSize: '13px', fontWeight: 700, color: '#b3b3b3', cursor: 'pointer' }}
            >
              Open queue
            </span>
          </div>

          {(() => {
            let nextSong = null;
            if (queue.length > 0 && currentSong) {
              const currentIndex = queue.findIndex((s: any) => s.id === currentSong.id);
              if (currentIndex !== -1 && currentIndex < queue.length - 1) {
                nextSong = queue[currentIndex + 1];
              }
            }

            if (nextSong) {
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px 0' }} onClick={() => musicContext?.playSong(nextSong)}>
                  <img src={nextSong.coverUrl || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop`} alt={nextSong.title} style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fff' }}>{nextSong.title}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#b3b3b3' }}>{nextSong.artist}</p>
                  </div>
                </div>
              );
            } else {
              return (
                <p style={{ margin: 0, fontSize: '14px', color: '#b3b3b3' }}>No next song</p>
              );
            }
          })()}
        </div>

      </div>

      {/* 🟢 DIALOG POPUP XEM VIDEO MV XỊN SÒ */}
      {isVideoOpen && (
        <div
          className="spotify-dialog-overlay"
          onClick={handleCloseVideo}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
        >
          <div
            className="spotify-dialog-content video-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "85%",
              maxWidth: "1100px",
              backgroundColor: "#121212",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #282828",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.8)",
              display: "flex",
              flexDirection: "column",
              position: "relative"
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "18px 24px",
              color: "#fff",
              borderBottom: "1px solid #232323",
              backgroundColor: "#181818",
              width: "100%",
              boxSizing: "border-box"
            }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ marginRight: "14px", display: "flex", alignItems: "center" }}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="#1db954">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#1db954",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase"
                  }}>
                    Official Music Video
                  </span>
                  <h3 style={{
                    margin: 0,
                    fontSize: "17px",
                    fontWeight: 700,
                    letterSpacing: "-0.3px",
                    color: "#ffffff"
                  }}>
                    {songData.title} <span style={{ color: "#a7a7a7", fontWeight: 400, fontSize: "14px" }}>— {songData.artist}</span>
                  </h3>
                </div>
              </div>

              {/* NÚT "✕" - HOVER PHÓNG TO XANH LÁ */}
              <button
                onClick={handleCloseVideo}
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "none",
                  color: "#b3b3b3",
                  fontSize: "13px",
                  fontWeight: "bold",
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  outline: "none",
                  flexShrink: 0,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
                onMouseOver={e => {
                  e.currentTarget.style.color = "#1db954";
                  e.currentTarget.style.backgroundColor = "rgba(29, 185, 84, 0.15)";
                  e.currentTarget.style.transform = "scale(1.25)";
                }}
                onMouseOut={e => {
                  e.currentTarget.style.color = "#b3b3b3";
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                title="Đóng cửa sổ"
              >
                ✕
              </button>
            </div>

            <div style={{
              width: "100%",
              backgroundColor: "#000",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative"
            }}>
              {songData.videoUrl ? (
                <video
                  key={songData.videoUrl}
                  src={songData.videoUrl}
                  controls
                  autoPlay
                  style={{
                    width: "100%",
                    maxHeight: "75vh",
                    objectFit: "contain",
                    display: "block",
                    backgroundColor: "#000"
                  }}
                >
                  Trình duyệt của bạn không hỗ trợ thẻ phát video này.
                </video>
              ) : (
                <div style={{ color: "#888", padding: "100px 20px", textAlign: "center", fontStyle: "italic" }}>
                  Không tìm thấy tệp tin video hợp lệ.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DIALOG THÔNG TIN CA SĨ */}
      {isDialogOpen && (
        <div className="spotify-dialog-overlay" onClick={() => setIsDialogOpen(false)} style={{ zIndex: 10000 }}>
          <div
            className="spotify-dialog-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: 0,
              overflow: "hidden",
              width: "90%",
              maxWidth: "750px",
              backgroundColor: "#181818",
              borderRadius: "12px",
              display: "block" // ghi đè flex-direction của css cũ
            }}
          >
            <button
              className="dialog-close-btn"
              onClick={() => setIsDialogOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "rgba(0,0,0,0.5)",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                color: "#fff"
              }}
            >
              ✕
            </button>

            {/* ── TOP BANNER (Ảnh thứ 1) ── */}
            <div
              style={{
                width: "100%",
                height: "400px",
                backgroundImage: `url(${artistBanner})`,
                backgroundSize: "cover",
                backgroundPosition: "center 20%",
                position: "relative"
              }}
            >
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "150px",
                background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, #181818 100%)"
              }}></div>
            </div>

            {/* ── BOTTOM INFO ── */}
            <div style={{ display: "flex", padding: "32px", gap: "48px", backgroundColor: "#181818" }}>

              {/* CỘT TRÁI: THỐNG KÊ */}
              <div style={{ flex: "0 0 160px", display: "flex", flexDirection: "column", gap: "24px" }}>
                <div>
                  <p style={{ fontSize: "28px", fontWeight: 800, margin: 0, color: "#fff", letterSpacing: "-1px" }}>
                    {songData.followers?.toLocaleString() || "0"}
                  </p>
                  <p style={{ color: "#a7a7a7", fontSize: "11px", margin: "4px 0 0 0", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Followers
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: "28px", fontWeight: 800, margin: 0, color: "#fff", letterSpacing: "-1px" }}>
                    {songData.monthlyListeners?.toLocaleString() || "0"}
                  </p>
                  <p style={{ color: "#a7a7a7", fontSize: "11px", margin: "4px 0 0 0", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Monthly Listeners
                  </p>
                </div>

                {/* Dummy Locations theo UI bạn gửi */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                    <span style={{ fontWeight: 600, color: "#fff" }}>Ho Chi Minh City, VN</span>
                    <span style={{ color: "#a7a7a7" }}>265,489</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                    <span style={{ fontWeight: 600, color: "#fff" }}>Hanoi, VN</span>
                    <span style={{ color: "#a7a7a7" }}>207,752</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                    <span style={{ fontWeight: 600, color: "#fff" }}>Da Nang, VN</span>
                    <span style={{ color: "#a7a7a7" }}>36,773</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                    <span style={{ fontWeight: 600, color: "#fff" }}>Haiphong, VN</span>
                    <span style={{ color: "#a7a7a7" }}>13,549</span>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: BIO & VERIFIED */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
                <p style={{ lineHeight: "1.6", fontSize: "15px", color: "#a7a7a7", margin: 0, fontWeight: 400 }}>
                  {songData.bio || "Nghệ sĩ này chưa cập nhật tiểu sử."}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {/* Ảnh thứ 2 (Avatar người đăng/tác giả) */}
                  <img src={activeCover} alt="Avatar" style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />
                  <span style={{ fontWeight: 600, fontSize: "14px", color: "#fff" }}>
                    Posted By {songData.artist}
                  </span>
                </div>

                <div style={{
                  marginTop: "auto",
                  backgroundColor: "#242424",
                  padding: "20px",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ background: "#1db954", borderRadius: "50%", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="#000"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "14px", color: "#fff" }}>Verified by Spotify</span>
                  </div>
                  <span style={{ color: "#a7a7a7", fontSize: "13px", lineHeight: "1.5" }}>
                    This artist has grown an active fanbase to be eligible for review and has met Spotify's criteria for profile authenticity.
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </aside>
  );
}