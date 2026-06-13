/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { searchUsers, shareMedia, type UserSearch } from '../Services/notificationService';
import { useAuth } from '../Contexts/AuthContext';
import './Styles/ShareModal.css';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: string;
  mediaId: number;
  mediaTitle: string;
  mediaCover: string;
}

export default function ShareModal({ isOpen, onClose, mediaType, mediaId, mediaTitle, mediaCover }: ShareModalProps) {
  const { user } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [users, setUsers] = useState<UserSearch[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [status, setStatus] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setKeyword('');
      setUsers([]);
      setMessage('');
      setSelectedUserId(null);
      setSelectedUserName('');
      setStatus(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!keyword.trim()) {
      setUsers([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const results = await searchUsers(keyword);
        setUsers(results);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [keyword]);

  if (!isOpen) return null;

  const handleShare = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    setStatus(null);
    try {
      const senderName = user?.username || 'Một người bạn';
      await shareMedia(selectedUserId, mediaType, mediaId, mediaTitle, mediaCover, senderName, selectedUserName, message);
      setStatus({ type: 'success', text: `Đã chia sẻ '${mediaTitle}' cho ${selectedUserName}!` });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { Message?: string } } };
      setStatus({ type: 'error', text: error.response?.data?.Message || 'Có lỗi xảy ra.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="share-modal-overlay">
      <div className="share-modal">
        <div className="share-modal-header">
          <h2>Chia sẻ {mediaType === 'song' ? 'bài hát' : mediaType === 'album' ? 'album' : 'danh sách phát'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="share-modal-content">
          <div className="song-preview">
            <img src={mediaCover} alt={mediaTitle} />
            <div className="song-preview-info">
              <span className="song-preview-title">{mediaTitle}</span>
            </div>
          </div>

          <div className="search-section">
            <input 
              type="text" 
              placeholder="Tìm kiếm theo Tên hoặc Email..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="search-user-input"
            />
            {users.length > 0 && (
              <div className="users-list">
                {users.map(u => (
                  <div 
                    key={u.id} 
                    className={`user-item ${selectedUserId === u.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setSelectedUserName(u.username);
                    }}
                  >
                    <div className="user-avatar-small">{u.username.charAt(0).toUpperCase()}</div>
                    <div className="user-info">
                      <span className="user-name">{u.username}</span>
                      <span className="user-email">{u.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {keyword.trim() && users.length === 0 && (
              <div className="no-results">Không tìm thấy người dùng.</div>
            )}
          </div>

          {selectedUserId && (
            <div className="message-section">
              <textarea 
                placeholder="Thêm tin nhắn (tùy chọn)..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="message-input"
              />
            </div>
          )}

          {status && (
            <div className={`status-message ${status.type}`}>
              {status.text}
            </div>
          )}
        </div>

        <div className="share-modal-footer">
          <button className="cancel-btn" onClick={onClose}>Hủy</button>
          <button 
            className="send-btn" 
            onClick={handleShare}
            disabled={!selectedUserId || loading}
          >
            {loading ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
      </div>
    </div>
  );
}
