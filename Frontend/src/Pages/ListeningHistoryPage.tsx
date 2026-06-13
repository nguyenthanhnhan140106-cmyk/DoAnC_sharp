import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../Contexts/MusicContext';
import Header from '../Components/header';
import Sidebar from '../Components/Sidebar';
import RightSidebar from '../Components/RightSidebar';
import PlayerBar from '../Components/PlayerBar';
import Footer from '../Components/Footer';
import { useAuth } from '../Contexts/AuthContext';
import API from '../Services/api';
import '../Components/Styles/HomePage.css';
import '../Components/Styles/ListeningHistoryPage.css';

interface ListeningHistorySong {
  id: number;
  title: string;
  artist: string;
  album?: string;
  albumId?: string | number;
  playlistId?: string | number;
  playlistName?: string;
  playedAt?: string;
  coverUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
}

interface HistoryItem {
  id?: number | string;
  title?: string;
  name?: string;
  artist?: string;
  artistName?: string;
  albumName?: string;
  category?: string;
  album?: string;
  albumId?: string | number;
  playlistId?: string | number;
  playlistName?: string;
  duration?: number;
  length?: number;
  playedAt?: string;
  playedAtUtc?: string;
  coverUrl?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
}

type SortField = 'title' | 'playedAt' | 'album';
type SortDirection = 'asc' | 'desc';
type TabType = 'Songs' | 'Playlists' | 'Albums' | 'Artists' | 'Videos';

export default function ListeningHistoryPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const musicContext = useMusic();
  const { playSong, currentSong, togglePlay, setQueue } = musicContext;
  const [songs, setSongs] = useState<ListeningHistorySong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTerm] = useState('');
  const [sortField] = useState<SortField>('playedAt');
  const [sortDirection] = useState<SortDirection>('desc');
  const [activeTab, setActiveTab] = useState<TabType>('Songs');
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchRecentHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await API.get('/history/recent', {
          params: { limit: 50 },
          signal: controller.signal as AbortSignal,
          validateStatus: () => true,
        });

        if (response.status >= 400) {
          setSongs([]);
          if (response.status === 400) {
            setError('Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.');
          } else if (response.status === 500) {
            setError('Lỗi máy chủ. Vui lòng thử lại sau.');
          } else {
            setError('Không thể tải lịch sử nghe. Vui lòng thử lại sau.');
          }
          return;
        }

        const payload = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.songs)
            ? response.data.songs
            : [];

        const parsed = payload.map((item: HistoryItem) => ({
          id: Number(item?.id) || 0,
          title: item?.title ?? item?.name ?? 'Unknown title',
          artist: item?.artist ?? item?.artistName ?? 'Unknown artist',
          album: item?.albumName ?? item?.category ?? item?.album ?? 'Không xác định',
          albumId: item?.albumId, // Don't fallback to string category for ID
          playlistId: item?.playlistId ?? undefined,
          playlistName: item?.playlistName ?? 'Playlist',
          duration: item?.duration ?? item?.length ?? '--',
          playedAt: item?.playedAt ?? item?.playedAtUtc ?? '',
          coverUrl: item?.coverUrl ?? item?.imageUrl ?? undefined,
          audioUrl: item?.audioUrl ?? undefined,
          videoUrl: item?.videoUrl ?? undefined,
        }));

        setSongs(parsed);
      } catch (err: unknown) {
        const error = err as Error;
        if (error?.name === 'CanceledError' || error?.name === 'AbortError') {
          return;
        }

        setSongs([]);
        setError('Không thể tải lịch sử nghe. Vui lòng thử lại sau.');
        console.error('Lỗi lấy lịch sử nghe:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentHistory();
    return () => controller.abort();
  }, []);

  const visibleSongs = useMemo(() => {
    const normalizedTerm = filterTerm.trim().toLowerCase();
    let filtered = songs;

    if (activeTab === 'Videos') {
      filtered = filtered.filter(s => s.videoUrl);
    }

    filtered = filtered.filter((song) => {
      if (!normalizedTerm) return true;
      return [song.title, song.artist, song.album]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedTerm));
    });

    return filtered.sort((a, b) => {
      const first = a[sortField] ?? '';
      const second = b[sortField] ?? '';

      if (sortField === 'playedAt') {
        const dateA = new Date(a.playedAt ?? '');
        const dateB = new Date(b.playedAt ?? '');
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return sortDirection === 'asc'
            ? String(first).localeCompare(String(second))
            : String(second).localeCompare(String(first));
        }
        return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      }

      return sortDirection === 'asc'
        ? String(first).localeCompare(String(second))
        : String(second).localeCompare(String(first));
    });
  }, [songs, filterTerm, sortDirection, sortField, activeTab]);

  const uniqueAlbums = useMemo(() => {
    const albumsMap = new Map<number, ListeningHistorySong>();
    songs.forEach(s => {
      // Chỉ gom nhóm các bài hát có albumId thực sự từ CSDL
      if (s.albumId && !albumsMap.has(Number(s.albumId))) {
        albumsMap.set(Number(s.albumId), s);
      }
    });
    return Array.from(albumsMap.values());
  }, [songs]);

  const uniquePlaylists = useMemo(() => {
    const playlistsMap = new Map<string, ListeningHistorySong>();
    songs.forEach(s => {
      if (s.playlistId && !playlistsMap.has(String(s.playlistId))) {
        playlistsMap.set(String(s.playlistId), s);
      }
    });
    return Array.from(playlistsMap.values());
  }, [songs]);

  const uniqueArtists = useMemo(() => {
    const artistsMap = new Map<string, ListeningHistorySong>();
    songs.forEach(s => {
      if (s.artist && s.artist !== 'Unknown artist' && !artistsMap.has(s.artist)) {
        artistsMap.set(s.artist, s);
      }
    });
    return Array.from(artistsMap.values());
  }, [songs]);
  const formatPlayedAt = (value?: string) => {
    if (!value) return '--';
    const dateStr = value.endsWith('Z') ? value : value + 'Z';
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };


  return (
    <div className={`spotify-layout ${isSidebarCollapsed ? 'sidebar-hidden' : ''} ${isRightCollapsed || !isLoggedIn ? 'right-hidden' : ''}`}>
      <Header />
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <div className="main-view">
        <div className="content-wrapper history-page-wrapper">
          <div className="history-header-row">
            <div className="history-header-content">
              <h1 className="history-title">Recently played</h1>
              <div className="history-tabs">
                <button className={`history-tab-item ${activeTab === 'Songs' ? 'active' : ''}`} onClick={() => setActiveTab('Songs')}>Songs</button>
                <button className={`history-tab-item ${activeTab === 'Playlists' ? 'active' : ''}`} onClick={() => setActiveTab('Playlists')}>Playlists</button>
                <button className={`history-tab-item ${activeTab === 'Albums' ? 'active' : ''}`} onClick={() => setActiveTab('Albums')}>Albums</button>
                <button className={`history-tab-item ${activeTab === 'Artists' ? 'active' : ''}`} onClick={() => setActiveTab('Artists')}>Artists</button>
                <button className={`history-tab-item ${activeTab === 'Videos' ? 'active' : ''}`} onClick={() => setActiveTab('Videos')}>Videos</button>
              </div>
              <div className="history-played-songs">
                <button className="history-play-btn" onClick={() => {
                  if (visibleSongs.length > 0 && (activeTab === 'Songs' || activeTab === 'Videos')) {
                    setQueue?.(visibleSongs);
                    playSong?.(visibleSongs[0]);
                  }
                }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <h2>Played {activeTab === 'Songs' ? 'songs' : activeTab === 'Videos' ? 'videos' : activeTab.toLowerCase()} <span>({activeTab === 'Songs' || activeTab === 'Videos' ? visibleSongs.length : activeTab === 'Albums' ? uniqueAlbums.length : activeTab === 'Artists' ? uniqueArtists.length : 0})</span></h2>
              </div>
            </div>
          </div>

          <div className="history-card">
            <div className="history-card-meta">
              <span className="history-row-count">
                {loading ? 'Đang tải...' :
                  activeTab === 'Songs' || activeTab === 'Videos' ? `${visibleSongs.length} bài hát` :
                    activeTab === 'Albums' ? `${uniqueAlbums.length} album` :
                      activeTab === 'Artists' ? `${uniqueArtists.length} nghệ sĩ` :
                        '0 playlist'
                }
              </span>
              {!loading && error && <span className="history-error-message">{error}</span>}
            </div>

            {(activeTab === 'Songs' || activeTab === 'Videos') && (
              <div className="history-table-container">
                <div className="history-table-head">
                  <span>Title</span>
                  <span>Album/Podcast</span>
                  <span>Ngày giờ nghe</span>
                </div>

                {loading ? (
                  <div className="history-card-empty">Đang tải lịch sử nghe...</div>
                ) : error ? (
                  <div className="history-card-empty">{error}</div>
                ) : visibleSongs.length === 0 ? (
                  <div className="history-card-empty">Chưa có bài nghe gần đây</div>
                ) : (
                  <div className="history-table-body">
                    {visibleSongs.map((song, index) => {
                      const isActive = currentSong?.id === song.id;
                      const isHovered = hoveredId === song.id;
                      return (
                        <button
                          type="button"
                          key={`${song.id}-${index}`}
                          className={`history-row ${isActive ? 'history-row-active' : ''} ${isHovered ? 'history-row-hover' : ''}`}
                          onClick={() => {
                            if (isActive) {
                              togglePlay?.();
                            } else {
                              setQueue?.(visibleSongs);
                              playSong?.(song);
                            }
                          }}
                          onMouseEnter={() => setHoveredId(song.id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          <div className="history-cell history-track-cell">
                            <div className="history-track-index">{index + 1}</div>
                            <img
                              className="history-cover"
                              src={song.coverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=80&h=80&fit=crop'}
                              alt={song.title}
                            />
                            <div className="history-track-info">
                              <span className="history-track-title">{song.title}</span>
                              <span className="history-track-subtitle">{song.artist}</span>
                            </div>
                          </div>
                          <div className="history-cell history-album-cell">{song.album || 'Không xác định'}</div>
                          <div className="history-cell history-playedat-cell">{formatPlayedAt(song.playedAt)}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Albums' && (
              <div className="history-grid-container">
                {uniqueAlbums.length === 0 ? (
                  <div className="history-card-empty">Không có album nào trong lịch sử</div>
                ) : (
                  <div className="history-grid">
                    {uniqueAlbums.map((song, index) => (
                      <div key={index} className="history-grid-item" onClick={() => navigate(`/album/${song.albumId}`)} style={{ cursor: 'pointer' }}>
                        <img src={song.coverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=80&h=80&fit=crop'} alt={song.album} />
                        <span className="history-grid-title">{song.album}</span>
                        <span className="history-grid-subtitle">{song.artist}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Artists' && (
              <div className="history-grid-container">
                {uniqueArtists.length === 0 ? (
                  <div className="history-card-empty">Không có nghệ sĩ nào trong lịch sử</div>
                ) : (
                  <div className="history-grid">
                    {uniqueArtists.map((song, index) => (
                      <div key={index} className="history-grid-item artist-item">
                        <img src={song.coverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=80&h=80&fit=crop'} alt={song.artist} style={{ borderRadius: '50%' }} />
                        <span className="history-grid-title">{song.artist}</span>
                        <span className="history-grid-subtitle">Artist</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Playlists' && (
              <div className="history-grid-container">
                {uniquePlaylists.length === 0 ? (
                  <div className="history-card-empty">Chưa có playlist nào được nghe gần đây.</div>
                ) : (
                  <div className="history-grid">
                    {uniquePlaylists.map((song, index) => (
                      <div key={index} className="history-grid-item" onClick={() => navigate(`/playlist/${song.playlistId}`)} style={{ cursor: 'pointer' }}>
                        <img src={song.coverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=80&h=80&fit=crop'} alt={song.playlistName} />
                        <span className="history-grid-title">{song.playlistName}</span>
                        <span className="history-grid-subtitle">Playlist</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {isLoggedIn && <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />}
      {isLoggedIn ? <PlayerBar /> : <Footer />}
    </div>
  );
}
