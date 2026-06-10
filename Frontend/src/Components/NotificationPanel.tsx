import { useEffect, useState } from 'react';
import API from '../Services/api';
import './Styles/ShareNotification.css';

interface NotificationItem {
  id: number;
  userId: number;
  type: string;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  coverUrl?: string;
}

interface SharedItem {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  songId?: number | null;
  albumId?: number | null;
  mediaType: string;
  title: string;
  artist: string;
  coverUrl?: string;
  message?: string;
  sharedAt: string;
}

interface Props {
  open: boolean;
}

const users = [
  { id: 1, name: 'User 1' },
  { id: 2, name: 'User 2' },
  { id: 3, name: 'User 3' },
  { id: 4, name: 'User 4' },
];

const getCurrentUserId = () => {
  const stored = Number(localStorage.getItem('tunevaultCurrentUserId') || '1');
  return Number.isFinite(stored) && stored > 0 ? stored : 1;
};

export default function NotificationPanel({ open }: Props) {
  const [userId, setUserId] = useState(getCurrentUserId);
  const [activeTab, setActiveTab] = useState<'notifications' | 'shared'>('notifications');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const loadData = async () => {
    setLoading(true);

    try {
      const [notiRes, sharedRes] = await Promise.all([
        API.get(`/notifications/user/${userId}`),
        API.get(`/media-shares/received/${userId}`),
      ]);

      setNotifications(Array.isArray(notiRes.data) ? notiRes.data : []);
      setSharedItems(Array.isArray(sharedRes.data) ? sharedRes.data : []);
    } catch (error) {
      console.error('Không tải được thông báo/chia sẻ:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadData();

    const refresh = () => loadData();
    window.addEventListener('tunevault:notification-refresh', refresh);

    return () => window.removeEventListener('tunevault:notification-refresh', refresh);
  }, [open, userId]);

  const changeUser = (id: number) => {
    setUserId(id);
    localStorage.setItem('tunevaultCurrentUserId', String(id));
  };

  const markAsRead = async (id: number) => {
    await API.put(`/notifications/${id}/read`);
    await loadData();
  };

  const markAllAsRead = async () => {
    await API.put(`/notifications/user/${userId}/read-all`);
    await loadData();
  };

  if (!open) return null;

  return (
    <div className="tv-notification-panel">
      <div className="tv-notification-head">
        <div>
          <h3>Thông báo</h3>
          <span>{unreadCount} chưa đọc</span>
        </div>

        <button type="button" onClick={markAllAsRead} disabled={unreadCount === 0}>
          Đọc hết
        </button>
      </div>

      <div className="tv-user-switch">
        <span>Đang xem</span>
        <select value={userId} onChange={(e) => changeUser(Number(e.target.value))}>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div className="tv-panel-tabs">
        <button
          type="button"
          className={activeTab === 'notifications' ? 'active' : ''}
          onClick={() => setActiveTab('notifications')}
        >
          Thông báo
        </button>
        <button
          type="button"
          className={activeTab === 'shared' ? 'active' : ''}
          onClick={() => setActiveTab('shared')}
        >
          Đã chia sẻ với tôi
        </button>
      </div>

      <div className="tv-notification-list">
        {loading && <div className="tv-empty">Đang tải...</div>}

        {!loading && activeTab === 'notifications' && notifications.length === 0 && (
          <div className="tv-empty">Chưa có thông báo nào.</div>
        )}

        {!loading &&
          activeTab === 'notifications' &&
          notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`tv-notification-item ${item.isRead ? '' : 'unread'}`}
              onClick={() => markAsRead(item.id)}
            >
              <img src={item.coverUrl || `https://picsum.photos/seed/noti-${item.id}/80/80`} alt="" />
              <span>
                <b>{item.title}</b>
                <small>{item.description}</small>
                <time>{new Date(item.createdAt).toLocaleString('vi-VN')}</time>
              </span>
            </button>
          ))}

        {!loading && activeTab === 'shared' && sharedItems.length === 0 && (
          <div className="tv-empty">Chưa có bài hát/album nào được chia sẻ.</div>
        )}

        {!loading &&
          activeTab === 'shared' &&
          sharedItems.map((item) => (
            <div key={item.id} className="tv-notification-item shared-card">
              <img src={item.coverUrl || `https://picsum.photos/seed/share-${item.id}/80/80`} alt="" />
              <span>
                <b>{item.title}</b>
                <small>
                  {item.artist} • {item.senderName} đã chia sẻ
                </small>
                {item.message && <small>Lời nhắn: {item.message}</small>}
                <time>{new Date(item.sharedAt).toLocaleString('vi-VN')}</time>
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
