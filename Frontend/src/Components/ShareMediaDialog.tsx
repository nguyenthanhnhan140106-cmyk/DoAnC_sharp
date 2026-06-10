import { useEffect, useState } from 'react';
import API from '../Services/api';
import { useAuth } from '../Contexts/AuthContext';
import './Styles/ShareNotification.css';

interface SongLike {
  id: number;
  title: string;
  artist?: string;
  coverUrl?: string;
}

interface ShareUser {
  id: number;
  username: string;
  email?: string;
}

interface Props {
  song: SongLike | null;
  open: boolean;
  onClose: () => void;
}

export default function ShareMediaDialog({ song, open, onClose }: Props) {
  const { user, isLoggedIn } = useAuth();
  const [users, setUsers] = useState<ShareUser[]>([]);
  const [receiverUserId, setReceiverUserId] = useState<number | ''>('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;

    setReceiverUserId('');
    setMessage('');
    setStatus('');
    setUsers([]);

    if (!isLoggedIn) {
      setStatus('Bạn cần đăng nhập trước khi chia sẻ.');
      return;
    }

    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await API.get('/users');
        const data = Array.isArray(res.data) ? res.data : [];
        setUsers(data.filter((item: ShareUser) => item.id !== user?.id));
      } catch (error: any) {
        console.error('Không tải được danh sách tài khoản:', error);
        setStatus(error.response?.data?.message || 'Không tải được danh sách tài khoản.');
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [open, isLoggedIn, user?.id]);

  if (!open || !song) return null;

  const handleClose = () => {
    if (sending) return;
    onClose();
  };

  const submit = async () => {
    if (!isLoggedIn) {
      setStatus('Bạn cần đăng nhập trước khi chia sẻ.');
      return;
    }

    if (!receiverUserId) {
      setStatus('Bạn hãy chọn tài khoản nhận.');
      return;
    }

    setSending(true);
    setStatus('');

    try {
      await API.post('/media-shares', {
        receiverUserId,
        songId: song.id,
        playlistId: null,
        message: message.trim() || null,
      });

      window.dispatchEvent(new CustomEvent('tunevault:notification-refresh'));
      setStatus('Đã chia sẻ thành công.');

      setTimeout(() => {
        onClose();
      }, 650);
    } catch (error: any) {
      console.error('Lỗi chia sẻ media:', error);
      setStatus(error.response?.data?.message || error.message || 'Gửi chia sẻ thất bại.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="tv-modal-backdrop" onMouseDown={handleClose}>
      <div className="tv-share-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <div className="tv-dialog-head">
          <div>
            <p>Chia sẻ media</p>
            <h3>{song.title}</h3>
          </div>

          <button type="button" onClick={handleClose} disabled={sending}>×</button>
        </div>

        <div className="tv-share-song">
          <img src={song.coverUrl || `https://picsum.photos/seed/share-${song.id}/96/96`} alt={song.title} />
          <div>
            <b>{song.title}</b>
            <span>{song.artist || 'Unknown artist'}</span>
          </div>
        </div>

        <label className="tv-field">
          Người gửi
          <input value={user ? `${user.username} (#${user.id})` : 'Chưa đăng nhập'} readOnly />
        </label>

        <label className="tv-field">
          Người nhận
          <select
            value={receiverUserId}
            onChange={(e) => setReceiverUserId(Number(e.target.value))}
            disabled={loadingUsers || sending || !isLoggedIn}
          >
            <option value="">{loadingUsers ? 'Đang tải tài khoản...' : 'Chọn tài khoản nhận'}</option>
            {users.map((item) => (
              <option key={item.id} value={item.id}>
                {item.username}{item.email ? ` - ${item.email}` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="tv-field">
          Lời nhắn
          <textarea
            value={message}
            maxLength={240}
            placeholder="Nhập lời nhắn..."
            onChange={(e) => setMessage(e.target.value)}
            disabled={sending}
          />
        </label>

        {status && <div className="tv-status">{status}</div>}

        <button className="tv-submit" type="button" onClick={submit} disabled={sending || loadingUsers || !isLoggedIn}>
          {sending ? 'Đang gửi...' : 'Gửi chia sẻ'}
        </button>
      </div>
    </div>
  );
}
