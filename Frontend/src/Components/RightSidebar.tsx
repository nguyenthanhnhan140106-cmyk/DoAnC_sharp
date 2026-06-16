import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMusic } from '../Contexts/MusicContext';
import type { Song } from '../types';
import '../Components/Styles/HomePage.css';
import { useAuth } from '../Contexts/AuthContext';
import ShareModal from './ShareModal';
import API from '../Services/api';

interface RightSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function RightSidebar({ isCollapsed, setIsCollapsed }: RightSidebarProps) {
  const location = useLocation();
  const isProfilePage = location.pathname.startsWith('/user/');

  // Lấy chính xác các thuộc tính điều khiển từ MusicContext
  const musicContext = useMusic();
  const currentSong = musicContext?.currentSong;
  const isPlaying = musicContext?.isPlaying;
  const togglePlay = musicContext?.togglePlay;
  const pauseSong = musicContext?.pauseSong; // Lấy thêm hàm pause chủ động nếu có
  const queue = musicContext?.queue || [];
  const isQueueViewOpen = musicContext?.isQueueViewOpen || false;
  const toggleQueueView = musicContext?.toggleQueueView;
  const isLyricsViewOpen = musicContext?.isLyricsViewOpen || false;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const { isLoggedIn, user, openAuthModal } = useAuth();
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close more menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!isLoggedIn || !currentSong?.artistId) {
        setIsFollowing(false);
        return;
      }
      try {
        const res = await API.get(`/follow/check/${currentSong.artistId}`);
        setIsFollowing(res.data?.isFollowing ?? false);
      } catch {
        setIsFollowing(false);
      }
    };
    checkFollowStatus();
  }, [currentSong?.artistId, isLoggedIn]);

  // 🟢 Xử lý Follow/Unfollow
  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }

    if (!currentSong?.artistId) return;

    try {
      setIsFollowLoading(true);
      if (isFollowing) {
        await API.delete(`/follow/${currentSong.artistId}`);
        setIsFollowing(false);
        window.dispatchEvent(new CustomEvent('SHOW_LIBRARY_TOAST', { detail: { message: 'Đã bỏ theo dõi nghệ sĩ' } }));
      } else {
        await API.post(`/follow/${currentSong.artistId}`);
        setIsFollowing(true);
        window.dispatchEvent(new CustomEvent('SHOW_LIBRARY_TOAST', { detail: { message: 'Đã theo dõi nghệ sĩ' } }));
      }
    } catch (error) {
      console.error('Lỗi khi follow/unfollow:', error);
      window.dispatchEvent(new CustomEvent('SHOW_LIBRARY_TOAST', { detail: { message: 'Có lỗi xảy ra, vui lòng thử lại sau' } }));
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Sử dụng ref để nhớ trạng thái nhạc trước khi bật MV
  const wasPlayingBeforeVideo = useRef(false);

  // 🟢 Lắng nghe sự kiện bật Video từ các nơi khác (như trang chủ)
  useEffect(() => {
    const handleOpenVideoModal = () => {
      wasPlayingBeforeVideo.current = true; // Lưu cờ
      setIsVideoOpen(true);
      // Tạm dừng nhạc bằng hàm stable
      if (pauseSong) {
        pauseSong();
      }
    };
    window.addEventListener('OPEN_VIDEO_MODAL', handleOpenVideoModal);
    return () => window.removeEventListener('OPEN_VIDEO_MODAL', handleOpenVideoModal);
  }, [pauseSong]);



  const [friends, setFriends] = useState<{ userId: number, username: string, avatarUrl: string }[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<{ id: number, username: string, avatarUrl: string }[]>([]);

  const isFriendActivityViewOpen = musicContext?.isFriendActivityViewOpen || false;

  useEffect(() => {
    const fetchFriendsAndSuggestions = async () => {
      if (isLoggedIn) {
        try {
          const res = await API.get(`/follow/user/following?t=${new Date().getTime()}`);
          setFriends(res.data);
          
          if (res.data.length === 0 && user?.id) {
            const usersRes = await API.get('/Users');
            const allUsers = usersRes.data || [];
            // Lọc bỏ user hiện tại, đảo ngược để lấy người dùng mới nhất, và lấy 5 người đầu tiên
            const suggestions = allUsers
              .filter((u: { id: number }) => u.id !== user.id)
              .reverse()
              .slice(0, 5);
            setSuggestedUsers(suggestions);
          }
        } catch (e) {
          console.error("Lỗi lấy danh sách friends/suggestions:", e);
        }
      } else {
        setFriends([]);
        setSuggestedUsers([]);
      }
    };
    fetchFriendsAndSuggestions();
    
    const handleFollowUpdated = () => fetchFriendsAndSuggestions();
    window.addEventListener('followUpdated', handleFollowUpdated);
    return () => window.removeEventListener('followUpdated', handleFollowUpdated);
  }, [isLoggedIn, user?.id]);

  if (!currentSong || isProfilePage || isFriendActivityViewOpen) {
    return (
      <aside className={`spotify-right-sidebar ${isCollapsed ? 'collapsed' : ''}`} style={!isCollapsed ? { padding: '24px 16px', overflowY: 'auto' } : undefined}>
        {!isCollapsed && (
          <div className="right-sidebar-full-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>Friend Activity</h4>
            </div>
            
            {isLoggedIn ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {friends.length > 0 ? (
                  friends.map((f: { userId: number, username: string, avatarUrl: string }) => (
                    <div key={f.userId} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => window.location.href = `/user/${f.userId}`}>
                      <div style={{
                        width: "48px", height: "48px", borderRadius: "50%",
                        backgroundImage: f.avatarUrl ? `url(${f.avatarUrl})` : "none",
                        backgroundColor: "#282828", backgroundSize: "cover", backgroundPosition: "center",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        {!f.avatarUrl && (
                          <svg viewBox="0 0 24 24" width="24" height="24" fill="#b3b3b3">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#fff' }}>{f.username}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#b3b3b3' }}>Online</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>
                    <p style={{ fontSize: '14px', color: '#b3b3b3', margin: '0 0 16px 0' }}>Bạn chưa follow ai. Gợi ý cho bạn:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {suggestedUsers.map((su: { id: number, username: string, avatarUrl: string }) => (
                        <div key={`suggest-${su.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px 0' }} onClick={() => window.location.href = `/user/${su.id}`}>
                          <div style={{
                            width: "40px", height: "40px", borderRadius: "50%",
                            backgroundImage: su.avatarUrl ? `url(${su.avatarUrl})` : "none",
                            backgroundColor: "#282828", backgroundSize: "cover", backgroundPosition: "center",
                            display: "flex", alignItems: "center", justifyContent: "center"
                          }}>
                            {!su.avatarUrl && (
                              <svg viewBox="0 0 24 24" width="20" height="20" fill="#b3b3b3">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                              </svg>
                            )}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#fff' }}>{su.username}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#b3b3b3' }}>Gợi ý kết bạn</p>
                          </div>
                        </div>
                      ))}
                      {suggestedUsers.length === 0 && (
                        <p style={{ fontSize: '12px', color: '#b3b3b3' }}>Không tìm thấy gợi ý.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#b3b3b3', marginTop: '20px' }}>
                <p style={{ fontSize: '14px', margin: '0 0 16px 0' }}>Log in to see what your friends are playing.</p>
                <button 
                  onClick={() => openAuthModal()}
                  style={{
                    background: "white", color: "black", border: "none", borderRadius: "32px",
                    padding: "8px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer"
                  }}
                >
                  Log in
                </button>
              </div>
            )}
          </div>
        )}

        {isCollapsed && (
          <button className="right-expand-btn" onClick={() => setIsCollapsed(false)} title="Mở rộng">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M11.03 1.97a.75.75 0 0 1 0 1.06L5.56 8l5.47 5.47a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0z" />
            </svg>
          </button>
        )}
      </aside>
    );
  }

  if (isQueueViewOpen || isLyricsViewOpen) {
    const currentIndex = queue.findIndex((s: Song) => s?.id === currentSong?.id);
    const nextUpQueue = currentIndex !== -1 ? queue.slice(currentIndex + 1) : queue;

    return (
      <aside className={`spotify-right-sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{ padding: '24px 16px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>Queue</h4>
          <button onClick={toggleQueueView} style={{ background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '4px' }}>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z" />
            </svg>
          </button>
        </div>

        {/* Now playing */}
        <div style={{ marginBottom: '32px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#fff' }}>Now playing</h4>
          {currentSong && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={currentSong.coverUrl || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop`} alt={currentSong.title} style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
              <div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1db954' }}>{currentSong.title}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#b3b3b3' }}>{currentSong.artist}</p>
              </div>
            </div>
          )}
        </div>

        {/* Next up */}
        <div>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#fff' }}>Next up</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {nextUpQueue?.map((song: Song, idx: number) => {
              if (!song) return null;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px 0' }} onClick={() => musicContext?.playSong(song)}>
                  <img src={song?.coverUrl || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop`} alt={song?.title || 'Unknown'} style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fff' }}>{song?.title || 'Unknown Song'}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#b3b3b3' }}>{song?.artist || 'Unknown Artist'}</p>
                  </div>
                </div>
              );
            })}
            {(!nextUpQueue || nextUpQueue.length === 0) && (
              <p style={{ fontSize: '14px', color: '#b3b3b3' }}>Không có bài hát nào tiếp theo.</p>
            )}
          </div>
        </div>

        {currentSong && (
          <ShareModal 
            isOpen={isShareModalOpen} 
            onClose={() => setIsShareModalOpen(false)} 
            mediaType="song"
            mediaId={currentSong.id} 
            mediaTitle={currentSong.title} 
            mediaCover={currentSong.coverUrl || ''} 
          />
        )}
      </aside>
    );
  }

  const songData = currentSong;
  const activeCover = songData.coverUrl || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop`;
  const artistBanner =
  songData.title === "Sài Gòn đâu có lạnh"
    ? "https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg"
    : songData.title === "Định mệnh tình yêu"
    ? "https://haycafe.vn/wp-content/uploads/2022/03/Anh-bia-zalo-tranh-ve-phong-canh.jpg"
    : songData.title === "Liễu Thanh Yên"
    ? "https://khoinguonsangtao.vn/wp-content/uploads/2022/12/hinh-anh-bia-youtube-anime-bau-troi-huyen-ao.jpg"
    : songData.title === "Không buông"
    ? "https://image.dienthoaivui.com.vn/x,webp,q90/https://dashboard.dienthoaivui.com.vn/uploads/dashboard/editor_upload/anh-bia-facebook-4.jpg"
    : songData.title === "100 cuộc gọi nhỡ"
    ? "https://cellphones.com.vn/sforum/wp-content/uploads/2024/04/anh-bia-facebook-14.jpg"
    : songData.title === "01 ngoại lệ"
    ? "https://antimatter.vn/wp-content/uploads/2022/05/hinh-anh-bia-zalo.jpg"
    : songData.title === "Về bên anh"
    ? "https://tse4.mm.bing.net/th/id/OIP.r0QBLpsynGyw-Y2vB9Ki2QHaJ4?r=0&cb=thfvnextfalcon2&rs=1&pid=ImgDetMain&o=7&rm=3"
    : songData.title === "Tuesday"
    ? "https://tse4.mm.bing.net/th/id/OIP.r0QBLpsynGyw-Y2vB9Ki2QHaJ4?r=0&cb=thfvnextfalcon2&rs=1&pid=ImgDetMain&o=7&rm=3"
    : songData.title === "Về bên anh"
    ? "https://image.dienthoaivui.com.vn/x,webp,q90/https://dashboard.dienthoaivui.com.vn/uploads/dashboard/editor_upload/anh-bia-facebook-7.jpg"
    : songData.title === "Sóng gió"
    ? "https://khoinguonsangtao.vn/wp-content/uploads/2022/12/anh-bia-zalo-anime-hoang-hon-buon.jpg"
    : songData.title === "Nơi này có anh"
    ? "https://mayweddingstudio.vn/wp-content/uploads/anh-bia-zalo-phong-canh-1.webp"
    : songData.title === "Mất kết nối"
    ? "https://i.pinimg.com/736x/f4/6b/4a/f46b4ae777081480fe2ec455d1b0b3a6.jpg"
    : songData.title === "Em thua cô ta"
    ? "https://i.pinimg.com/736x/f4/6b/4a/f46b4ae777081480fe2ec455d1b0b3a6.jpg"
    : songData.title === "Thanh Tân"
    ? "https://images.pexels.com/photos/8240280/pexels-photo-8240280.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    : songData.title === "Ngày rời chuyến bay"
    ? "https://tse2.mm.bing.net/th/id/OIP.ye4X5PiclvsYnHBV_UOcAQHaE8?r=0&cb=thfvnextfalcon2&rs=1&pid=ImgDetMain&o=7&rm=3"
    : songData.title === "Đớn đau vô cùng"
    ? "https://inkythuatso.com/uploads/thumbnails/800/2022/04/anh-bia-phong-canh-dep-cho-facebook-9-12-08-30-53.jpg"
    : songData.title === "Thủ đô Cypher"
    ? "https://intphcm.com/data/upload/poster-am-nhac-dien-tu.jpg"
    : songData.title === "Ex hate me"
    ? "https://img4.thuthuatphanmem.vn/uploads/2020/12/26/anh-toi-yeu-am-nhac_050504782.jpg"
    : songData.title === "She never know"
    ? "https://tse1.mm.bing.net/th/id/OIP.HX9pqngKohaMNZnLSXxdfwHaH0?r=0&cb=thfvnextfalcon2&w=1566&h=1655&rs=1&pid=ImgDetMain&o=7&rm=3"



    : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=240&fit=crop";

  // Kiểm tra video hợp lệ
  const hasVideo = !!songData.videoUrl;

  // 🟢 HÀM ĐÓNG MV THÔNG MINH - ĐÃ KHẮC PHỤC GIỰT LẶP ÂM THANH
  const handleCloseVideo = () => {
    setIsVideoOpen(false);
    setTimeout(() => {
      if (wasPlayingBeforeVideo.current && togglePlay) {
        togglePlay();
      }
      wasPlayingBeforeVideo.current = false; // Reset cờ
    }, 50);
  };

  return (
    <aside className={`spotify-right-sidebar ${isCollapsed ? 'collapsed' : ''}`}>

      {/* NÚT MŨI TÊN KHI THU GỌN */}
      <button className="right-expand-btn" onClick={() => setIsCollapsed(false)} title="Mở rộng bảng thông tin">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
          <path d="M11.03 1.97a.75.75 0 0 1 0 1.06L5.56 8l5.47 5.47a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0z" />
        </svg>
      </button>

      {/* KHỐI CHỨA RUỘT GAN */}
      <div className="right-sidebar-full-content">
        <div className="right-sidebar-header">
          <h3>Đang phát</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 100 }} ref={moreMenuRef}>
            <button className="right-close-icon-btn" onClick={() => setIsCollapsed(true)} title="Thu gọn bảng thông tin">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H3zm1-2h16V4H4v16zm8-13v10l-5-5 5-5z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="right-sidebar-cover">
          <img src={activeCover} alt={songData.title} />
        </div>

        <div className="right-sidebar-info">
          <div className="song-details">
            <h4 className="song-title" title={songData.title} style={{ color: isPlaying ? '#1db954' : '#fff' }}>
              {songData.title}
            </h4>
            <p className="song-artist">{songData.artist}</p>
          </div>
        </div>

        {/* NÚT XEM VIDEO HOẶC MV ĐÃ ĐƯỢC CHUẨN HÓA STYLE */}
        {hasVideo && (
          <div className="right-sidebar-video-action" style={{ padding: "0 16px", marginBottom: "16px" }}>
            <button
              className="view-video-btn available"
              onClick={() => {
                // 1. Ghi nhớ trạng thái phát nhạc trước đó
                wasPlayingBeforeVideo.current = isPlaying;

                // 2. Tạm dừng nhạc hệ thống một cách an toàn
                if (isPlaying) {
                  if (pauseSong) {
                    pauseSong();
                  } else if (togglePlay) {
                    togglePlay();
                  }
                }
                // 3. Mở Dialog Video
                setIsVideoOpen(true);
              }}
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: "500px",
                border: "none",
                fontWeight: 700,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
                backgroundColor: "#1db954",
                color: "#fff",
                transition: "all 0.2s ease"
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M23 12c0 6.075-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1s11 4.925 11 11zm-13.5-4.5v9l7-4.5-7-4.5z" />
              </svg>
              Xem Video MV
            </button>
          </div>
        )}

        {/* KHỐI ABOUT THE ARTIST */}
        <div className="spotify-about-artist-box" onClick={() => setIsDialogOpen(true)} style={{ cursor: "pointer" }}>
          <div className="about-artist-banner">
            <img src={artistBanner} alt={songData.artist} />
            <div className="about-artist-title-overlay"><span>About the artist</span></div>
          </div>
          <div className="about-artist-body">
            <h4 className="about-artist-name">{songData.artist}</h4>
            <p className="about-monthly-listeners">
              {songData.monthlyListeners ? `${songData.monthlyListeners.toLocaleString()} monthly listeners` : 'Click để xem chi tiết'}
            </p>
          </div>
        </div>

        {/* KHỐI CREDITS */}
        <div className="spotify-right-sidebar-box" style={{ backgroundColor: '#242424', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>Credits</h4>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#b3b3b3', cursor: 'pointer' }}>Show all</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fff' }}>{songData.artist}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#b3b3b3' }}>Main Artist • Producer</p>
            </div>
            {currentSong?.artistId && (
              <button
                onClick={handleFollow}
                disabled={isFollowLoading}
                style={{
                  background: isFollowing ? 'transparent' : 'transparent',
                  border: `1px solid ${isFollowing ? '#1db954' : '#727272'}`,
                  borderRadius: '500px',
                  color: isFollowing ? '#1db954' : '#fff',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 14px',
                  cursor: isFollowLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isFollowLoading ? 0.6 : 1,
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fff' }}>Trần Tất Thiện Tâm</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#b3b3b3' }}>Composer • Lyricist</p>
            </div>
          </div>
        </div>

        {/* KHỐI NEXT IN QUEUE */}
        <div className="spotify-right-sidebar-box" style={{ backgroundColor: '#242424', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>Next in queue</h4>
            <span 
              onClick={() => {
                if (!isQueueViewOpen && toggleQueueView) {
                  toggleQueueView();
                }
              }}
              style={{ fontSize: '13px', fontWeight: 700, color: '#b3b3b3', cursor: 'pointer' }}
            >
              Open queue
            </span>
          </div>

          {(() => {
            let nextSong = null;
            if (queue.length > 0 && currentSong) {
              const currentIndex = queue.findIndex((s: Song) => s.id === currentSong.id);
              if (currentIndex !== -1 && currentIndex < queue.length - 1) {
                nextSong = queue[currentIndex + 1];
              }
            }

            if (nextSong) {
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px 0' }} onClick={() => musicContext?.playSong(nextSong)}>
                  <img src={nextSong.coverUrl || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop`} alt={nextSong.title} style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fff' }}>{nextSong.title}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#b3b3b3' }}>{nextSong.artist}</p>
                  </div>
                </div>
              );
            } else {
              return (
                <p style={{ margin: 0, fontSize: '14px', color: '#b3b3b3' }}>No next song</p>
              );
            }
          })()}
        </div>

      </div>

      {/* 🟢 DIALOG POPUP XEM VIDEO MV XỊN SÒ */}
      {isVideoOpen && (
        <div
          className="spotify-dialog-overlay"
          onClick={handleCloseVideo}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
        >
          <div
            className="spotify-dialog-content video-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "85%",
              maxWidth: "1100px",
              backgroundColor: "#121212",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #282828",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.8)",
              display: "flex",
              flexDirection: "column",
              position: "relative"
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "18px 24px",
              color: "#fff",
              borderBottom: "1px solid #232323",
              backgroundColor: "#181818",
              width: "100%",
              boxSizing: "border-box"
            }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ marginRight: "14px", display: "flex", alignItems: "center" }}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="#1db954">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#1db954",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase"
                  }}>
                    Official Music Video
                  </span>
                  <h3 style={{
                    margin: 0,
                    fontSize: "17px",
                    fontWeight: 700,
                    letterSpacing: "-0.3px",
                    color: "#ffffff"
                  }}>
                    {songData.title} <span style={{ color: "#a7a7a7", fontWeight: 400, fontSize: "14px" }}>— {songData.artist}</span>
                  </h3>
                </div>
              </div>

              {/* NÚT "✕" - HOVER PHÓNG TO XANH LÁ */}
              <button
                onClick={handleCloseVideo}
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "none",
                  color: "#b3b3b3",
                  fontSize: "13px",
                  fontWeight: "bold",
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  outline: "none",
                  flexShrink: 0,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
                onMouseOver={e => {
                  e.currentTarget.style.color = "#1db954";
                  e.currentTarget.style.backgroundColor = "rgba(29, 185, 84, 0.15)";
                  e.currentTarget.style.transform = "scale(1.25)";
                }}
                onMouseOut={e => {
                  e.currentTarget.style.color = "#b3b3b3";
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                title="Đóng cửa sổ"
              >
                ✕
              </button>
            </div>

            <div style={{
              width: "100%",
              backgroundColor: "#000",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative"
            }}>
              {songData.videoUrl ? (
                <video
                  key={songData.videoUrl}
                  src={songData.videoUrl}
                  controls
                  autoPlay
                  style={{
                    width: "100%",
                    maxHeight: "75vh",
                    objectFit: "contain",
                    display: "block",
                    backgroundColor: "#000"
                  }}
                >
                  Trình duyệt của bạn không hỗ trợ thẻ phát video này.
                </video>
              ) : (
                <div style={{ color: "#888", padding: "100px 20px", textAlign: "center", fontStyle: "italic" }}>
                  Không tìm thấy tệp tin video hợp lệ.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DIALOG THÔNG TIN CA SĨ */}
      {isDialogOpen && (
        <div className="spotify-dialog-overlay" onClick={() => setIsDialogOpen(false)} style={{ zIndex: 10000 }}>
          <div
            className="spotify-dialog-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: 0,
              overflow: "hidden",
              width: "90%",
              maxWidth: "750px",
              backgroundColor: "#181818",
              borderRadius: "12px",
              display: "block" // ghi đè flex-direction của css cũ
            }}
          >
            <button
              className="dialog-close-btn"
              onClick={() => setIsDialogOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "rgba(0,0,0,0.5)",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                color: "#fff"
              }}
            >
              ✕
            </button>

            {/* ── TOP BANNER (Ảnh thứ 1) ── */}
            <div
              style={{
                width: "100%",
                height: "400px",
                backgroundImage: `url(${artistBanner})`,
                backgroundSize: "cover",
                backgroundPosition: "center 20%",
                position: "relative"
              }}
            >
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "150px",
                background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, #181818 100%)"
              }}></div>
            </div>

            {/* ── BOTTOM INFO ── */}
            <div style={{ display: "flex", padding: "32px", gap: "48px", backgroundColor: "#181818" }}>

              {/* CỘT TRÁI: THỐNG KÊ */}
              <div style={{ flex: "0 0 160px", display: "flex", flexDirection: "column", gap: "24px" }}>
                <div>
                  <p style={{ fontSize: "28px", fontWeight: 800, margin: 0, color: "#fff", letterSpacing: "-1px" }}>
                    {songData.followers?.toLocaleString() || "0"}
                  </p>
                  <p style={{ color: "#a7a7a7", fontSize: "11px", margin: "4px 0 0 0", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Followers
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: "28px", fontWeight: 800, margin: 0, color: "#fff", letterSpacing: "-1px" }}>
                    {songData.monthlyListeners?.toLocaleString() || "0"}
                  </p>
                  <p style={{ color: "#a7a7a7", fontSize: "11px", margin: "4px 0 0 0", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Monthly Listeners
                  </p>
                </div>

                {/* Dummy Locations theo UI bạn gửi */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                    <span style={{ fontWeight: 600, color: "#fff" }}>Ho Chi Minh City, VN</span>
                    <span style={{ color: "#a7a7a7" }}>265,489</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                    <span style={{ fontWeight: 600, color: "#fff" }}>Hanoi, VN</span>
                    <span style={{ color: "#a7a7a7" }}>207,752</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                    <span style={{ fontWeight: 600, color: "#fff" }}>Da Nang, VN</span>
                    <span style={{ color: "#a7a7a7" }}>36,773</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                    <span style={{ fontWeight: 600, color: "#fff" }}>Haiphong, VN</span>
                    <span style={{ color: "#a7a7a7" }}>13,549</span>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: BIO & VERIFIED */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
                <p style={{ lineHeight: "1.6", fontSize: "15px", color: "#a7a7a7", margin: 0, fontWeight: 400 }}>
                  {songData.bio || "Nghệ sĩ này chưa cập nhật tiểu sử."}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {/* Ảnh thứ 2 (Avatar người đăng/tác giả) */}
                  <img src={activeCover} alt="Avatar" style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />
                  <span style={{ fontWeight: 600, fontSize: "14px", color: "#fff" }}>
                    Posted By {songData.artist}
                  </span>
                </div>

                <div style={{
                  marginTop: "auto",
                  backgroundColor: "#242424",
                  padding: "20px",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ background: "#1db954", borderRadius: "50%", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="#000"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "14px", color: "#fff" }}>Verified by Spotify</span>
                  </div>
                  <span style={{ color: "#a7a7a7", fontSize: "13px", lineHeight: "1.5" }}>
                    This artist has grown an active fanbase to be eligible for review and has met Spotify's criteria for profile authenticity.
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </aside>
  );
}