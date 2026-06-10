import { useEffect, useMemo, useState } from 'react';
import API from '../Services/api';
import './Styles/ShareNotification.css';

interface SongLike {
  id: number;
  title: string;
  artist?: string;
  coverUrl?: string;
}

interface UserItem {
  id: number;
  username?: string;
  email?: string;
}

interface Props {
  song: SongLike | null;
  open: boolean;
  onClose: () => void;
}

function getCurrentUserId(): number | null {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const rawId = payload.id || payload.userId || payload.nameid || payload.sub || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    const id = Number(rawId);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export default function ShareMediaDialog({ song, open, onClose }: Props) {
  const currentUserId = useMemo(() => getCurrentUserId(), [open]);
  const [users, setUsers] = useState<UserItem[]>([]);
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
    setLoadingUsers(true);

    API.get('/Users')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setUsers(list.filter((user: UserItem) => Number(user.id) !== Number(currentUserId)));
      })
      .catch((err) => {
        console.error('Không lấy được danh sách user:', err);
        setStatus('Không lấy được danh sách tài khoản. Kiểm tra API /api/Users.');
      })
      .finally(() => setLoadingUsers(false));
  }, [open, currentUserId]);

  if (!open || !song) return null;

  const submit = async () => {
    if (!currentUserId) {
      setStatus('Bạn cần đăng nhập lại để chia sẻ.');
      return;
    }

    if (!receiverUserId) {
      setStatus('Bạn hãy chọn người nhận.');
      return;
    }

    setSending(true);
    setStatus('');

    try {
      await API.post('/media-shares', {
        senderUserId: currentUserId,
        receiverUserId,
        songId: song.id,
        playlistId: null,
        message: message.trim() || null,
      });

      setStatus('Đã gửi chia sẻ thành công.');
      window.dispatchEvent(new CustomEvent('tunevault:notification-refresh'));
      setTimeout(onClose, 700);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi chia sẻ media.';
      setStatus(msg);
      console.error('Lỗi chia sẻ:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="tv-modal-backdrop" onMouseDown={onClose}>
      <div className="tv-share-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <div className="tv-dialog-head">
          <div>
            <p>Chia sẻ media</p>
            <h3>{song.title}</h3>
          </div>
          <button type="button" onClick={onClose} disabled={sending}>×</button>
        </div>

        <div className="tv-share-song">
          <img src={song.coverUrl || `https://picsum.photos/seed/${song.id}/96/96`} alt={song.title} />
          <div>
            <b>{song.title}</b>
            <span>{song.artist || 'Unknown artist'}</span>
          </div>
        </div>

        <label className="tv-field">
          Người nhận
          <select value={receiverUserId} onChange={(e) => setReceiverUserId(Number(e.target.value))} disabled={sending || loadingUsers}>
            <option value="">{loadingUsers ? 'Đang tải tài khoản...' : 'Chọn tài khoản'}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username || user.email || `User ${user.id}`}
              </option>
            ))}
          </select>
        </label>

        <label className="tv-field">
          Lời nhắn
          <textarea value={message} maxLength={240} placeholder="Nhập lời nhắn..." onChange={(e) => setMessage(e.target.value)} disabled={sending} />
        </label>

        {status && <div className="tv-status">{status}</div>}

        <button className="tv-submit" type="button" onClick={submit} disabled={sending}>
          {sending ? 'Đang gửi...' : 'Gửi chia sẻ'}
        </button>
      </div>
    </div>
  );
}
