import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/header';
import PlayerBar from '../Components/PlayerBar';
import RightSidebar from '../Components/RightSidebar';
import Footer from '../Components/Footer';
import { useMusic } from '../Contexts/MusicContext';
import { useAuth } from '../Contexts/AuthContext';
import { songService } from '../Services/songService';
import AuthBanner from '../Components/AuthBanner';
import '../Components/Styles/HomePage.css';

interface Song {
    id: number;
    title: string;
    artist: string;
    coverUrl?: string;
    audioUrl?: string;
    category?: string;
}

const CATEGORIES = [
    { value: '', label: 'Tất cả' },
    { value: 'vsound', label: 'V-Sound' },
    { value: 'friday', label: 'Friday' },
    { value: 'rap', label: 'Rap' },
];

const SORTS = [
    { value: 'default', label: 'Mặc định' },
    { value: 'az', label: 'A → Z' },
    { value: 'za', label: 'Z → A' },
];

const getCover = (song: Song) =>
    song.coverUrl || `https://loremflickr.com/160/160/music?lock=${song.id}`;

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const q = searchParams.get('q') || '';

    const [results, setResults] = useState<Song[]>([]);
    const [filterCat, setFilterCat] = useState('');
    const [sortMode, setSortMode] = useState('default');
    const [loading, setLoading] = useState(false);

    const { playSong, currentSong, isPlaying } = useMusic();
    const { isLoggedIn } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isRightCollapsed, setIsRightCollapsed] = useState(false);

    useEffect(() => {
        if (!q) return;
        setLoading(true);
        songService.searchSongs(q)
            .then((list: any) => {
                let songList: Song[] = Array.isArray(list) ? list : [];
                setResults(songList);
            })
            .catch((err: any) => console.error("Lỗi search:", err))
            .finally(() => setLoading(false));
    }, [q]);

    // Lọc + sắp xếp
    const displayed = results
        .filter(s => !filterCat || s.category?.toLowerCase() === filterCat)
        .sort((a, b) => {
            if (sortMode === 'az') return a.title.localeCompare(b.title);
            if (sortMode === 'za') return b.title.localeCompare(a.title);
            return 0;
        });

    const handlePlay = (song: Song) => {
        playSong(song);
        setTimeout(() => {
            const audios = document.getElementsByTagName('audio');
            if (audios.length > 0 && song.audioUrl) {
                audios[0].src = song.audioUrl;
                audios[0].load();
                audios[0].play().catch(() => { });
            }
        }, 100);
    };

    return (
        <div className={`spotify-layout ${isSidebarCollapsed ? 'sidebar-hidden' : ''} ${isRightCollapsed || !isLoggedIn ? 'right-hidden' : ''}`}>
            <Header />
            <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

            <div className="main-view">
                <div className="content-wrapper" style={{ padding: '24px' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer', fontSize: 24, marginBottom: 16 }}>←</button>

                    <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                        Kết quả tìm kiếm: <span style={{ color: '#FF5500' }}>"{q}"</span>
                    </h1>
                    <p style={{ color: '#b3b3b3', marginBottom: '24px' }}>
                        {loading ? 'Đang tìm...' : `${displayed.length} kết quả`}
                    </p>

                    {/* Bộ lọc nâng cao */}
                    <div className="search-filters">
                        <div className="filter-group">
                            <span className="filter-label">Thể loại:</span>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    className={`filter-chip ${filterCat === cat.value ? 'active' : ''}`}
                                    onClick={() => setFilterCat(cat.value)}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                        <div className="filter-group">
                            <span className="filter-label">Sắp xếp:</span>
                            {SORTS.map(s => (
                                <button
                                    key={s.value}
                                    className={`filter-chip ${sortMode === s.value ? 'active' : ''}`}
                                    onClick={() => setSortMode(s.value)}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Kết quả dạng danh sách */}
                    {!loading && displayed.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#b3b3b3', marginTop: '80px' }}>
                            <p style={{ fontSize: '24px' }}>😢</p>
                            <p>Không tìm thấy kết quả nào cho "<strong>{q}</strong>"</p>
                        </div>
                    ) : (
                        <div className="search-results-list">
                            {displayed.map((song, idx) => {
                                const isActive = currentSong?.id === song.id;
                                return (
                                    <div
                                        key={`${song.id}-${idx}`}
                                        className={`search-result-row ${isActive ? 'active' : ''}`}
                                        onClick={() => handlePlay(song)}
                                    >
                                        {/* Số thứ tự / nút play */}
                                        <div className="search-result-index">
                                            {isActive && isPlaying ? (
                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="#1db954">
                                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                                </svg>
                                            ) : (
                                                <span className="row-number">{idx + 1}</span>
                                            )}
                                            <svg className="row-play-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>

                                        {/* Ảnh bìa */}
                                        <img
                                            src={getCover(song)}
                                            alt={song.title}
                                            className="search-result-cover"
                                        />

                                        {/* Thông tin bài hát */}
                                        <div className="search-result-info">
                                            <span className="search-result-title" style={{ color: isActive ? '#1db954' : '#fff' }}>
                                                {song.title}
                                            </span>
                                            <span className="search-result-artist">Bài hát • {song.artist}</span>
                                        </div>

                                        {/* Badge thể loại */}
                                        {song.category && (
                                            <span className="search-result-badge">{song.category.toUpperCase()}</span>
                                        )}

                                        {/* Nút thêm vào playlist */}
                                        <button className="search-result-add" title="Thêm vào thư viện" onClick={e => e.stopPropagation()}>
                                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <Footer />
                </div>
            </div>


            {isLoggedIn && <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />}
            {isLoggedIn ? <PlayerBar /> : <AuthBanner />}
        </div>
    );
}
