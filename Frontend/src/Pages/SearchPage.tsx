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

import type { Song } from '../types';
const getCover = (song: Song) =>
    song.coverUrl || `https://loremflickr.com/160/160/music?lock=${song.id}`;

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const q = searchParams.get('q') || '';

    const [results, setResults] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    const { playSong, currentSong, isPlaying } = useMusic();
    const { isLoggedIn } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isRightCollapsed, setIsRightCollapsed] = useState(false);

    useEffect(() => {
        if (!q) return;
        setLoading(true);
        setCurrentPage(1); // Reset page on new search
        songService.searchSongs(q)
            .then((list: unknown) => {
                const songList: Song[] = Array.isArray(list) ? list : [];
                setResults(songList);
                setCurrentPage(1); // Reset về trang 1 khi có kết quả mới
            })
            .catch((err: unknown) => console.error("Lỗi search:", err))
            .finally(() => setLoading(false));
    }, [q]);

    // Phân trang
    const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
    const displayed = results.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handlePlay = (song: Song) => {
        playSong(song);
    };

    return (
        <div className={`spotify-layout ${isSidebarCollapsed ? 'sidebar-hidden' : ''} ${isRightCollapsed || !isLoggedIn ? 'right-hidden' : ''}`}>
            <Header />
            <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

            <div className="main-view">
                <div className="content-wrapper" style={{ padding: '24px' }}>
                    
                    {/* Cụm tiêu đề chứa nút Back sát cạnh chữ */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <button 
                            onClick={() => navigate(-1)} 
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: '#fff', 
                                cursor: 'pointer', 
                                fontSize: '28px', 
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                transition: '0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#FF5500'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
                            title="Quay lại"
                        >
                            ←
                        </button>
                        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', margin: 0, padding: 0, lineHeight: '1.2' }}>
                            Kết quả tìm kiếm: <span style={{ color: '#FF5500' }}>"{q}"</span>
                        </h1>
                    </div>


                    <p style={{ color: '#b3b3b3', marginBottom: '24px' }}>
                        {loading ? 'Đang tìm...' : `${results.length} kết quả`}
                    </p>

                    {/* Kết quả dạng danh sách */}
                    {!loading && displayed.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#b3b3b3', marginTop: '80px' }}>
                            <p style={{ fontSize: '24px' }}>😢</p>
                            <p>Không tìm thấy kết quả nào cho "<strong>{q}</strong>"</p>
                        </div>
                    ) : (
                        <>
                            <div className="search-results-list">
                                {displayed.map((song, idx) => {
                                    const isActive = currentSong?.id === song.id;
                                    const displayIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;

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
                                                    <span className="row-number">{displayIndex}</span>
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

                            {/* --- ĐÃ SỬA: ĐỔI CHỮ THÀNH MŨI TÊN PHÂN TRANG --- */}
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '30px', marginBottom: '20px' }}>
                                    {/* Nút lùi về trang trước (Dấu ‹) */}
                                    <button 
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        style={{
                                            background: '#242424',
                                            color: currentPage === 1 ? '#555' : '#fff',
                                            border: 'none',
                                            padding: '4px 14px',
                                            borderRadius: '50%',
                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: '0.2s'
                                        }}
                                        title="Trang trước"
                                    >
                                        ‹
                                    </button>

                                    {/* Hiển thị số trang */}
                                    <span style={{ color: '#b3b3b3', fontSize: '14px', fontWeight: 500, userSelect: 'none' }}>
                                        <strong style={{ color: '#fff' }}>{currentPage}</strong> / {totalPages}
                                    </span>

                                    {/* Nút tiến tới trang tiếp theo (Dấu ›) */}
                                    <button 
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        style={{
                                            background: '#242424',
                                            color: currentPage === totalPages ? '#555' : '#fff',
                                            border: 'none',
                                            padding: '4px 14px',
                                            borderRadius: '50%',
                                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: '0.2s'
                                        }}
                                        title="Trang tiếp theo"
                                    >
                                        ›
                                    </button>
                                </div>
                            )}
                        </>
                    )}



                    <Footer />
                </div>
            </div>

            {isLoggedIn && <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />}
            {isLoggedIn ? <PlayerBar /> : <AuthBanner />}
        </div>
    );
}