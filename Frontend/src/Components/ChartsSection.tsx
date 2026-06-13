import { useMusic } from '../Contexts/MusicContext';

interface Song {
    id: number;
    title: string;
    artist: string;
    coverUrl?: string;
    audioUrl?: string;
    categoryId?: number;
    categoryName?: string;
}

interface ChartColumn {
    title: string;
    color: string;
    songs: Song[];
}

interface Props {
    songs: Song[];
}

export default function ChartsSection({ songs }: Props) {
    const { playSong, currentSong } = useMusic();

    // Chia songs thành các cột chart
    const charts: ChartColumn[] = [
        {
            title: 'Top 50 Trending',
            color: '#8B1A1A',
            songs: songs.filter(s => s.categoryId === 2 || s.categoryName === 'vsound').slice(0, 5),
        },
        {
            title: 'Top 50 V-Pop',
            color: '#1A4A2E',
            songs: songs.filter(s => s.categoryId === 1 || s.categoryName === 'friday').slice(0, 5),
        },
        {
            title: 'Top 50 Rap',
            color: '#2E1A4A',
            songs: songs.filter(s => s.categoryId === 3 || s.categoryName === 'rap').slice(0, 5),
        },
        {
            title: 'Top 50 Lofi',
            color: '#1A3A4A',
            songs: songs.filter(s => s.artist?.includes('Elly')).slice(0, 5),
        },
    ].filter(c => c.songs.length > 0);

    if (charts.length === 0) return null;

    return (
        <div className="playlist-section">
            <div className="section-header">
                <h2 className="section-title">Charts</h2>
                <button className="show-all-btn">More</button>
            </div>

            <div className="charts-grid">
                {charts.map((chart, ci) => (
                    <div
                        className="chart-column"
                        key={ci}
                        style={{ background: `linear-gradient(180deg, ${chart.color} 0%, #181818 100%)` }}
                    >
                        {/* Header cột */}
                        <div className="chart-col-header">
                            <span className="chart-col-title">{chart.title}</span>
                            <button className="chart-play-btn">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </button>
                        </div>

                        {/* Danh sách 5 bài */}
                        {chart.songs.map((song, idx) => {
                            const isActive = currentSong?.id === song.id;
                            return (
                                <div
                                    key={song.id}
                                    className={`chart-row ${isActive ? 'active' : ''}`}
                                    onClick={() => playSong(song)}
                                >
                                    <span className="chart-rank">{idx + 1}</span>
                                    <img
                                        src={song.coverUrl || `https://picsum.photos/seed/${song.id}/40/40`}
                                        alt={song.title}
                                        className="chart-cover"
                                    />
                                    <div className="chart-info">
                                        <p className="chart-title" style={{ color: isActive ? '#1db954' : '#fff' }}>
                                            {song.title}
                                        </p>
                                        <p className="chart-artist">{song.artist}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}