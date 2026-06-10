import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../Services/api';
import { useAuth } from '../Contexts/AuthContext';
import Header from '../Components/header';
import Sidebar from '../Components/Sidebar';
import RightSidebar from '../Components/RightSidebar';
import PlayerBar from '../Components/PlayerBar';
import TuneBot from '../Components/TuneBot';
import '../Components/Styles/HomePage.css';
import '../Components/Styles/ShareNotification.css';

interface NotificationItem {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  payload?: string;
  isRead: boolean;
  createdAt: string;
}

interface SharedItem {
  id: number;
  senderUserId: number;
  senderUsername: string;
  receiverUserId: number;
  receiverUsername: string;
  songId?: number;
  playlistId?: number;
  mediaType: string;
  mediaTitle: string;
  artist?: string;
  coverUrl?: string;
  message?: string;
  sharedAt: string;
}

export default function NotificationPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [tab, setTab] = useState<'notifications' | 'shared'>('notifications');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const loadData = async () => {
    if (!isLoggedIn) return;

    setLoading(true);
    setError('');

    try {
      const [notificationsRes, sharedRes] = await Promise.all([
        API.get('/notifications'),
        API.get('/media-shares/received'),
      ]);

      setNotifications(Array.isArray(notificationsRes.data) ? notificationsRes.data : []);
      setSharedItems(Array.isArray(sharedRes.data) ? sharedRes.data : []);
    } catch (err: any) {
      console.error('Không tải được trang thông báo:', err);
      setError(err.response?.data?.message || 'Không tải được thông báo. Hãy kiểm tra backend và đăng nhập lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    loadData();

    const refresh = () => loadData();
    window.addEventListener('tunevault:notification-refresh', refresh);

    return () => window.removeEventListener('tunevault:notification-refresh', refresh);
  }, [isLoggedIn]);

  const markAsRead = async (id: number) => {
    await API.put(`/notifications/${id}/read`);
    await loadData();
  };

  const markAllAsRead = async () => {
    await API.put('/notifications/read-all');
    await loadData();
  };

  return (
    <div className={`spotify-layout ${isSidebarCollapsed ? 'sidebar-hidden' : ''} ${isRightCollapsed ? 'right-hidden' : ''}`}>
      <Header />
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <div className="main-view">
        <div className="content-wrapper tv-main-notification-page">
          <div className="tv-page-head">
            <div>
              <p>TuneVault</p>
              <h1>Thông báo</h1>
              <span>{unreadCount} thông báo chưa đọc</span>
            </div>
            <button type="button" onClick={markAllAsRead} disabled={unreadCount === 0}>
              Đánh dấu đã đọc hết
            </button>
          </div>

          <div className="tv-page-tabs">
            <button className={tab === 'notifications' ? 'active' : ''} onClick={() => setTab('notifications')}>
              Thông báo
            </button>
            <button className={tab === 'shared' ? 'active' : ''} onClick={() => setTab('shared')}>
              Đã chia sẻ với tôi
            </button>
          </div>

          {loading && <div className="tv-page-empty">Đang tải...</div>}
          {error && <div className="tv-page-error">{error}</div>}

          {!loading && !error && tab === 'notifications' && (
            <div className="tv-page-list">
              {notifications.length === 0 && <div className="tv-page-empty">Chưa có thông báo nào.</div>}

              {notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`tv-page-notification ${item.isRead ? '' : 'unread'}`}
                  onClick={() => markAsRead(item.id)}
                >
                  <div className="tv-noti-dot" />
                  <div>
                    <b>{item.title}</b>
                    <span>{item.message}</span>
                    <time>{new Date(item.createdAt).toLocaleString('vi-VN')}</time>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && !error && tab === 'shared' && (
            <div className="tv-shared-grid">
              {sharedItems.length === 0 && <div className="tv-page-empty">Chưa có media nào được chia sẻ với bạn.</div>}

              {sharedItems.map((item) => (
                <div key={item.id} className="tv-shared-card">
                  <img src={item.coverUrl || `https://picsum.photos/seed/shared-${item.id}/220/220`} alt={item.mediaTitle} />
                  <div>
                    <small>{item.mediaType === 'playlist' ? 'Playlist' : 'Bài hát / Video'}</small>
                    <h3>{item.mediaTitle}</h3>
                    {item.artist && <p>{item.artist}</p>}
                    <span>Người gửi: {item.senderUsername}</span>
                    {item.message && <em>“{item.message}”</em>}
                    <time>{new Date(item.sharedAt).toLocaleString('vi-VN')}</time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />
      <TuneBot />
      <PlayerBar />
    </div>
  );
}
