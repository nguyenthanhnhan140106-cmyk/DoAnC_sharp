import { useState } from "react";
import { useMusic } from "../Contexts/MusicContext";
import "./Styles/HomePage.css";

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

// Lấy ảnh bằng LoremFlickr theo ID nếu không có cover thật từ DB
const getCover = (song: Song) =>
  song.coverUrl || `https://loremflickr.com/160/160/music?lock=${song.id}`;

const SongCard = ({ song }: { song: Song }) => {
  const { playSong, currentSong, isPlaying } = useMusic();
  const isActive = currentSong?.id === song.id;

  // Hàm kích hoạt phát nhạc cưỡng bức
  const handleForcePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // Chặn lag sự kiện

    // 1. Đồng bộ giao diện qua Context
    playSong(song);

    // 2. Ép các thẻ <audio> phát link nhạc này luôn
    setTimeout(() => {
      const allAudios = document.getElementsByTagName("audio");
      if (allAudios.length > 0 && song.audioUrl) {
        for (let i = 0; i < allAudios.length; i++) {
          const player = allAudios[i];
          player.src = song.audioUrl;
          player.load(); // Nạp nhạc
          player
            .play()
            .catch((err) => console.log("Trình duyệt chờ tương tác:", err));
        }
      }
    }, 100);
  };

  return (
    <div
      className="song-card-item"
      onClick={handleForcePlay}
      style={{ cursor: "pointer" }}
    >
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
          className={`card-play-btn ${isActive && isPlaying ? "playing" : ""}`}
          aria-label={`Phát ${song.title}`}
          onClick={handleForcePlay}
        />
      </div>
      <h4
        className="song-card-title"
        style={{ color: isActive ? "#1db954" : "#fff" }}
      >
        {song.title}
      </h4>
      <p className="song-card-artist">{song.artist}</p>
    </div>
  );
};

export default function MainContent({ songs }: Props) {
  const { currentSong } = useMusic();
  const songData = currentSong as any;

  // 🟢 SỬA TẠI ĐÂY: Đã định kiểu chuẩn xác chỉ cho phép "all" hoặc "album"
  const [activeTab, setActiveTab] = useState<"all" | "album">("all");

  // Xác định ảnh bìa hiện tại để bốc màu nền động
  const activeCover = songData?.coverUrl || "";

  // Lọc bài hát theo danh mục
  const fridaySongs = songs.filter(
    (s) => s.category?.toLowerCase() === "friday",
  );
  const vSoundSongs = songs.filter(
    (s) => s.category?.toLowerCase() === "vsound",
  );
  const rapSongs = songs.filter((s) => s.category?.toLowerCase() === "rap");
  const hasCategory = fridaySongs.length > 0 || vSoundSongs.length > 0 || rapSongs.length > 0;

  return (
    <div className="main-content-container">
      
      {/* KHỐI NỀN GRADIENT ĐỘNG TƯƠNG TÁC */}
      {activeCover && (
        <div 
          className="main-dynamic-bg" 
          style={{ backgroundImage: `url(${activeCover})` }}
        />
      )}
      <div className="main-dynamic-overlay" />

      {/* BỌC NỘI DUNG VÀO LỚP INNER */}
      <div className="main-content-inner">

        {/* THANH NÚT BẤM LOẠI BỎ CŨ - CHỈ GIỮ LẠI TẤT CẢ VÀ ALBUM */}
        <div className="filter-tabs-container" style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          <button
            className={`filter-tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Tất cả
          </button>
          <button
            className={`filter-tab-btn ${activeTab === "album" ? "active" : ""}`}
            onClick={() => setActiveTab("album")}
          >
            Album
          </button>
        </div>
        
        {/* Chỉ hiện các mục nhạc khi tab chọn là "Tất cả" */}
        {activeTab === "all" && (
          <>
            {/* Chưa có category → show tất cả */}
            {!hasCategory && songs.length > 0 && (
              <div className="playlist-section">
                <div className="section-header">
                  <h2 className="section-title">Tất cả bài hát</h2>
                  <button className="show-all-btn">Show all</button>
                </div>
                <div className="songs-grid">
                  {songs.slice(0, 10).map((song) => (
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
                  {fridaySongs.slice(0, 10).map((song) => (
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
                  {vSoundSongs.slice(0, 10).map((song) => (
                    <SongCard key={song.id} song={song} />
                  ))}
                </div>
              </div>
            )}

            {/* Section Rap */}
            {rapSongs.length > 0 && (
              <div className="playlist-section">
                <div className="section-header">
                  <h2 className="section-title">Thế Giới Rap</h2>
                  <button className="show-all-btn">Show all</button>
                </div>
                <div className="songs-grid">
                  {rapSongs.slice(0, 10).map((song) => (
                    <SongCard key={song.id} song={song} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Giao diện hiển thị riêng khi chọn tab Album */}
        {activeTab === "album" && (
          <div className="playlist-section">
            <div className="section-header">
              <h2 className="section-title">Album của bạn</h2>
              <button className="show-all-btn">Show all</button>
            </div>
            
            {songs.length > 0 ? (
              <div className="songs-grid">
                {songs.slice(0, 10).map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            ) : (
              <div style={{ color: "#b3b3b3", padding: "40px", textAlign: "center" }}>
                Chưa có Album nào được tạo.
              </div>
            )}
          </div>
        )}  

        {/* Không có bài nào */}
        {songs.length === 0 && (
          <div style={{ color: "#b3b3b3", padding: "40px", textAlign: "center" }}>
            Đang kết nối lấy nhạc từ database Dapper...
          </div>
        )}
        
      </div>
    </div>
  );
}