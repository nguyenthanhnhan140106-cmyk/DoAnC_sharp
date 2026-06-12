import { useState } from 'react';
import { useMusic } from '../Contexts/MusicContext';
// 1. Đảm bảo đã import component hiển thị lời bài hát vào đây
import { FullScreenLyrics } from "./FullScreenLyrics"; 
import ShareModal from './ShareModal';

export default function PlayerBar() {
  const {
    currentSong, isPlaying, togglePlay,
    currentTime, duration, seek, volume, setVolume,
    isShuffle, toggleShuffle,
    repeatMode, cycleRepeat,
    playNext, playPrev,
    isQueueViewOpen, toggleQueueView,
    isLyricsViewOpen, toggleLyricsView, // Biến check trạng thái đóng/mở lời bài hát từ Context
    isSongLiked, toggleLikeSong,
    openAddToPlaylistModal
  } = useMusic() as any;

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  // Màu nút khi đang bật
  const activeColor = '#1db954';
  const inactiveColor = '#b3b3b3';

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <footer className="spotify-player">

      {/* GÓC TRÁI: Thông tin bài hát */}
      {/* 🟢 Gom toàn bộ khối thông tin vào 1 div chung và gắn sự kiện onClick */}
      <div 
        className="player-left" 
        style={{ gap: '12px', display: 'flex', alignItems: 'center', cursor: 'pointer' }} 
        onClick={() => { if (toggleLyricsView) toggleLyricsView(); }}
        title="Click để xem lời bài hát"
      >
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
            {/* Nút Like được đặt ra ngoài khối onClick chung để không bị kích hoạt mở lời khi bấm Like */}
            <button 
              className="control-btn heart-btn" 
              title={isSongLiked(currentSong.id) ? "Đã lưu vào Liked Songs" : "Thêm vào danh sách phát"} 
              style={{ marginLeft: '16px', color: isSongLiked(currentSong.id) ? '#1db954' : '', cursor: 'pointer' }}
              onClick={(e) => {
                // Ngăn sự kiện click lan truyền lên div cha .player-left
                e.stopPropagation(); 
                if (isSongLiked(currentSong.id)) {
                  openAddToPlaylistModal(currentSong, e);
                } else {
                  toggleLikeSong(currentSong);
                }
              }}
            >
              {isSongLiked(currentSong.id) ? (
                <svg viewBox="0 0 16 16" width="16" height="16">
                  <circle cx="8" cy="8" r="8" fill="#1ed760" />
                  <path d="M11.466 5.255a.75.75 0 0 1 1.05 1.048l-5.602 5.862a.75.75 0 0 1-1.077.018l-2.45-2.585a.75.75 0 0 1 1.085-1.026l1.928 2.034 5.066-5.351z" fill="#000" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                  <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"></path>
                  <path d="M11.75 8a.75.75 0 0 1-.75.75H8.75V11a.75.75 0 0 1-1.5 0V8.75H4.25a.75.75 0 0 1 0-1.5h3V4.25a.75.75 0 0 1 1.5 0v3h2.25a.75.75 0 0 1 .75.75z"></path>
                </svg>
              )}
            </button>
            <button 
              className="control-btn" 
              title="Chia sẻ"
              style={{ marginLeft: '16px' }}
              onClick={(e) => {
                e.stopPropagation();
                setIsShareModalOpen(true);
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* GÓC GIỮA: Controls + Progress */}
      <div className="player-center">
        <div className="player-controls">

          {/* ── NÚT TRỘN BÀI ── */}
          <button
            className="control-btn"
            title={isShuffle ? 'Tắt trộn bài' : 'Trộn bài'}
            onClick={toggleShuffle}
            style={{ color: isShuffle ? activeColor : inactiveColor, position: 'relative' }}
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 4.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z" />
              <path d="m7.5 10.723.98-1.167 1.737 2.071A2.25 2.25 0 0 0 11.936 12.5H13.11l-1.018-1.018a.75.75 0 0 0 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 0 1.06 1.06L15.98 14.308 13.15 11.48a.75.75 0 0 0-1.06 1.06l1.018 1.018H11.16a3.75 3.75 0 0 1-2.873-1.34l-1.767-2.106z" />
            </svg>
            {isShuffle && (
              <span style={{
                position: 'absolute', bottom: -4, left: '50%',
                transform: 'translateX(-50%)',
                width: 4, height: 4, borderRadius: '50%', background: activeColor
              }} />
            )}
          </button>

          {/* ── NÚT BÀI TRƯỚC ── */}
          <button className="control-btn" title="Bài trước" onClick={playPrev}>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-1.4 0V1.7a.7.7 0 0 1 .7-.7z" />
            </svg>
          </button>

          {/* ── NÚT PLAY / PAUSE ── */}
          <button className="play-pause-btn" title="Play/Pause" onClick={togglePlay}>
            {isPlaying
              ? <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z" /></svg>
              : <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z" /></svg>
            }
          </button>

          {/* ── NÚT BÀI TIẾP ── */}
          <button className="control-btn" title="Bài tiếp" onClick={playNext}>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 1.4 0V1.7a.7.7 0 0 0-.7-.7z" />
            </svg>
          </button>

          {/* ── NÚT LẶP LẠI (3 trạng thái) ── */}
          <button
            className="control-btn"
            title={repeatMode === 'none' ? 'Lặp lại' : repeatMode === 'all' ? 'Lặp 1 bài' : 'Tắt lặp lại'}
            onClick={cycleRepeat}
            style={{ color: repeatMode !== 'none' ? activeColor : inactiveColor, position: 'relative' }}
          >
            {repeatMode === 'one' ? (
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                  <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z" />
                </svg>
                <span style={{
                  position: 'absolute', top: -4, right: -5,
                  fontSize: 8, fontWeight: 700, color: activeColor,
                  lineHeight: 1
                }}>1</span>
              </div>
            ) : (
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z" />
              </svg>
            )}
            {repeatMode !== 'none' && (
              <span style={{
                position: 'absolute', bottom: -4, left: '50%',
                transform: 'translateX(-50%)',
                width: 4, height: 4, borderRadius: '50%', background: activeColor
              }} />
            )}
          </button>

        </div>

        {/* Thanh progress thời gian */}
        <div className="player-playback">
          <span className="time-text">{formatTime(currentTime)}</span>
          <div 
            className="progress-bar-container"
            onClick={(e) => {
              if (duration > 0) {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                seek(ratio * duration);
              }
            }}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flexGrow: 1 }}
          >
            <div className="progress-bg" style={{ width: '100%', height: '4px', background: '#4d4d4d', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: '#fff',
                borderRadius: '2px'
              }} />
            </div>
          </div>
          <span className="time-text">{formatTime(duration)}</span>
        </div>
      </div>

      {/* GÓC PHẢI: Các tiện ích & Volume */}
      <div className="player-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        
        {/* Nút bật/tắt Lời bài hát */}
        <button 
          className="control-btn" 
          title="Lời bài hát"
          onClick={() => {
            if (toggleLyricsView) toggleLyricsView();
          }}
          style={{ position: 'relative', color: isLyricsViewOpen ? '#1db954' : 'currentColor' }}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path d="M11 5.5a2.5 2.5 0 0 0-5 0v4a2.5 2.5 0 0 0 5 0v-4zM8 2a3.5 3.5 0 0 1 3.5 3.5v4a3.5 3.5 0 0 1-7 0v-4A3.5 3.5 0 0 1 8 2z"/>
            <path d="M14 7.5a.5.5 0 0 0-1 0 5 5 0 0 1-9.5 2.215v-1.43a.5.5 0 0 0-1 0v1.43a6 6 0 0 0 5 5.918V17a.5.5 0 0 0 1 0v-1.367a6 6 0 0 0 5-5.918v-1.43a.5.5 0 0 0-1 0v1.43A5 5 0 0 1 14 7.5z"/>
          </svg>
          {isLyricsViewOpen && <div className="active-dot" style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: '#1db954', borderRadius: '50%' }}></div>}
        </button>

        {/* Nút bật/tắt Danh sách chờ */}
        <button 
          className="control-btn" 
          title="Danh sách chờ" 
          onClick={() => {
            if (toggleQueueView) toggleQueueView();
          }}
          style={{ position: 'relative', color: isQueueViewOpen ? '#1db954' : 'currentColor' }}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path d="M15 15H1v-1.5h14V15zm0-4.5H1V9h14v1.5zm-8-6A4.5 4.5 0 0 1 2.5 0v1.5a3 3 0 1 0 0 6V9a4.5 4.5 0 0 1 4.5-4.5z"/>
          </svg>
          {isQueueViewOpen && <div className="active-dot" style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: '#1db954', borderRadius: '50%' }}></div>}
        </button>

        <button className="control-btn" title="Âm lượng">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z" />
          </svg>
        </button>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={volumePercent}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          className="volume-slider"
          style={{
            width: '100px',
            background: `linear-gradient(to right, ${activeColor} ${volumePercent}%, #4d4d4d ${volumePercent}%)`
          }}
        />
      </div>

      {/* 2. Đặt Component hiển thị lời bài hát full-screen tại đây */}
      <FullScreenLyrics 
        currentSong={currentSong} 
        currentTime={currentTime} 
        isOpen={isLyricsViewOpen} 
        onClose={() => { if (toggleLyricsView) toggleLyricsView(); }} 
        seek={seek} 
      />

      {currentSong && (
        <ShareModal 
          isOpen={isShareModalOpen} 
          onClose={() => setIsShareModalOpen(false)} 
          songId={currentSong.id} 
          songTitle={currentSong.title} 
          songCover={currentSong.coverUrl || ''} 
        />
      )}
    </footer>
  );
}