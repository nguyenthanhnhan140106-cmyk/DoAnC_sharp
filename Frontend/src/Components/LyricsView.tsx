import React, { useEffect, useRef, useMemo } from 'react';
import { useMusic } from '../Contexts/MusicContext';
import './Styles/LyricsView.css';

interface LyricLine {
  time: number;
  text: string;
}

export default function LyricsView() {
  const { isLyricsViewOpen, currentTime, currentSong } = useMusic();
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedLyrics = useMemo<LyricLine[]>(() => {
    const rawLyrics = currentSong?.lyrics || (currentSong as { Lyrics?: string })?.Lyrics;
    if (!rawLyrics) return [];
    
    try {
      const parsed = JSON.parse(rawLyrics);
      if (Array.isArray(parsed)) return parsed as LyricLine[];
      return [];
    } catch {
      console.warn("Lyrics is not JSON, treating as plain text.");
      const lines = rawLyrics.split('\n');
      return lines.map((text: string, idx: number) => ({
        time: idx * 3, 
        text: text.trim()
      })).filter((l: LyricLine) => l.text.length > 0);
    }
  }, [currentSong]);

  let activeIndex = -1;
  if (parsedLyrics.length > 0) {
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (currentTime >= parsedLyrics[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
  }

  useEffect(() => {
    if (isLyricsViewOpen && containerRef.current) {
      const activeElement = containerRef.current.querySelector('.lyric-line.active');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex, isLyricsViewOpen]);

  if (!isLyricsViewOpen) return null;

  return (
    <div className="spotify-lyrics-view">
      <div className="lyrics-content-wrapper" ref={containerRef}>
        <div className="lyrics-spacer" />
        
        {parsedLyrics.length > 0 ? (
          parsedLyrics.map((line, idx) => (
            <p 
              key={idx} 
              className={`lyric-line ${idx === activeIndex ? 'active' : ''}`}
            >
              {line.text}
            </p>
          ))
        ) : (
          <div style={{ padding: '20px', color: '#fff', textAlign: 'center' }}>
            <p className="lyric-line active" style={{ opacity: 0.7 }}>
              ( Lời bài hát đang được cập nhật... )
            </p>
            <div style={{ marginTop: '20px', fontSize: '12px', color: 'yellow', textAlign: 'left', background: '#222', padding: '10px', borderRadius: '8px' }}>
              <p><b>🔍 Debug: Dữ liệu bài hát Backend đang gửi về:</b></p>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(currentSong, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="lyrics-spacer" />
      </div>
    </div>
  );
}
