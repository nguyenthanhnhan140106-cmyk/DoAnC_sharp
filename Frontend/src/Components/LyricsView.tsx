import React, { useEffect, useRef } from 'react';
import { useMusic } from '../Contexts/MusicContext';
import './Styles/LyricsView.css';

const DUMMY_LYRICS = [
  { time: 0, text: "Nhìn anh thấy cô đơn nên là em cho phép anh thương" },
  { time: 4, text: "Mong anh hiểu em hơn, bởi vì em lúc yêu rất là bất thường" },
  { time: 8, text: "Dù chưa rõ nông sâu, nhưng mà anh cứ mãi trong đầu" },
  { time: 12, text: "Bởi người xưa mới hay có câu" },
  { time: 15, text: "Có công mài sắc có ngày" },
  { time: 18, text: "Mình gặp nhau cũng lâu lắm rồi" },
  { time: 21, text: "Cứ dứt khoát một lần đi thôi" },
  { time: 25, text: "Để cho đôi ta thuộc về nhau, mãi đến mai sau" }
];

export default function LyricsView() {
  const { isLyricsViewOpen, currentTime } = useMusic();
  const containerRef = useRef<HTMLDivElement>(null);

  // Tìm dòng lời bài hát hiện tại dựa trên currentTime
  let activeIndex = 0;
  for (let i = 0; i < DUMMY_LYRICS.length; i++) {
    if (currentTime >= DUMMY_LYRICS[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Tự động cuộn đến dòng hiện tại
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
        {DUMMY_LYRICS.map((line, idx) => (
          <p 
            key={idx} 
            className={`lyric-line ${idx === activeIndex ? 'active' : ''}`}
          >
            {line.text}
          </p>
        ))}
        <div className="lyrics-spacer" />
      </div>
    </div>
  );
}
