import { useEffect, useState } from 'react';
import API from '../Services/api';
import './Styles/ShareNotification.css';

interface SongLike {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
}

interface Props {
  song: SongLike | null;
  open: boolean;
  onClose: () => void;
}

const users = [
  { id: 1, name: 'User 1 - Tôi' },
  { id: 2, name: 'User 2 - Bạn nghe nhạc' },
  { id: 3, name: 'User 3 - Thành viên nhóm' },
  { id: 4, name: 'User 4 - Khách mời' },
];

const getCurrentUserId = () => {
  const stored = Number(localStorage.getItem('tunevaultCurrentUserId') || '1');
  return Number.isFinite(stored) && stored > 0 ? stored : 1;
};

export default function ShareMediaDialog({ song, open, onClose }: Props) {
  const [senderId, setSenderId] = useState<number>(getCurrentUserId());
  const [receiverId, setReceiverId] = useState<number | ''>('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      const currentId = getCurrentUserId();
      setSenderId(currentId);
      setReceiverId('');
      setMessage('');
      setStatus('');
      setSending(false);
    }
  }, [open, song]);

  if (!open || !song) return null;

  const receivers = users.filter((user) => user.id !== senderId);

  const handleClose = () => {
    if (sending) return;
    setReceiverId('');
    setMessage('');
    setStatus('');
    onClose();
  };

  const submit = async () => {
    if (!song?.id) {
      setStatus('Không tìm thấy bài hát để chia sẻ.');
      return;
    }

    if (!receiverId) {
      setStatus('Bạn hãy chọn người nhận.');
      return;
    }

    if (senderId === receiverId) {
      setStatus('Không thể chia sẻ cho chính mình.');
      return;
    }

    setSending(true);
    setStatus('');

    try {
      await API.post('/media-shares', {
        senderId,
        receiverId,
        songId: song.id,
        albumId: null,
        message: message.trim() || null,
      });

      window.dispatchEvent(new CustomEvent('tunevault:notification-refresh'));
      setStatus('Đã gửi chia sẻ thành công.');

      setTimeout(() => {
        setReceiverId('');
        setMessage('');
        setStatus('');
        onClose();
      }, 700);
    } catch (error: any) {
      console.error('Lỗi gửi chia sẻ:', error);
      console.error('Status code:', error?.response?.status);
      console.error('Response backend:', error?.response?.data);

      const statusCode = error?.response?.status;
      const backendMessage = error?.response?.data?.message;

      if (statusCode === 404) {
        setStatus('Lỗi 404: Backend chưa có API /api/media-shares hoặc backend chưa chạy lại.');
      } else if (statusCode === 500) {
        setStatus(backendMessage || 'Lỗi 500: Backend nhận được request nhưng lỗi service/database.');
      } else if (statusCode === 400) {
        setStatus(backendMessage || 'Dữ liệu chia sẻ không hợp lệ.');
      } else {
        setStatus(backendMessage || error?.message || 'Gửi chia sẻ thất bại. Kiểm tra backend/API.');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="tv-modal-backdrop" onMouseDown={handleClose}>
      <div className="tv-share-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <div className="tv-dialog-head">
          <div>
            <p>Chia sẻ bài hát</p>
            <h3>{song.title}</h3>
          </div>

          <button type="button" onClick={handleClose} disabled={sending}>
            ×
          </button>
        </div>

        <div className="tv-share-song">
          <img src={song.coverUrl || `https://picsum.photos/seed/${song.id}/96/96`} alt={song.title} />

          <div>
            <b>{song.title}</b>
            <span>{song.artist}</span>
          </div>
        </div>

        <label className="tv-field">
          Người gửi
          <select
            value={senderId}
            onChange={(e) => {
              const value = Number(e.target.value);
              setSenderId(value);
              localStorage.setItem('tunevaultCurrentUserId', String(value));
              setReceiverId('');
            }}
            disabled={sending}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>

        <label className="tv-field">
          Người nhận
          <select value={receiverId} onChange={(e) => setReceiverId(Number(e.target.value))} disabled={sending}>
            <option value="">Chọn người nhận</option>

            {receivers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
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

        <button className="tv-submit" type="button" onClick={submit} disabled={sending}>
          {sending ? 'Đang gửi...' : 'Gửi chia sẻ'}
        </button>
      </div>
    </div>
  );
}
