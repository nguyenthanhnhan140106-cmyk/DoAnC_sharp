import { useEffect, useMemo, useState } from 'react';
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
  playedAt?: string;
  coverUrl?: string;
  audioUrl?: string;
}

type SortField = 'title' | 'playedAt' | 'album';
type SortDirection = 'asc' | 'desc';

export default function ListeningHistoryPage() {
  const { isLoggedIn } = useAuth();
  const musicContext = useMusic() as any;
  const { playSong, currentSong, togglePlay } = musicContext;
  const [songs, setSongs] = useState<ListeningHistorySong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTerm, setFilterTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('playedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
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

        const parsed = payload.map((item: any) => ({
          id: Number(item?.id) || 0,
          title: item?.title ?? item?.name ?? 'Unknown title',
          artist: item?.artist ?? item?.artistName ?? 'Unknown artist',
          album: item?.category ?? item?.album ?? 'Không xác định',
          duration: item?.duration ?? item?.length ?? '--',
          playedAt: item?.playedAt ?? item?.playedAtUtc ?? '',
          coverUrl: item?.coverUrl ?? item?.imageUrl ?? undefined,
          audioUrl: item?.audioUrl ?? undefined,
        }));

        setSongs(parsed);
      } catch (err: any) {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') {
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
    const filtered = songs.filter((song) => {
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
  }, [songs, filterTerm, sortDirection, sortField]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(field);
    setSortDirection(field === 'playedAt' ? 'desc' : 'asc');
  };

  const formatPlayedAt = (value?: string) => {
    if (!value) return '--';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getSortLabel = (field: SortField) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className={`spotify-layout ${isSidebarCollapsed ? 'sidebar-hidden' : ''} ${isRightCollapsed || !isLoggedIn ? 'right-hidden' : ''}`}>
      <Header />
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <div className="main-view">
        <div className="content-wrapper history-page-wrapper">
          <div className="history-header-row">
            <div>
              <div className="history-tab-row">
                <button className="history-tab history-tab-active">Recently played</button>
              </div>
              <h1 className="history-title">Lịch sử nghe</h1>
              <p className="history-subtitle">Danh sách các bài hát bạn vừa nghe gần đây, lấy trực tiếp từ API.</p>
            </div>

            <div className="history-controls">
              <label className="history-search">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" className="history-search-icon">
                  <path d="M7 1.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5zM.25 7a6.75 6.75 0 1 1 12.096 4.12l3.184 3.185a.75.75 0 1 1-1.06 1.06L11.304 12.2A6.75 6.75 0 0 1 .25 7z" />
                </svg>
                <input
                  type="search"
                  placeholder="Tìm bài hát, nghệ sĩ, album..."
                  value={filterTerm}
                  onChange={(event) => setFilterTerm(event.target.value)}
                />
              </label>

              <div className="history-sort-group">
                <button type="button" className="history-sort-btn" onClick={() => handleSort('title')}>
                  Tên bài hát {getSortLabel('title')}
                </button>
                <button type="button" className="history-sort-btn" onClick={() => handleSort('playedAt')}>
                  Ngày giờ {getSortLabel('playedAt')}
                </button>
              </div>
            </div>
          </div>

          <div className="history-card">
            <div className="history-card-meta">
              <span className="history-row-count">{loading ? 'Đang tải...' : `${visibleSongs.length} bài hát`}</span>
              {!loading && error && <span className="history-error-message">{error}</span>}
            </div>

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
                          if (isActive) togglePlay?.();
                          else playSong?.(song);
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
          </div>
        </div>
      </div>

      {isLoggedIn && <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />}
      {isLoggedIn ? <PlayerBar /> : <Footer />}
    </div>
  );
}
