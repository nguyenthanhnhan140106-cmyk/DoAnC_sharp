import { useEffect, useMemo, useState } from 'react';
import API from '../Services/api';
import '../Components/Styles/ShareNotification.css';

interface NotificationItem {
  id: number;
  userId: number;
  type: string;
  payload?: string;
  title?: string;
  description?: string;
  isRead: boolean;
  createdAt: string;
  coverUrl?: string;
}

interface SharedItem {
  id: number;
  senderUserId?: number;
  senderId?: number;
  senderName?: string;
  receiverUserId?: number;
  receiverId?: number;
  songId?: number | null;
  playlistId?: number | null;
  title?: string;
  artist?: string;
  coverUrl?: string;
  message?: string;
  sharedAt: string;
}

function getCurrentUserId(): number | null {
  const userRaw = localStorage.getItem('user');

  if (userRaw) {
    try {
      const user = JSON.parse(userRaw);
      const id = Number(user.id || user.userId || user.Id || user.UserId);

      if (Number.isFinite(id) && id > 0) {
        return id;
      }
    } catch {
      // Ignore invalid user json
    }
  }

  const token = localStorage.getItem('token');

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      const id = Number(
        payload.id ||
          payload.userId ||
          payload.nameid ||
          payload.sub ||
          payload[
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
          ]
      );

      if (Number.isFinite(id) && id > 0) {
        return id;
      }
    } catch {
      // Ignore invalid token
    }
  }

  return null;
}

function parseNotification(item: NotificationItem) {
  if (item.title || item.description) {
    return {
      title: item.title || 'Thông báo',
      description: item.description || '',
      coverUrl: item.coverUrl,
    };
  }

  if (!item.payload) {
    return {
      title: 'Thông báo',
      description: '',
      coverUrl: undefined,
    };
  }

  try {
    const data = JSON.parse(item.payload);

    return {
      title: data.title || data.Title || 'Thông báo',
      description:
        data.description ||
        data.Description ||
        data.message ||
        data.Message ||
        '',
      coverUrl: data.coverUrl || data.CoverUrl,
    };
  } catch {
    return {
      title: 'Thông báo',
      description: item.payload,
      coverUrl: undefined,
    };
  }
}

export default function NotificationPage() {
  const userId = useMemo(() => getCurrentUserId(), []);
  const [activeTab, setActiveTab] = useState<'notifications' | 'shared'>(
    'notifications'
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const loadData = async () => {
    if (!userId) {
      setError('Bạn cần đăng nhập để xem thông báo.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [notiRes, sharedRes] = await Promise.all([
        API.get(`/notifications/user/${userId}`),
        API.get(`/media-shares/received/${userId}`),
      ]);

      setNotifications(Array.isArray(notiRes.data) ? notiRes.data : []);
      setSharedItems(Array.isArray(sharedRes.data) ? sharedRes.data : []);
    } catch (err: any) {
      console.error('Không tải được thông báo/chia sẻ:', err);
      setError(err?.response?.data?.message || 'Không tải được thông báo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const markAsRead = async (id: number) => {
    try {
      await API.put(`/notifications/${id}/read`);
      await loadData();
    } catch (err) {
      console.error('Không thể đánh dấu đã đọc:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      await API.put(`/notifications/user/${userId}/read-all`);
      await loadData();
    } catch (err) {
      console.error('Không thể đánh dấu đọc hết:', err);
    }
  };

  return (
    <main className="tv-notification-page">
      <section className="tv-notification-card">
        <div className="tv-notification-page-head">
          <div>
            <p>Trung tâm thông báo</p>
            <h1>Thông báo</h1>
            <span>{unreadCount} chưa đọc</span>
          </div>

          <button type="button" onClick={markAllAsRead} disabled={unreadCount === 0}>
            Đọc hết
          </button>
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

        {error && <div className="tv-status error">{error}</div>}

        <div className="tv-notification-list page-list">
          {loading && <div className="tv-empty">Đang tải...</div>}

          {!loading && activeTab === 'notifications' && notifications.length === 0 && (
            <div className="tv-empty">Chưa có thông báo nào.</div>
          )}

          {!loading &&
            activeTab === 'notifications' &&
            notifications.map((item) => {
              const data = parseNotification(item);

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`tv-notification-item ${item.isRead ? '' : 'unread'}`}
                  onClick={() => markAsRead(item.id)}
                >
                  <img
                    src={
                      data.coverUrl ||
                      `https://picsum.photos/seed/noti-${item.id}/80/80`
                    }
                    alt=""
                  />

                  <span>
                    <b>{data.title}</b>
                    <small>{data.description}</small>
                    <time>{new Date(item.createdAt).toLocaleString('vi-VN')}</time>
                  </span>
                </button>
              );
            })}

          {!loading && activeTab === 'shared' && sharedItems.length === 0 && (
            <div className="tv-empty">Chưa có media nào được chia sẻ với bạn.</div>
          )}

          {!loading &&
            activeTab === 'shared' &&
            sharedItems.map((item) => (
              <div key={item.id} className="tv-notification-item shared-card">
                <img
                  src={
                    item.coverUrl ||
                    `https://picsum.photos/seed/share-${item.id}/80/80`
                  }
                  alt=""
                />

                <span>
                  <b>{item.title || 'Media được chia sẻ'}</b>

                  <small>
                    {item.artist || 'TuneVault'} •{' '}
                    {item.senderName || 'Người dùng'} đã chia sẻ
                  </small>

                  {item.message && <small>Lời nhắn: {item.message}</small>}

                  <time>{new Date(item.sharedAt).toLocaleString('vi-VN')}</time>
                </span>
              </div>
            ))}
        </div>
      </section>
    </main>
  );
}