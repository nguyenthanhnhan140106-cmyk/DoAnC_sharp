import { useMusic } from '../Contexts/MusicContext';
import './Styles/HomePage.css';

interface Song {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl?: string;
  category?: string;
}

interface Props {
  songs: Song[];
}

// 🟢 Thay đổi cách lấy ảnh fallback bằng LoremFlickr theo ID để không bao giờ bị lặp ảnh
const getCover = (song: Song) =>
  song.coverUrl || `https://loremflickr.com/160/160/music?lock=${song.id}`;

const SongCard = ({ song }: { song: Song }) => {
  const { playSong, currentSong, isPlaying } = useMusic();
  const isActive = currentSong?.id === song.id;

  // 🟢 Hàm kích hoạt phát nhạc cưỡng bức, chấp mọi loại kẹt Context
  const handleForcePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // Chặn lag sự kiện
    
    // 1. Gọi hàm Context của nhóm Nam để đồng bộ giao diện đổi màu xanh, hiện nút pause
    playSong(song); 

    // 2. Tìm tất cả các thẻ <audio> đang có trên toàn bộ trang web và ép nó phát link nhạc này luôn
    setTimeout(() => {
      const allAudios = document.getElementsByTagName('audio');
      if (allAudios.length > 0 && song.audioUrl) {
        for (let i = 0; i < allAudios.length; i++) {
          const player = allAudios[i];
          player.src = song.audioUrl;
          player.load(); // Nạp nhạc
          player.play().catch(err => console.log("Trình duyệt chờ tương tác:", err));
        }
      }
    }, 100); // Chờ 100ms cho Context nạp xong là ép chạy luôn!
  };

  return (
    <div className="song-card-item" onClick={handleForcePlay} style={{ cursor: 'pointer' }}>
      <div className="song-card-img-wrapper">
        <img
          src={getCover(song)}
          alt={song.title}
          className="song-card-img"
          onError={(e) => {
            e.currentTarget.src = `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop`;
          }}
        />
        <button
          className={`card-play-btn ${isActive && isPlaying ? 'playing' : ''}`}
          aria-label={`Phát ${song.title}`}
          onClick={handleForcePlay} // 🟢 Gán hàm ép phát nhạc vào nút tròn nhỏ luôn
        />
      </div>
      <h4 className="song-card-title" style={{ color: isActive ? '#1db954' : '#fff' }}>
        {song.title}
      </h4>
      <p className="song-card-artist">{song.artist}</p>
    </div>
  );
};

export default function MainContent({ songs }: Props) {
  // 🟢 Thêm .toLowerCase() để ép chữ hoa hay chữ thường dưới DB lên đều khớp chuẩn 100%
  const fridaySongs = songs.filter(s => s.category?.toLowerCase() === 'friday');
  const vSoundSongs = songs.filter(s => s.category?.toLowerCase() === 'vsound');
  const hasCategory = fridaySongs.length > 0 || vSoundSongs.length > 0;

  return (
    <div className="main-content-container">

      {/* Chưa có category → show tất cả */}
      {!hasCategory && songs.length > 0 && (
        <div className="playlist-section">
          <div className="section-header">
            <h2 className="section-title">Tất cả bài hát</h2>
            <button className="show-all-btn">Show all</button>
          </div>
          <div className="songs-grid">
            {songs.slice(0, 10).map(song => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </div>
      )}

      {/* Section Friday */}
      {fridaySongs.length > 0 && (
        <div className="playlist-section">
          <div className="section-header">
            <h2 className="section-title">It's New Music Friday!</h2>
            <button className="show-all-btn">Show all</button>
          </div>
          <div className="songs-grid">
            {fridaySongs.slice(0, 10).map(song => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </div>
      )}

      {/* Section V-Sound */}
      {vSoundSongs.length > 0 && (
        <div className="playlist-section">
          <div className="section-header">
            <h2 className="section-title">V-Sound</h2>
            <button className="show-all-btn">Show all</button>
          </div>
          <div className="songs-grid">
            {vSoundSongs.slice(0, 10).map(song => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </div>
      )}

      {/* Không có bài nào */}
      {songs.length === 0 && (
        <div style={{ color: '#b3b3b3', padding: '40px', textAlign: 'center' }}>
          Đang kết nối lấy nhạc từ database Dapper...
        </div>
      )}

    </div>
  );
}