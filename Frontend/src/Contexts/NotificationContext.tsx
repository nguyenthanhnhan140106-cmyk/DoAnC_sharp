import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getMyNotifications, markAsRead, markAllAsRead, type NotificationModel } from '../Services/notificationService';
import { useAuth } from './AuthContext';
import { startSignalRConnection, stopSignalRConnection } from '../Services/signalRService';

interface NotificationContextProps {
  notifications: NotificationModel[];
  unreadCount: number;
  markNotificationAsRead: (id: number) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lấy token thực tế từ AuthContext (đã được fix để trả về token JWT thật)
  const { isLoggedIn, token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // Dùng ref để theo dõi trạng thái đã kết nối hay chưa (tránh kết nối trùng lặp)
  const isConnectedRef = useRef(false);

  const refreshNotifications = async () => {
    try {
      const data = await getMyNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Error refreshing notifications:', err);
    }
  };

  useEffect(() => {
    if (isLoggedIn && token) {
      // Tải dữ liệu lần đầu
      refreshNotifications();

      // Chỉ kết nối SignalR nếu chưa kết nối
      if (!isConnectedRef.current) {
        isConnectedRef.current = true;
        startSignalRConnection(token, () => {
          // Callback khi nhận được sự kiện 'ReceiveNotification' từ server
          refreshNotifications();
          // Hiển thị Toast khi có thông báo mới
          window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Bạn có thông báo mới!' }));
        });
      }
    } else {
      setNotifications([]);
      setUnreadCount(0);
      if (isConnectedRef.current) {
        isConnectedRef.current = false;
        stopSignalRConnection();
      }
    }

    // Cleanup: Ngắt kết nối SignalR khi component unmount (tránh kẹt socket gây F5 chậm)
    return () => {
      if (!isLoggedIn && isConnectedRef.current) {
        isConnectedRef.current = false;
        stopSignalRConnection();
      }
    };
  }, [isLoggedIn, token]);

  const markNotificationAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
