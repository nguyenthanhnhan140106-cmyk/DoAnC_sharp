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
  const [artistDetails, setArtistDetails] = useState<{ followers: number, monthlyListeners: number } | null>(null);

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

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!currentSong?.artistId) {
        setArtistDetails(null);
        return;
      }
      try {
        const res = await API.get(`/artists/${currentSong.artistId}`);
        setArtistDetails({
          followers: res.data.followers,
          monthlyListeners: res.data.monthlyListeners || 0
        });
      } catch (err) {
        console.error("Error fetching artist details in RightSidebar:", err);
      }
    };
    fetchArtistData();

    const handleFollowUpdated = () => {
      fetchArtistData();
    };
    window.addEventListener('followUpdated', handleFollowUpdated);
    return () => window.removeEventListener('followUpdated', handleFollowUpdated);
  }, [currentSong?.artistId]);

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
        window.dispatchEvent(new Event('followUpdated'));
        window.dispatchEvent(new CustomEvent('SHOW_LIBRARY_TOAST', { detail: { message: 'Đã bỏ theo dõi nghệ sĩ' } }));
      } else {
        await API.post(`/follow/${currentSong.artistId}`);
        setIsFollowing(true);
        window.dispatchEvent(new Event('followUpdated'));
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
  songData.title === "Thanh Tân"
    ? "https://images.genius.com/cef885bb3f90086e5bfba69e5ae06188.999x1000x1.jpg"
    : songData.title === "Về bên anh"
    ? "https://cdn2.tuoitre.vn/471584752817336320/2025/5/2/cscscs-17461597679162100078217.jpeg"
    : songData.title === "Sóng gió"
    ? "https://sohanews.sohacdn.com/160588918557773824/2025/2/28/kicm-jack02-15771187258771335529267-9342-1674-1740708803462-17407088035321454458346.jpg"
    : songData.title === "Nơi này có anh"
    ? "https://thfvnext.bing.com/th?id=OIF.vVwyAq99Ssvh8Um65ske%2bQ&r=0&cb=thfvnextfalcon2&rs=1&pid=ImgDetMain&o=7&rm=3"
    : songData.title === "Ngày rời chuyến bay"
    ? "https://i.pinimg.com/736x/29/0f/0e/290f0ea50a1acef02de6f580b704c4ea.jpg"
    : songData.title === "Mất kết nối"
    ? "https://tse1.mm.bing.net/th/id/OIP.ahcPS-aTZM_I_TefwQ-qtAHaLH?r=0&cb=thfvnextfalcon2&rs=1&pid=ImgDetMain&o=7&rm=3"
    : songData.title === "Hồng nhan"
    ? "https://sohanews.sohacdn.com/160588918557773824/2025/2/28/kicm-jack02-15771187258771335529267-9342-1674-1740708803462-17407088035321454458346.jpg"
    : songData.title === "Em thua cô ta"
    ? "https://tse2.mm.bing.net/th/id/OIP.BUuzfKyPEyv1iACQkfCdkwHaHa?r=0&cb=thfvnextfalcon2&rs=1&pid=ImgDetMain&o=7&rm=3"
    : songData.title === "Em"
    ? "https://www.elleman.vn/app/uploads/2022/07/05/215655/binz-va-soobin_elleman-2022.jpg"
    : songData.title === "Đớn đau vô cùng"
    ? "https://thfvnext.bing.com/th/id/R.980da6e155ef4d275cbb6bfd1af505a7?rik=I%2fVDHGgOGXMtJw&riu=http%3a%2f%2fnhanvatshowbiz.com%2fuploads%2fmedia%2f2024%2f01%2f15%2f0-1705287902.jpg&ehk=4IHxlNEZBM5gJF7Mr4XmM%2fzr9v5%2fqinNRxNxF29JqcU%3d&risl=&pid=ImgRaw&r=0"
    : songData.title === "Chờ anh về"
    ? "https://bloganchoi.com/wp-content/uploads/2025/12/anh-trai-bray.jpg"
    : songData.title === "Chất gây hại"
    ? "https://wikiceleb.org/wp-content/uploads/2025/02/quang-hung-masterd-1.jpg"
    : songData.title === "Túc Duyên Lofi"
    ? "https://toplist.vn/images/800px/nu-ca-si-tre-dep-nhat-viet-nam-765760.jpg"
    : songData.title === "Góc Nhỏ Trong Tim Lofi"
    ? "https://toplist.vn/images/800px/nu-ca-si-tre-dep-nhat-viet-nam-765760.jpg"
    : songData.title === "Hoang Mang Lofi"
    ? "https://toplist.vn/images/800px/nu-ca-si-tre-dep-nhat-viet-nam-765760.jpg"
    : songData.title === "Nhường Lại Nỗi Đau Lofi"
    ? "https://toplist.vn/images/800px/nu-ca-si-tre-dep-nhat-viet-nam-765760.jpg"
    : songData.title === "Em Thua Người Ta Nhiều Lắm Lofi"
    ? "https://toplist.vn/images/800px/nu-ca-si-tre-dep-nhat-viet-nam-765760.jpg"
    : songData.title === "Bên Nhau Cả Đời Lofi"
    ? "https://toplist.vn/images/800px/nu-ca-si-tre-dep-nhat-viet-nam-765760.jpg"
    : songData.title === "Ngôi Nhà Hạnh Phúc Lofi"
    ? "https://toplist.vn/images/800px/nu-ca-si-tre-dep-nhat-viet-nam-765760.jpg"
    : songData.title === "Dặm Trong Tim Lofi"
    ? "https://toplist.vn/images/800px/nu-ca-si-tre-dep-nhat-viet-nam-765760.jpg"
    : songData.title === "Nửa Vầng Trăng Lofi"
    ? "https://toplist.vn/images/800px/nu-ca-si-tre-dep-nhat-viet-nam-765760.jpg"
    : songData.title === "Anh Lofi"
    ? "https://toplist.vn/images/800px/nu-ca-si-tre-dep-nhat-viet-nam-765760.jpg"
    : songData.title === "Hiểu lầm"
    ? "https://nguoinoitieng.tv/images/nnt/103/1/bgxm.jpg"
    : songData.title === "Em không hiểu"
    ? "https://nguoinoitieng.tv/images/nnt/103/1/bgxm.jpg"
    : songData.title === "Anh đang nơi đâu"
    ? "https://nguoinoitieng.tv/images/nnt/103/1/bgxm.jpg"
    : songData.title === "Và thế giới đã mất đi một người cô đơn"
    ? "https://nguoinoitieng.tv/images/nnt/103/1/bgxm.jpg"
    : songData.title === "Lỡ say Bye là Bye"
    ? "https://nguoinoitieng.tv/images/nnt/103/1/bgxm.jpg"
    : songData.title === "Hướng Dương"
    ? "https://nguoinoitieng.tv/images/nnt/103/1/bgxm.jpg"
    : songData.title === "Sài Gòn đâu có lạnh"
    ? "https://nguoinoitieng.tv/images/nnt/103/1/bgxm.jpg"
    : songData.title === "Định mệnh tình yêu"
    ? "https://nguoinoitieng.tv/images/nnt/103/1/bgxm.jpg"
    : songData.title === "Tuesday"
    ? "https://nguoinoitieng.tv/images/nnt/103/1/bgxm.jpg"
    : songData.title === "Trạm dừng chân"
    ? "https://cdn2.tuoitre.vn/471584752817336320/2025/5/2/cscscs-17461597679162100078217.jpeg"
    : songData.title === "Yêu kiều"
    ? "https://cdn2.tuoitre.vn/471584752817336320/2025/5/2/cscscs-17461597679162100078217.jpeg"
    : songData.title === "Quá khứ kia của anh"
    ? "https://www.ys1ys.org/wp-content/uploads/2025/12/andree-la-ai-768x769.jpg"
    : songData.title === "Người như anh xứng đáng cô đơn"
    ? "https://bazaarvietnam.vn/wp-content/uploads/2025/08/VU-CAT-TUONG-ANH-TRAI-SAY-HI-2025.jpg"
    : songData.title === "Người im lặng gặp người hay nói"
    ? "https://kenh14cdn.com/203336854389633024/2023/8/15/hiaa-1692105898029388580997.jpg"
    : songData.title === "Nói anh nghe"
    ? "https://image.phunuonline.com.vn/fckeditor/upload/2023/20231218/images/ca-si-hoang-hai-tro-lai-sau-_201702901525.jpg"
    : songData.title === "Hoa vô sắc"
    ? "https://cdn2.tuoitre.vn/471584752817336320/2025/5/2/cscscs-17461597679162100078217.jpeg"
    : songData.title === "Liễu Thanh Yên"
    ? "https://cdn2.tuoitre.vn/471584752817336320/2025/5/2/cscscs-17461597679162100078217.jpeg"
    : songData.title === "Không buông"
    ? "https://i.scdn.co/image/ab67616d0000b273f9f88791c6b9019b65fc0a87"
    : songData.title === "Đứa trẻ mùa đông chí"
    ? "https://cdn2.tuoitre.vn/471584752817336320/2025/5/2/cscscs-17461597679162100078217.jpeg"
    : songData.title === "Chúng ta rồi sẽ hạnh phúc"
    ? "https://cdn2.tuoitre.vn/471584752817336320/2025/5/2/cscscs-17461597679162100078217.jpeg"
    : songData.title === "Cho con"
    ? "https://vietdaily.vn/wp-content/uploads/2023/05/BRAY-307-1.jpg"
    : songData.title === "Cô ta"
    ? "https://cdn2.tuoitre.vn/471584752817336320/2025/5/2/cscscs-17461597679162100078217.jpeg"
    : songData.title === "Cô đơn"
    ? "https://i.scdn.co/image/ab67616d0000b273f9f88791c6b9019b65fc0a87"
    : songData.title === "BLA BLA BLA"
    ? "https://tse2.mm.bing.net/th/id/OIP.2AsS_yYEW4aoq-PLejU6KgHaKe?r=0&cb=thfvnextfalcon2&rs=1&pid=ImgDetMain&o=7&rm=3"
    : songData.title === "Buông"
    ? "https://i.scdn.co/image/ab67616d0000b273f9f88791c6b9019b65fc0a87"
    : songData.title === "100 cuộc gọi nhỡ"
    ? "https://d1j8r0kxyu9tj8.cloudfront.net/files/yvaLrd3asRv0tLNpcNXPeY5ahwBp7chK43VsUiMs.jpg"
    : songData.title === "01 ngoại lệ"
    ? "https://cdn2.tuoitre.vn/471584752817336320/2025/5/2/cscscs-17461597679162100078217.jpeg"
    : songData.title === "Thủ đô Cypher"
    ? "https://nguoinoitieng.tv/images/nnt/102/0/bf74.jpg"
    : songData.title === "Ex hate me"
    ? "https://i.vietgiaitri.com/2020/2/28/bo-doi-bray-va-amee-tung-poster-cuc-chat-cho-man-tro-lai-nam-2020-d5f-4660411.jpg"
    : songData.title === "She never know"
    ? "https://tse3.mm.bing.net/th/id/OIP.ryAlzjAPwQPULmzyBl3RZwHaLG?r=0&cb=thfvnextfalcon2&rs=1&pid=ImgDetMain&o=7&rm=3"
    : songData.title === "Kim phút kim giờ"
    ? "https://i.pinimg.com/originals/80/3d/10/803d10da2296f7d1483936c033df15ec.jpg"
    : songData.title === "Bạn đời"
    ? "https://bazaarvietnam.vn/wp-content/uploads/2023/11/HBVN-karik-va-only-c-tai-hop-trong-mv-moi-nguoi-ke-tiep-1.jpg"
    : songData.title === "Ngủ trong phòng thu"
    ? "https://tse1.mm.bing.net/th/id/OIP.dwkq7coyhvBwPsfmyHxixwHaHb?r=0&cb=thfvnextfalcon2&rs=1&pid=ImgDetMain&o=7&rm=3"
    : songData.title === "Don''t côi"
    ? "https://i.scdn.co/image/ab6761610000e5eb52e4f3bc88ce00be25c5f747"
    : songData.title === "Ex sign"
    ? "https://kenh14cdn.com/203336854389633024/2023/8/15/hiaa-1692105898029388580997.jpg"



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
              {(artistDetails?.monthlyListeners || songData.monthlyListeners) ? `${(artistDetails?.monthlyListeners || songData.monthlyListeners || 0).toLocaleString()} monthly listeners` : 'Click để xem chi tiết'}
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
                    {(artistDetails?.followers || songData.followers || 0).toLocaleString()}
                  </p>
                  <p style={{ color: "#a7a7a7", fontSize: "11px", margin: "4px 0 0 0", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Followers
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: "28px", fontWeight: 800, margin: 0, color: "#fff", letterSpacing: "-1px" }}>
                    {(artistDetails?.monthlyListeners || songData.monthlyListeners || 0).toLocaleString()}
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
