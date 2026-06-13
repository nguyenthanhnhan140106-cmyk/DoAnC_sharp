import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMusic } from "../Contexts/MusicContext";
import { useAuth } from "../Contexts/AuthContext";
import { albumService } from "../Services/albumService";
import { categoryService } from "../Services/categoryService";
import ChartsSection from './ChartsSection';
import "./Styles/HomePage.css";

interface Song {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  categoryId?: number;
  categoryName?: string;
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

    if (currentSong?.id !== song.id) {
      playSong(song);
    }

    setTimeout(() => {
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
  const [activeTab, setActiveTab] = useState<"all" | "album" | "video">(() => {
    return (localStorage.getItem("homeActiveTab") as "all" | "album" | "video") || "all";
  });
  const [hoveredCover, setHoveredCover] = useState<string | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();

  // 🟢 Slider Logic
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);

  const promoColors = [
    "linear-gradient(135deg, #e52d6a 0%, #a41c48 100%)",
    "linear-gradient(135deg, #4d4d4d 0%, #2b2b2b 100%)",
    "linear-gradient(135deg, #b07d35 0%, #6e4e21 100%)",
    "linear-gradient(135deg, #1e3264 0%, #121e3d 100%)",
    "linear-gradient(135deg, #509bf5 0%, #2d5b94 100%)"
  ];

  const promoItems = albums.slice(0, 5).map((album, idx) => ({
    id: album.id,
    type: 'album',
    albumId: album.id,
    img: album.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop",
    title: album.title,
    desc: album.artistName || "Nhiều Nghệ Sĩ",
    bgColor: promoColors[idx % promoColors.length]
  }));

  const handleNextPromo = () => {
    setCurrentBannerIdx(prev => prev >= promoItems.length - 3 ? 0 : prev + 1);
  };

  const handlePrevPromo = () => {
    setCurrentBannerIdx(prev => prev <= 0 ? promoItems.length - 3 : prev - 1);
  };

  const handleBannerClick = (banner: any) => {
    if (banner.type === 'album') {
      navigate(`/album/${banner.albumId}`);
    }
  };

  useEffect(() => {
    albumService.getAllAlbums()
      .then((list: any) => {
        if (Array.isArray(list)) setAlbums(list);
      })
      .catch((err: any) => console.error("❌ Không lấy được Album:", err));

    categoryService.getAllCategories()
      .then((list: any) => {
        if (Array.isArray(list)) setCategories(list);
      })
      .catch((err: any) => console.error("❌ Không lấy được Category:", err));
  }, []);

  useEffect(() => {
    localStorage.setItem("homeActiveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleResetTab = () => {
      setActiveTab("all");
      localStorage.setItem("homeActiveTab", "all");
    };
    window.addEventListener("RESET_HOME_TAB", handleResetTab);
    return () => window.removeEventListener("RESET_HOME_TAB", handleResetTab);
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const shuffledSongs = useMemo(() => shuffleArray(songs), [songs]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const activeCover = songData?.coverUrl || "";
  const displayCover = hoveredCover || activeCover;

  // 🟢 Đã gọt xuống ĐÚNG 5 NGHỆ SĨ để vừa vặn 1 hàng ngang
  const popularArtists = [
    {
      id: 1,
      name: "Sơn Tùng M-TP",
      followers: 134003,
      coverImg: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
      featuredSong: { title: "Come My Way", artist: "Sơn Tùng M-TP, Tyga", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=40&h=40&fit=crop" }
    },
    {
      id: 2,
      name: "Binz",
      followers: 20891,
      coverImg: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&h=300&fit=crop",
      featuredSong: { title: "Em (feat. SOOBIN)", artist: "Binz, SOOBIN", coverUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=40&h=40&fit=crop" }
    },
    {
      id: 3,
      name: "VSTRA",
      followers: 11550,
      coverImg: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
      featuredSong: { title: "Ai Ngoài Anh", artist: "VSTRA, Tyronee", coverUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop" }
    },
    {
      id: 4,
      name: "Low G",
      followers: 42797,
      coverImg: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      featuredSong: { title: "In Love", artist: "Low G, JustaTee", coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=40&h=40&fit=crop" }
    },
    {
      id: 5,
      name: "SOOBIN",
      followers: 27506,
      coverImg: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=300&h=300&fit=crop",
      featuredSong: { title: "Em (feat. SOOBIN)", artist: "Binz, SOOBIN", coverUrl: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=40&h=40&fit=crop" }
    }
  ];

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
            {/* ── KHỐI LỜI CHÀO & BANNERS TRÊN CÙNG ── */}
            <div className="home-greeting-section">
              <h1 className="home-greeting">{greeting}</h1>
              <div className="home-banners-wrapper" style={{ overflow: 'visible', position: 'relative' }}>
                
                {/* Nút lùi (Luôn hiển thị) */}
                <button 
                  className="promo-nav-btn left-nav" 
                  onClick={handlePrevPromo}
                >
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                    <path fillRule="evenodd" d="M11.03 1.53a.75.75 0 0 1 0 1.06L4.56 8l6.47 5.41a.75.75 0 1 1-1.06 1.06L2.44 8l7.53-6.47a.75.75 0 0 1 1.06 0z" />
                  </svg>
                </button>

                <div style={{ overflow: 'hidden', width: '100%', padding: '4px 0' }}>
                  <div 
                    className="promo-cards-track" 
                    style={{ 
                      transform: `translateX(calc(-${currentBannerIdx} * (33.3333% + 8px)))`
                    }}
                  >
                    {promoItems.map(item => (
                      <div 
                        className="promo-card" 
                        key={item.id} 
                        onClick={() => handleBannerClick(item)}
                        style={{ background: item.bgColor }}
                      >
                        <img className="promo-card-img" src={item.img} alt={item.title} />
                        <div className="promo-card-content">
                          <span className="promo-card-badge">Có thể bạn thích</span>
                          <h3 className="promo-card-title">{item.title}</h3>
                          <p className="promo-card-desc">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nút tiến (Luôn hiển thị) */}
                <button 
                  className="promo-nav-btn right-nav" 
                  onClick={handleNextPromo}
                >
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                    <path fillRule="evenodd" d="M4.97 1.53a.75.75 0 0 0 0 1.06L11.44 8l-6.47 5.41a.75.75 0 1 0 1.06 1.06L13.56 8 6.03 1.53a.75.75 0 0 0-1.06 0z" />
                  </svg>
                </button>
              </div>
            </div>

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

            <ChartsSection songs={songs} />

            {!categories.length && songs.length > 0 && (
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

            {categories.map((cat) => {
              const catSongs = shuffledSongs.filter(s => s.categoryId === cat.id);
              if (catSongs.length === 0) return null;
              
              return (
                <div className="playlist-section" key={cat.id}>
                  <div className="section-header">
                    <h2 className="section-title">{cat.name}</h2>
                    <button className="show-all-btn" onClick={() => navigate(`/category/${cat.slug}`)}>
                      Show all
                    </button>
                  </div>
                  <div className="songs-grid">
                    {catSongs.slice(0, 20).map((song) => <SongCard key={song.id} song={song} onHover={setHoveredCover} />)}
                  </div>
                </div>
              );
            })}

            {/* 🟢 KHỐI NGHỆ SĨ THỊNH HÀNH - ĐÃ XÓA KHỐI SỐ 2 VÀ TĂNG paddingBottom */}
            <div className="playlist-section" style={{ marginTop: "40px", paddingBottom: "60px" }}>
              <div className="section-header" style={{ marginBottom: "20px" }}>
                <h2 className="section-title">Trending Artists</h2>
                <button className="show-all-btn">More</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "24px" }}>
                {popularArtists.map((artist) => (
                  <div key={artist.id} style={{ backgroundColor: "#181818", borderRadius: "8px", overflow: "hidden", cursor: "pointer", transition: "background-color 0.3s ease, transform 0.2s ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#282828"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#181818"; e.currentTarget.style.transform = "translateY(0)"; }}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(artist.name)}`)}
                  >
                    <div style={{ position: "relative", width: "100%", paddingBottom: "100%" }}>
                      <img src={artist.coverImg} alt={artist.name} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)" }} />

                      <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px" }}>
                        <h3 style={{ margin: "0 0 4px 0", color: "#fff", fontSize: "20px", fontWeight: 700 }}>{artist.name}</h3>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <p style={{ margin: 0, color: "#b3b3b3", fontSize: "12px", fontWeight: 500 }}>{artist.followers.toLocaleString()} followers</p>
                          <button style={{ backgroundColor: "transparent", color: "#fff", border: "1px solid #727272", borderRadius: "500px", padding: "4px 16px", fontSize: "12px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                            onClick={(e) => { e.stopPropagation(); }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.transform = "scale(1.05)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#727272"; e.currentTarget.style.transform = "scale(1)"; }}
                          >
                            Follow
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img src={artist.featuredSong.coverUrl} alt="Cover" style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover", flexShrink: 0 }} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ margin: 0, color: "#fff", fontSize: "14px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{artist.featuredSong.title}</p>
                          <p style={{ margin: "2px 0 0 0", color: "#b3b3b3", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{artist.featuredSong.artist}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
          </>
        )}

        {/* ── TAB DÀNH RIÊNG CHO TOÀN BỘ ALBUM ── */}
        {activeTab === "album" && (
          <div className="playlist-section">
            <div className="section-header">
              <h2 className="section-title">Album của bạn</h2>
              <button className="show-all-btn">Show all</button>
            </div>
            {albums.length > 0 ? (
              <div className="albums-wrap-grid">
                {albums.map((album) => <AlbumCard key={album.id} album={album} onHover={setHoveredCover} />)}
              </div>
            ) : (
              <div style={{ color: "#b3b3b3", padding: "40px", textAlign: "center" }}>
                Chưa có Album nào trong cơ sở dữ liệu!
              </div>
            )}
          </div>
        )}

        {/* ── TAB DÀNH RIÊNG CHO VIDEO ── */}
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