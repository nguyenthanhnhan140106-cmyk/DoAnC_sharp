import React, { useEffect, useState } from 'react';
import API from '../Services/api';
import '../Components/Styles/HomePage.css';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  initialTab: 'followers' | 'following';
}

interface CombinedData {
  id: number;
  name: string;
  avatarUrl?: string;
  type: 'user' | 'artist';
}

export default function FollowListModal({ isOpen, onClose, userId, initialTab }: FollowListModalProps) {
  const [dataList, setDataList] = useState<CombinedData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, initialTab, userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (initialTab === 'followers') {
        const res = await API.get(`/follow/user/${userId}/followers`);
        const formatted = (res.data || []).map((u: any) => ({
          id: u.userId,
          name: u.username,
          avatarUrl: u.avatarUrl,
          type: 'user' as const
        }));
        setDataList(formatted);
      } else {
        const [usersRes, artistsRes] = await Promise.all([
          API.get(`/follow/user/${userId}/following`),
          API.get(`/follow/user/${userId}/following-artists`)
        ]);
        
        const formattedUsers = (usersRes.data || []).map((u: any) => ({
          id: u.userId,
          name: u.username,
          avatarUrl: u.avatarUrl,
          type: 'user' as const
        }));
        
        const formattedArtists = (artistsRes.data || []).map((a: any) => ({
          id: a.artistId || a.id,
          name: a.name,
          avatarUrl: a.coverUrl,
          type: 'artist' as const
        }));
        
        setDataList([...formattedUsers, ...formattedArtists]);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách follow:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const title = initialTab === 'followers' ? 'Followers' : 'Following';

  return (
    <div className="auth-modal-overlay" onClick={onClose} style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className="auth-modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          width: '800px', 
          maxWidth: '95vw', 
          height: '70vh', 
          background: '#181818', 
          borderRadius: '8px', 
          display: 'flex', 
          flexDirection: 'column',
          padding: '32px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '8px' }}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M3.293 3.293a1 1 0 0 1 1.414 0L12 10.586l7.293-7.293a1 1 0 1 1 1.414 1.414L13.414 12l7.293 7.293a1 1 0 0 1-1.414 1.414L12 13.414l-7.293 7.293a1 1 0 0 1-1.414-1.414L10.586 12 3.293 4.707a1 1 0 0 1 0-1.414z"/>
          </svg>
        </button>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '32px' }}>
          {title}
        </h2>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#b3b3b3', marginTop: '40px' }}>Đang tải...</div>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                {dataList.map((item, idx) => (
                  <div 
                    key={`${item.type}-${item.id}-${idx}`} 
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', width: '150px' }} 
                    onClick={() => { 
                      onClose(); 
                      window.location.href = item.type === 'artist' ? `/artist/${item.id}` : `/user/${item.id}`; 
                    }}
                  >
                    <div style={{
                      width: '150px', height: '150px', borderRadius: '50%',
                      backgroundImage: item.avatarUrl ? `url(${item.avatarUrl})` : 'none',
                      backgroundColor: '#282828', backgroundSize: 'cover', backgroundPosition: 'center',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(0,0,0,.5)'
                    }}>
                      {!item.avatarUrl && <span style={{ color: '#fff', fontWeight: 700, fontSize: '32px' }}>{item.name ? item.name[0].toUpperCase() : '?'}</span>}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                        {item.name}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#b3b3b3', textTransform: 'capitalize' }}>{item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {dataList.length > 0 && <hr style={{ borderTop: '1px solid #2a2a2a', margin: '32px 0 0 0' }} />}
              
              {dataList.length === 0 && (
                <div style={{ textAlign: 'center', color: '#b3b3b3', marginTop: '40px' }}>Danh sách trống.</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
