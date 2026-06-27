import React, { useEffect, useRef, useState } from 'react';
import './Styles/LyricsView.css';

interface LyricLine {
  time: number;
  text: string;
}

interface FullScreenLyricsProps {
  currentSong: { title: string; artist: string; coverUrl?: string; lyricsUrl?: string; } | null;
  currentTime: number;
  isOpen: boolean;
  onClose: () => void;
  seek: (time: number) => void;
  children?: React.ReactNode;
}

export const FullScreenLyrics: React.FC<FullScreenLyricsProps> = ({
  currentSong,
  currentTime,
  isOpen,
  onClose,
  seek, 
  children
}) => {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const parseLrcText = (text: string) => {
    if (!text) return;
    
    const lines = text.split(/\r?\n/);
    const tempLyrics: LyricLine[] = [];
    const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    lines.forEach(line => {
      if (line.includes("www.LRCgenerator.com")) return;

      const match = timeReg.exec(line);
      if (match) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const msStr = match[3];
        const ms = parseInt(msStr, 10);
        
        const msInSeconds = msStr.length === 3 ? ms / 1000 : ms / 100;
        const timeInSeconds = min * 60 + sec + msInSeconds;
        
        const textStr = line.replace(timeReg, '').trim();
        
        if (textStr && !textStr.startsWith('[') && !textStr.endsWith(']')) {
          tempLyrics.push({ time: timeInSeconds, text: textStr });
        }
      }
    });
    
    tempLyrics.sort((a, b) => a.time - b.time);
    setLyrics(tempLyrics);
  };


  useEffect(() => {
    if (currentSong?.lyricsUrl && isOpen) {
      let finalUrl = currentSong.lyricsUrl;
      if (finalUrl.startsWith('/')) {
        finalUrl = `${window.location.origin}${finalUrl}`;
      }

      fetch(finalUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Không thể tải file lyric: ${response.statusText}`);
          }
          return response.text();
        })
        .then(data => {
          parseLrcText(data);
        })
        .catch(error => {
          console.error("Lỗi khi tải file LRC cục bộ từ hệ thống:", error);
          setLyrics([]);
        });
    } else if (!currentSong?.lyricsUrl) {
      setLyrics([]);
    }
  }, [currentSong, isOpen]);

  const activeIndex = lyrics.findIndex((line, index) => {
    const nextLine = lyrics[index + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  });

  useEffect(() => {
    if (activeIndex !== -1) {
      const activeElement = document.getElementById(`lyric-line-${activeIndex}`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div className="lyric-fullscreen-overlay">
      <div 
        className="lyric-blur-bg" 
        style={{ backgroundImage: `url(${currentSong?.coverUrl || ''})` }} 
      />
      
      <button className="lyric-close-icon" onClick={onClose} aria-label="Đóng lời bài hát">✕</button>

      <div className="lyric-main-container">
        <div className="lyric-left-block">
          <img src={currentSong?.coverUrl} alt="Cover" className="lyric-disk-cover" />
          <h2 className="lyric-song-title">{currentSong?.title}</h2>
          <p className="lyric-artist-name">{currentSong?.artist}</p>
        </div>

        <div className="lyric-right-block" ref={scrollRef}>
          {lyrics.length > 0 ? (
            lyrics.map((line, index) => (
              <p
                key={index}
                id={`lyric-line-${index}`}
                className={`lyric-text-row ${index === activeIndex ? 'is-singing' : ''}`}
                onClick={() => seek(line.time)}
                style={{ cursor: 'pointer' }}
                title="Click để tua đến đoạn này"
              >
                {line.text}
              </p>
            ))
          ) : (
            <p className="lyric-text-row text-center-status">
              {currentSong?.lyricsUrl ? "Đang tải lời bài hát..." : "Bài hát này chưa có lời."}
            </p>
          )}
        </div>
      </div>

      {children && (
        <div className="lyric-fixed-playbar">
          {children}
        </div>
      )}
    </div>
  );
};