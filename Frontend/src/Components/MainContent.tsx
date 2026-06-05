import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // ← thêm dòng này
import { useMusic } from "../Contexts/MusicContext";
import axios from "axios";
import "./Styles/HomePage.css";

interface Song {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl?: string;
  category?: string;
}

interface Album {
  id: number;
  title: string;
  coverUrl: string;
  artistName: string;
}

interface Props {
  songs: Song[];
}

const getCover = (song: Song) =>
  song.coverUrl || `https://loremflickr.com/160/160/music?lock=${song.id}`;

const SongCard = ({ song, onHover }: { song: Song; onHover?: (url: string | null) => void }) => {
  const { playSong, currentSong, isPlaying } = useMusic();
  const isActive = currentSong?.id === song.id;

  const handleForcePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSong(song);
    setTimeout(() => {
      const allAudios = document.getElementsByTagName("audio");
      if (allAudios.length > 0 && song.audioUrl) {
        for (let i = 0; i < allAudios.length; i++) {
          const player = allAudios[i];
          player.src = song.audioUrl;
          player.load();
          player.play().catch((err) => console.log("Trình duyệt chờ tương tác:", err));
        }
      }
    }, 100);
  };

  return (
    <div className="song-card-item" onClick={handleForcePlay} style={{ cursor: "pointer" }} onMouseEnter={() => onHover && onHover(getCover(song))} onMouseLeave={() => onHover && onHover(null)}>
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
      <h4 className="song-card-title" style={{ color: isActive ? "#1db954" : "#fff" }}>
        {song.title}
      </h4>
      <p className="song-card-artist">{song.artist}</p>
    </div>
  );
};

// ── AlbumCard tách riêng để dùng useNavigate ──────────────
const AlbumCard = ({ album, onHover }: { album: Album; onHover?: (url: string | null) => void }) => {
  const navigate = useNavigate();
  return (
    <div
      className="song-card-item"
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/album/${album.id}`)}
      onMouseEnter={() => onHover && onHover(album.coverUrl)}
      onMouseLeave={() => onHover && onHover(null)}
    >
      <div className="song-card-img-wrapper">
        <img src={album.coverUrl} alt={album.title} className="song-card-img" />
        <button
          className="card-play-btn"
          aria-label={`Đi tới Album ${album.title}`}
        />
      </div>
      <h4 className="song-card-title">{album.title}</h4>
      <p className="song-card-artist">{album.artistName}</p>
    </div>
  );
};

// ── RecentCard: Thẻ chữ nhật nằm ngang (Nghe gần đây) ──────────────
const RecentCard = ({ item, type, onHover }: { item: any; type: "song" | "album"; onHover?: (url: string | null) => void }) => {
  const { playSong, currentSong, isPlaying } = useMusic();
  const navigate = useNavigate();

  const title = item.title;
  const coverUrl = item.coverUrl || `https://picsum.photos/seed/${item.id}/80/80`;
  const isActive = currentSong?.id === item.id && type === "song";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === "album") navigate(`/album/${item.id}`);
    else playSong(item);
  };

  return (
    <div className="recent-card" onClick={handleClick} onMouseEnter={() => onHover && onHover(coverUrl)} onMouseLeave={() => onHover && onHover(null)}>
      <img src={coverUrl} alt={title} className="recent-card-img" />
      <div className="recent-card-info">
        <h4 className="recent-card-title" style={{ color: isActive ? "#1db954" : "#fff" }}>{title}</h4>
      </div>
      <button
        className={`card-play-btn ${isActive && isPlaying ? "playing" : ""}`}
        aria-label={`Phát ${title}`}
        onClick={handleClick}
      />
    </div>
  );
};

export default function MainContent({ songs }: Props) {
  const { currentSong } = useMusic();
  const songData = currentSong as any;
  const [activeTab, setActiveTab] = useState<"all" | "album">("all");
  const [hoveredCover, setHoveredCover] = useState<string | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/albums")  // ← đổi sang /api/albums để dùng Vite proxy
      .then((res) => {
        if (Array.isArray(res.data)) setAlbums(res.data);
      })
      .catch((err) => console.error("❌ Không lấy được Album:", err));
  }, []);

  const activeCover = songData?.coverUrl || "";
  const displayCover = hoveredCover || activeCover;

  const prevCoverRef = useRef(displayCover);
  useEffect(() => {
    prevCoverRef.current = displayCover;
  }, [displayCover]);

  const fridaySongs = songs.filter((s) => s.category?.toLowerCase() === "friday");
  const vSoundSongs = songs.filter((s) => s.category?.toLowerCase() === "vsound");
  const rapSongs = songs.filter((s) => s.category?.toLowerCase() === "rap");
  const hasCategory = fridaySongs.length > 0 || vSoundSongs.length > 0 || rapSongs.length > 0;

  return (
    <div className="main-content-container">
      {prevCoverRef.current && prevCoverRef.current !== displayCover && (
        <div className="main-dynamic-bg" style={{ backgroundImage: `url(${prevCoverRef.current})`, zIndex: -3 }} />
      )}
      {displayCover && (
        <div 
          key={displayCover} 
          className="main-dynamic-bg bg-fade-in" 
          style={{ backgroundImage: `url(${displayCover})`, zIndex: -2 }} 
        />
      )}
      <div className="main-dynamic-overlay" />

      <div className="main-content-inner">
        <div className="filter-tabs-container" style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          <button className={`filter-tab-btn ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
            Tất cả
          </button>
          <button className={`filter-tab-btn ${activeTab === "album" ? "active" : ""}`} onClick={() => setActiveTab("album")}>
            Album
          </button>
        </div>

        {activeTab === "all" && (
          <>
            {/* ── KHỐI NGHE GẦN ĐÂY (RECENTLY PLAYED) ── */}
            {songs.length > 0 && (
              <div className="recent-grid">
                {albums.slice(0, 2).map((album) => (
                  <RecentCard key={`rec-alb-${album.id}`} item={album} type="album" onHover={setHoveredCover} />
                ))}
                {songs.slice(0, 2).map((song) => (
                  <RecentCard key={`rec-song-${song.id}`} item={song} type="song" onHover={setHoveredCover} />
                ))}
              </div>
            )}

            {albums.length > 0 && (
              <div className="playlist-section">
                <div className="section-header">
                  <h2 className="section-title">Album của bạn</h2>
                  {/* Nếu muốn Show All Album, có thể bấm sang Tab Album kế bên nên tạm ẩn nút */}
                </div>
                <div className="songs-grid">
                  {albums.slice(0, 10).map((album) => <AlbumCard key={album.id} album={album} onHover={setHoveredCover} />)}
                </div>
              </div>
            )}

            {!hasCategory && songs.length > 0 && (
              <div className="playlist-section">
                <div className="section-header">
                  <h2 className="section-title">Tất cả bài hát</h2>
                  <button className="show-all-btn" onClick={() => navigate('/category/all')}>
                    Show all
                  </button>
                </div>
                <div className="songs-grid">
                  {songs.slice(0, 10).map((song) => <SongCard key={song.id} song={song} onHover={setHoveredCover} />)}
                </div>
              </div>
            )}

            {fridaySongs.length > 0 && (
              <div className="playlist-section">
                <div className="section-header">
                  <h2 className="section-title">It's New Music Friday!</h2>
                  <button className="show-all-btn" onClick={() => navigate('/category/friday')}>
                    Show all
                  </button>
                </div>
                <div className="songs-grid">
                  {fridaySongs.slice(0, 10).map((song) => <SongCard key={song.id} song={song} onHover={setHoveredCover} />)}
                </div>
              </div>
            )}

            {vSoundSongs.length > 0 && (
              <div className="playlist-section">
                <div className="section-header">
                  <h2 className="section-title">V-Sound</h2>
                  <button className="show-all-btn" onClick={() => navigate('/category/vsound')}>
                    Show all
                  </button>
                </div>
                <div className="songs-grid">
                  {vSoundSongs.slice(0, 10).map((song) => <SongCard key={song.id} song={song} onHover={setHoveredCover} />)}
                </div>
              </div>
            )}

            {rapSongs.length > 0 && (
              <div className="playlist-section">
                <div className="section-header">
                  <h2 className="section-title">Thế Giới Rap</h2>
                  <button className="show-all-btn" onClick={() => navigate('/category/rap')}>
                    Show all
                  </button>
                </div>
                <div className="songs-grid">
                  {rapSongs.slice(0, 10).map((song) => <SongCard key={song.id} song={song} onHover={setHoveredCover} />)}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "album" && (
          <div className="playlist-section">
            <div className="section-header">
              <h2 className="section-title">Album của bạn</h2>
              <button className="show-all-btn">Show all</button>
            </div>
            {albums.length > 0 ? (
              <div className="songs-grid">
                {albums.map((album) => <AlbumCard key={album.id} album={album} onHover={setHoveredCover} />)}
              </div>
            ) : (
              <div style={{ color: "#b3b3b3", padding: "40px", textAlign: "center" }}>
                Chưa có Album nào trong cơ sở dữ liệu!
              </div>
            )}
          </div>
        )}

        {songs.length === 0 && (
          <div style={{ color: "#b3b3b3", padding: "40px", textAlign: "center" }}>
            Đang kết nối lấy nhạc từ database Dapper...
          </div>
        )}
      </div>
    </div>
  );
}