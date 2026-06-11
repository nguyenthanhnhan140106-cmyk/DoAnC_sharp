import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMusic } from "../Contexts/MusicContext";
import { useAuth } from "../Contexts/AuthContext";
import { albumService } from "../Services/albumService";
import "./Styles/HomePage.css";

interface Song {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
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

const VideoCard = ({ song, onHover }: { song: Song; onHover?: (url: string | null) => void }) => {
  const { playSong, currentSong, isPlaying, togglePlay } = useMusic();
  const isActive = currentSong?.id === song.id;

  const handleForcePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSong(song);

    // Tạm dừng audio và mở modal video
    setTimeout(() => {
      const allAudios = document.getElementsByTagName("audio");
      for (let i = 0; i < allAudios.length; i++) {
        allAudios[i].pause();
      }
      if (isPlaying && togglePlay) togglePlay(); // Đồng bộ state
      window.dispatchEvent(new CustomEvent('OPEN_VIDEO_MODAL'));
    }, 50);
  };

  return (
    <div className="video-card-item" onClick={handleForcePlay} onMouseEnter={() => onHover && onHover(getCover(song))} onMouseLeave={() => onHover && onHover(null)}>
      <div className="video-card-img-wrapper">
        <img
          src={getCover(song)}
          alt={song.title}
          className="video-card-img"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={(e) => {
            e.currentTarget.src = `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=225&fit=crop`;
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
  const { currentSong, recentlyPlayed } = useMusic();
  const { isLoggedIn } = useAuth();
  const songData = currentSong as any;
  const [activeTab, setActiveTab] = useState<"all" | "album" | "video">("all");
  const [hoveredCover, setHoveredCover] = useState<string | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setAlbumsLoading(true);
    albumService.getAllAlbums()
      .then((list: any) => {
        if (Array.isArray(list)) setAlbums(list);
      })
      .catch((err: any) => console.error("❌ Không lấy được Album:", err))
      .finally(() => setAlbumsLoading(false));
  }, []);

  useEffect(() => {
    const handleResetTab = () => setActiveTab("all");
    window.addEventListener("RESET_HOME_TAB", handleResetTab);
    return () => window.removeEventListener("RESET_HOME_TAB", handleResetTab);
  }, []);

  // Hàm xáo trộn mảng để nhạc không bị lặp thứ tự
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const shuffledSongs = useMemo(() => shuffleArray(songs), [songs]);

  const activeCover = songData?.coverUrl || "";
  const displayCover = hoveredCover || activeCover;
  const fridaySongs = shuffledSongs.filter((s) => s.category?.toLowerCase() === "friday");
  const vSoundSongs = shuffledSongs.filter((s) => s.category?.toLowerCase() === "vsound");
  const rapSongs = shuffledSongs.filter((s) => s.category?.toLowerCase() === "rap");
  const hasCategory = fridaySongs.length > 0 || vSoundSongs.length > 0 || rapSongs.length > 0;

  return (
    <div className="main-content-container">
      {displayCover && (
        <div className="main-dynamic-bg" style={{ backgroundImage: `url(${displayCover})` }} />
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
          <button className={`filter-tab-btn ${activeTab === "video" ? "active" : ""}`} onClick={() => setActiveTab("video")}>
            Video
          </button>
        </div>

        {activeTab === "all" && (
          <>
            {/* ── KHỐI NGHE GẦN ĐÂY (RECENTLY PLAYED) ── */}
            {isLoggedIn && (recentlyPlayed.length > 0 || songs.length > 0 || albums.length > 0) && (
              <div className="recent-grid">
                {recentlyPlayed.length > 0 ? (
                  recentlyPlayed.slice(0, 4).map((song) => (
                    <RecentCard key={`rec-played-${song.id}`} item={song} type="song" onHover={setHoveredCover} />
                  ))
                ) : (
                  (() => {
                    const defaultAlbums = albums.slice(0, 2).map(a => ({ item: a, type: 'album' as const }));
                    const defaultSongs = songs.slice(0, 4 - defaultAlbums.length).map(s => ({ item: s, type: 'song' as const }));
                    const combined = [...defaultAlbums, ...defaultSongs];
                    
                    // Nếu vẫn thiếu (do ít bài hát), lấy bù thêm album
                    if (combined.length < 4) {
                      const moreAlbums = albums.slice(2, 2 + (4 - combined.length)).map(a => ({ item: a, type: 'album' as const }));
                      combined.push(...moreAlbums);
                    }

                    return combined.map((obj, idx) => (
                      <RecentCard 
                        key={`default-${obj.type}-${obj.item.id}-${idx}`} 
                        item={obj.item} 
                        type={obj.type} 
                        onHover={setHoveredCover} 
                      />
                    ));
                  })()
                )}
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
                  <h2 className="section-title">Đề Xuất Cho Bạn</h2>
                  <button className="show-all-btn" onClick={() => navigate('/category/all')}>
                    Show all
                  </button>
                </div>
                <div className="songs-grid">
                  {songs.slice(0, 20).map((song) => <SongCard key={song.id} song={song} onHover={setHoveredCover} />)}
                </div>
              </div>
            )}

            {fridaySongs.length > 0 && (
              <div className="playlist-section">
                <div className="section-header">
                  <h2 className="section-title">Góc Nhạc Chill</h2>
                  <button className="show-all-btn" onClick={() => navigate('/category/friday')}>
                    Show all
                  </button>
                </div>
                <div className="songs-grid">
                  {fridaySongs.slice(0, 20).map((song) => <SongCard key={song.id} song={song} onHover={setHoveredCover} />)}
                </div>
              </div>
            )}

            {vSoundSongs.length > 0 && (
              <div className="playlist-section">
                <div className="section-header">
                  <h2 className="section-title">Nhạc V-Pop Nổi Bật</h2>
                  <button className="show-all-btn" onClick={() => navigate('/category/vsound')}>
                    Show all
                  </button>
                </div>
                <div className="songs-grid">
                  {vSoundSongs.slice(0, 20).map((song) => <SongCard key={song.id} song={song} onHover={setHoveredCover} />)}
                </div>
              </div>
            )}

            {rapSongs.length > 0 && (
              <div className="playlist-section">
                <div className="section-header">
                  <h2 className="section-title">Thế Giới Rap / Hiphop</h2>
                  <button className="show-all-btn" onClick={() => navigate('/category/rap')}>
                    Show all
                  </button>
                </div>
                <div className="songs-grid">
                  {rapSongs.slice(0, 20).map((song) => <SongCard key={song.id} song={song} onHover={setHoveredCover} />)}
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
            {albumsLoading ? (
              <div style={{ color: "#b3b3b3", padding: "40px", textAlign: "center" }}>
                Đang tải album...
              </div>
            ) : albums.length > 0 ? (
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

        {activeTab === "video" && (
          <div className="playlist-section">
            <div className="section-header">
              <h2 className="section-title">Video Âm Nhạc</h2>
            </div>
            {songs.filter(s => s.videoUrl && s.videoUrl.trim() !== "").length > 0 ? (
              <div className="videos-grid">
                {songs.filter(s => s.videoUrl && s.videoUrl.trim() !== "").map((song) => (
                  <VideoCard key={`video-${song.id}`} song={song} onHover={setHoveredCover} />
                ))}
              </div>
            ) : (
              <div style={{ color: "#b3b3b3", padding: "40px", textAlign: "center" }}>
                Chưa có Video Âm Nhạc nào!
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