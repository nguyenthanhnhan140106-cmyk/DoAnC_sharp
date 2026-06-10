import React, { useEffect, useRef, useState } from 'react';
import './Styles/LyricsView.css'; 

interface LyricLine {
  time: number;
  text: string;
}

interface FullScreenLyricsProps {
  currentSong: any;         // Bài hát đang phát
  currentTime: number;      // Thời gian hiện tại từ thẻ <audio>
  isOpen: boolean;          // Trạng thái đóng/mở màn hình lyric
  onClose: () => void;      // Hàm đóng màn hình lyric
  seek: (time: number) => void; // 🟢 Thêm prop seek để thực hiện tua nhạc theo lời
  children?: React.ReactNode; // Cho phép truyền optional đề phòng tab MainContent không có children
}

export const FullScreenLyrics: React.FC<FullScreenLyricsProps> = ({
  currentSong,
  currentTime,
  isOpen,
  onClose,
  seek, // 🟢 Bổ sung ở đây để sử dụng trong component
  children
}) => {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Tải và đọc dữ liệu từ file tĩnh .lrc nội bộ (Thư mục public/lyrics/)
  useEffect(() => {
    if (currentSong?.lyricsUrl && isOpen) {
      // Ép gọi về chính port của Frontend nếu đường dẫn bắt đầu bằng '/'
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

  // 🌟 Hàm chuyển đổi cấu trúc file .lrc nâng cao
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

  // 2. Tìm câu chữ đang hát khớp với thời gian thực tế tốt nhất
  const activeIndex = lyrics.findIndex((line, index) => {
    const nextLine = lyrics[index + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  });

  // 3. Tự động cuộn mượt mà đến câu đang hát chính giữa màn hình bên phải
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
      {/* Background loang mờ theo ảnh đĩa nhạc */}
      <div 
        className="lyric-blur-bg" 
        style={{ backgroundImage: `url(${currentSong?.coverUrl || ''})` }} 
      />
      
      {/* Nút đóng góc trên bên phải */}
      <button className="lyric-close-icon" onClick={onClose} aria-label="Đóng lời bài hát">✕</button>

      {/* Nội dung chính giữa màn hình */}
      <div className="lyric-main-container">
        {/* Khối bên trái: Ảnh bìa, Tên bài hát, Ca sĩ */}
        <div className="lyric-left-block">
          <img src={currentSong?.coverUrl} alt="Cover" className="lyric-disk-cover" />
          <h2 className="lyric-song-title">{currentSong?.title}</h2>
          <p className="lyric-artist-name">{currentSong?.artist}</p>
        </div>

        {/* Khối bên phải: Danh sách lời chạy chữ */}
        <div className="lyric-right-block" ref={scrollRef}>
          {lyrics.length > 0 ? (
            lyrics.map((line, index) => (
              <p
                key={index}
                id={`lyric-line-${index}`}
                className={`lyric-text-row ${index === activeIndex ? 'is-singing' : ''}`}
                // 🟢 Khi click vào dòng chữ, gọi hàm seek để nhảy thời gian nhạc
                onClick={() => seek(line.time)}
                // Hiển thị con trỏ dạng pointer để người dùng biết có thể tương tác bấm vào
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

      {/* Thanh Playbar sẽ được giữ cố định ở dưới cùng nếu được truyền qua children */}
      {children && (
        <div className="lyric-fixed-playbar">
          {children}
        </div>
      )}
    </div>
  );
};