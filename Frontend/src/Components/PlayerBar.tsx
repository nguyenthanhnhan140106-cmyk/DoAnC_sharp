import { useMusic } from '../Contexts/MusicContext';

export default function PlayerBar() {
  const { currentSong, isPlaying, togglePlay, currentTime, duration, seek, volume, setVolume } = useMusic();

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Tính toán chuẩn xác tỷ lệ phần trăm theo thời gian thực
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  return (
    <footer className="spotify-player">

      {/* GÓC TRÁI: Thông tin bài hát */}
      <div className="player-left" style={{ gap: '12px', display: 'flex', alignItems: 'center' }}>
        {currentSong && (
          <>
            <img
              src={currentSong.coverUrl || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop`}
              alt={currentSong.title}
              style={{ width: 48, height: 48, borderRadius: 4, objectFit: 'cover' }}
            />
            <div>
              <p style={{ margin: 0, fontSize: 14, color: '#fff', fontWeight: 500 }}>
                {currentSong.title}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: '#b3b3b3' }}>
                {currentSong.artist}
              </p>
            </div>
          </>
        )}
      </div>

      {/* GÓC GIỮA: Controls + Progress */}
      <div className="player-center">
        <div className="player-controls">
          <button className="control-btn" title="Trộn bài">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 4.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"/><path d="m7.5 10.723.98-1.167 1.737 2.071A2.25 2.25 0 0 0 11.936 12.5H13.11l-1.018-1.018a.75.75 0 0 0 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 0 1.06 1.06L15.98 14.308 13.15 11.48a.75.75 0 0 0-1.06 1.06l1.018 1.018H11.16a3.75 3.75 0 0 1-2.873-1.34l-1.767-2.106z"/></svg>
          </button>
          <button className="control-btn" title="Bài trước">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-1.4 0V1.7a.7.7 0 0 1 .7-.7z"/></svg>
          </button>

          <button className="play-pause-btn" title="Play/Pause" onClick={togglePlay}>
            {isPlaying
              ? <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>
              : <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/></svg>
            }
          </button>

          <button className="control-btn" title="Bài tiếp">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 1.4 0V1.7a.7.7 0 0 0-.7-.7z"/></svg>
          </button>
          <button className="control-btn" title="Lặp lại">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"/></svg>
          </button>
        </div>

        {/* Thanh progress thời gian */}
        <div className="player-playback">
          <span className="time-text">{formatTime(currentTime)}</span>
          <div
            className="progress-bar-container"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              seek(ratio * duration);
            }}
            style={{ cursor: 'pointer', padding: '10px 0', width: '100%', display: 'flex', alignItems: 'center' }}
          >
            <div className="progress-bg" style={{ width: '100%', height: '4px', background: '#4d4d4d', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                width: `${progressPercent}% !important`, // 🟢 Ép ghi đè CSS cứng bằng !important
                maxWidth: `${progressPercent}%`,        // 🟢 Cưỡng bức độ rộng chạy theo đúng tiến trình bài hát
                height: '100%',
                background: '#1db954',
                borderRadius: '2px',
                transition: 'width 0.1s linear'
              }} />
            </div>
          </div>
          <span className="time-text">{formatTime(duration)}</span>
        </div>
      </div>

      {/* GÓC PHẢI: Volume */}
      <div className="player-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button className="control-btn" title="Âm lượng">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"/></svg>
        </button>
        <div
          className="volume-bar-container"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            setVolume(Math.max(0, Math.min(1, ratio)));
          }}
          style={{ cursor: 'pointer', padding: '10px 0', width: '100px', display: 'flex', alignItems: 'center' }}
        >
          <div className="progress-bg" style={{ width: '100%', height: '4px', background: '#4d4d4d', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              width: `${volumePercent}% !important`, // 🟢 Ép ghi đè CSS cho thanh Volume
              maxWidth: `${volumePercent}%`,        // 🟢 Khống chế cứng vạch xanh theo phần trăm volume thật
              height: '100%',
              background: '#1db954',
              borderRadius: '2px'
            }} />
          </div>
        </div>
      </div>

    </footer>
  );
}