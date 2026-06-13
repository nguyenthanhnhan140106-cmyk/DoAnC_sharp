import React, { useState } from 'react';
import Header from '../Components/header';
import Sidebar from '../Components/Sidebar';
import PlayerBar from '../Components/PlayerBar';
import RightSidebar from '../Components/RightSidebar';
import Footer from '../Components/Footer';
import { useAuth } from '../Contexts/AuthContext';
import { useMusic } from '../Contexts/MusicContext';
import { type NotificationModel } from '../Services/notificationService';
import { useNotification } from '../Contexts/NotificationContext';
import { songService } from '../Services/songService';
import '../Components/Styles/HomePage.css';
import '../Components/Styles/NotificationsPage.css';

export default function NotificationsPage() {
  const { isLoggedIn } = useAuth();
  const { playSong, showToast } = useMusic();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Music');
  const [loadingSongId, setLoadingSongId] = useState<number | null>(null);
  const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead } = useNotification();

  const handleNotificationClick = async (notification: NotificationModel) => {
    // Đánh dấu đã đọc
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }

    // Nếu là thông báo chia sẻ nhạc → fetch bài hát đầy đủ rồi phát
    if (notification.type === 'SharedMedia' && notification.payload) {
      try {
        const payloadObj = JSON.parse(notification.payload);
        if (payloadObj.SongId || payloadObj.songId) {
          const songId = payloadObj.SongId || payloadObj.songId;
          setLoadingSongId(songId);
          // Fetch đầy đủ thông tin bài hát (bao gồm audioUrl) từ API
          const fullSong = await songService.getSongById(songId);
          if (fullSong && fullSong.audioUrl) {
            playSong(fullSong);
            showToast(`🎵 Đang phát: ${fullSong.title}`, fullSong.coverUrl);
          } else {
            showToast('Bài hát này chưa có file âm thanh.');
          }
          setLoadingSongId(null);
        }
      } catch (e) {
        console.error("Lỗi khi tải bài hát:", e);
        showToast('Không thể tải bài hát này.');
        setLoadingSongId(null);
      }
    }
  };


  return (
    <div className={`spotify-layout ${isSidebarCollapsed ? 'sidebar-hidden' : ''} ${!isLoggedIn || isRightCollapsed ? 'right-hidden' : ''}`}>
      <Header />
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <div className="main-view">
        <div className="content-wrapper notifications-wrapper">
          <div className="notifications-header">
            <h1>Thông báo của bạn</h1>
            <p>Tin nhắn chia sẻ nhạc từ bạn bè và các bản cập nhật khác.</p>
            
            <div className="notifications-filters" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <button 
                  className={`filter-chip ${activeFilter === 'Music' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('Music')}
                >
                  Music
                </button>
              </div>
              
              {unreadCount > 0 && (
                <button 
                  onClick={markAllNotificationsAsRead}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#fff';
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="notifications-empty-state">
              <h2>Bạn chưa có thông báo nào</h2>
              <p>Khi có người chia sẻ nhạc cho bạn, thông báo sẽ xuất hiện ở đây.</p>
            </div>
          ) : (
            <div className="notifications-list" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.map(notif => {
                let payload: Record<string, unknown> = {};
                try { payload = JSON.parse(notif.payload); } catch { /* ignore error */ }
                const isSharedSong = notif.type === 'SharedMedia';
                const songCover = (payload.SongCover || payload.songCover) as string;
                const message = (payload.Message || payload.message || 'Có một chia sẻ âm nhạc mới') as string;
                const isLoading = isSharedSong && loadingSongId === (payload.SongId || payload.songId);

                return (
                  <div
                    key={notif.id}
                    className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '15px', padding: '15px',
                      backgroundColor: notif.isRead ? 'rgba(255,255,255,0.04)' : 'rgba(29, 215, 96, 0.1)',
                      border: notif.isRead ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(29, 215, 96, 0.3)',
                      borderRadius: '12px', cursor: isSharedSong ? 'pointer' : 'default',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    {/* Ảnh bìa bài hát */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      {songCover ? (
                        <img src={songCover} alt="cover" style={{
                          width: '56px', height: '56px', borderRadius: '8px',
                          objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                        }} />
                      ) : (
                        <div style={{
                          width: '56px', height: '56px', borderRadius: '8px',
                          backgroundColor: '#282828', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontSize: '24px'
                        }}>
                          🎵
                        </div>
                      )}
                      {/* Overlay icon play khi là SharedMedia */}
                      {isSharedSong && (
                        <div style={{
                          position: 'absolute', inset: 0, borderRadius: '8px',
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: 0, transition: 'opacity 0.2s',
                        }}
                          className="play-overlay"
                        >
                          {isLoading ? (
                            <span style={{ fontSize: '18px' }}>⏳</span>
                          ) : (
                            <span style={{ fontSize: '20px' }}>▶</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Nội dung thông báo */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: '0 0 4px 0', fontSize: '15px', color: '#fff',
                        fontWeight: notif.isRead ? 'normal' : '600',
                        lineHeight: '1.4'
                      }}>
                        {isLoading ? '⏳ Đang tải bài hát...' : message}
                      </p>
                      {isSharedSong && (
                        <span style={{
                          display: 'inline-block', fontSize: '11px', color: '#1ed760',
                          backgroundColor: 'rgba(29,215,96,0.15)', padding: '2px 8px',
                          borderRadius: '10px', marginBottom: '4px'
                        }}>
                          🎵 Nhạc được chia sẻ — Bấm để nghe
                        </span>
                      )}
                      <div>
                        <span style={{ fontSize: '12px', color: '#b3b3b3' }}>
                          {new Date(notif.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    {/* Chấm xanh chưa đọc */}
                    {!notif.isRead && (
                      <div style={{
                        width: '10px', height: '10px', backgroundColor: '#1ed760',
                        borderRadius: '50%', flexShrink: 0
                      }}></div>
                    )}
                  </div>
                );
              })}
            </div>

          )}
          
          <div style={{ marginTop: 'auto' }}>
            <Footer />
          </div>
        </div>
      </div>

      {isLoggedIn && <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />}
      <PlayerBar />
    </div>
  );
}
