import React, { useState, useEffect } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { useMusic } from '../Contexts/MusicContext';
import './Styles/HomePage.css'; // Add modal styles here later

export default function AddToPlaylistModal() {
  const { user } = useAuth();
  const { 
    isAddToPlaylistModalOpen, 
    closeAddToPlaylistModal, 
    selectedSongForModal,
    likedSongs,
    toggleLikeSong,
    isSongLiked,
    modalPosition
  } = useMusic() as any;

  const [playlists, setPlaylists] = useState<any[]>([]);
  const [songPlaylists, setSongPlaylists] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAddToPlaylistModalOpen && user && selectedSongForModal) {
      fetchPlaylists();
      fetchSongPlaylists();
    }
  }, [isAddToPlaylistModalOpen, user, selectedSongForModal]);

  const fetchPlaylists = async () => {
    try {
      if (!user) return;
      const res = await fetch(`/api/playlists/user/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSongPlaylists = async () => {
    try {
      if (!user) return;
      const res = await fetch(`/api/playlists/user/${user.id}/contains/${selectedSongForModal.id}`);
      if (res.ok) {
        const data = await res.json();
        setSongPlaylists(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePlaylist = async (playlistId: number) => {
    const isCurrentlyInPlaylist = songPlaylists.includes(playlistId);
    try {
      if (isCurrentlyInPlaylist) {
        const res = await fetch(`/api/playlists/${playlistId}/songs/${selectedSongForModal.id}`, { method: 'DELETE' });
        if (res.ok) {
          setSongPlaylists(prev => prev.filter(id => id !== playlistId));
          window.dispatchEvent(new Event('playlistUpdated'));
        }
      } else {
        const res = await fetch(`/api/playlists/${playlistId}/songs/${selectedSongForModal.id}`, { method: 'POST' });
        if (res.ok) {
          setSongPlaylists(prev => [...prev, playlistId]);
          window.dispatchEvent(new Event('playlistUpdated'));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAddToPlaylistModalOpen || !selectedSongForModal) return null;

  const filteredPlaylists = playlists.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getModalStyle = (): React.CSSProperties => {
    if (!modalPosition) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'absolute' };
    let { x, y } = modalPosition;
    const modalWidth = 350; // Width of modal
    
    // Nếu trượt ra ngoài màn hình bên phải
    if (x + modalWidth > window.innerWidth) x = window.innerWidth - modalWidth - 20;
    
    // Nếu click ở nửa dưới màn hình -> Canh theo bottom để nó luôn bám sát chuột
    if (y > window.innerHeight / 2) {
      return { 
        bottom: window.innerHeight - y + 10, 
        left: x, 
        position: 'absolute' 
      };
    }
    
    // Nếu click ở nửa trên màn hình -> Canh theo top
    return { top: y + 20, left: x, position: 'absolute' };
  };

  return (
    <div className="add-to-playlist-overlay" onClick={closeAddToPlaylistModal}>
      <div className="add-to-playlist-modal" style={getModalStyle()} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add to playlist</h2>
          <button className="close-btn" onClick={closeAddToPlaylistModal}>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2.27 2.27a.75.75 0 011.06 0l4.67 4.67 4.67-4.67a.75.75 0 011.06 1.06l-4.67 4.67 4.67 4.67a.75.75 0 01-1.06 1.06l-4.67-4.67-4.67 4.67a.75.75 0 01-1.06-1.06l4.67-4.67-4.67-4.67a.75.75 0 010-1.06z"/></svg>
          </button>
        </div>

        <div className="modal-search">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M7 1.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5zM.25 7a6.75 6.75 0 1 1 12.096 4.12l3.184 3.185a.75.75 0 1 1-1.06 1.06L11.304 12.2A6.75 6.75 0 0 1 .25 7z"/></svg>
          <input 
            type="text" 
            placeholder="Find a playlist" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="modal-content-list">
          <button className="new-playlist-btn">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z"/></svg>
            New playlist
          </button>

          <div className="playlist-list">
            <div className="playlist-list-item" onClick={() => toggleLikeSong(selectedSongForModal)}>
              <div className="playlist-cover" style={{ background: 'linear-gradient(135deg, #450af5, #8e8ee5)' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>
              <span className="playlist-name">Liked Songs</span>
              <svg className="pin-icon" viewBox="0 0 16 16" width="12" height="12" fill="#1db954"><path d="M8.822.797a2.72 2.72 0 013.847 0l2.534 2.533a2.72 2.72 0 010 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 01-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337L8.822.797z"></path></svg>
              {isSongLiked(selectedSongForModal.id) ? (
                <svg className="check-icon" viewBox="0 0 16 16" width="16" height="16">
                  <circle cx="8" cy="8" r="8" fill="#1ed760" />
                  <path d="M11.466 5.255a.75.75 0 0 1 1.05 1.048l-5.602 5.862a.75.75 0 0 1-1.077.018l-2.45-2.585a.75.75 0 0 1 1.085-1.026l1.928 2.034 5.066-5.351z" fill="#000" />
                </svg>
              ) : (
                <div className="empty-circle"></div>
              )}
            </div>

            {filteredPlaylists.map(pl => {
              const isChecked = songPlaylists.includes(pl.id);
              return (
                <div key={pl.id} className="playlist-list-item" onClick={() => togglePlaylist(pl.id)}>
                  <div className="playlist-cover" style={pl.coverUrl ? { backgroundImage: `url(${pl.coverUrl})`, backgroundSize: 'cover' } : {}}>
                    {!pl.coverUrl && <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 1 0 1.5 1.5v-1.5zm13-11.667H8v11.667h1.5a1.5 1.5 0 1 0 1.5 1.5v-13.167H19V5z"/></svg>}
                  </div>
                  <span className="playlist-name">{pl.name}</span>
                  {isChecked ? (
                    <svg className="check-icon" viewBox="0 0 16 16" width="16" height="16">
                      <circle cx="8" cy="8" r="8" fill="#1ed760" />
                      <path d="M11.466 5.255a.75.75 0 0 1 1.05 1.048l-5.602 5.862a.75.75 0 0 1-1.077.018l-2.45-2.585a.75.75 0 0 1 1.085-1.026l1.928 2.034 5.066-5.351z" fill="#000" />
                    </svg>
                  ) : (
                    <div className="empty-circle"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: 'none', paddingBottom: 24, paddingRight: 24 }}>
          <button className="cancel-btn" style={{ color: '#fff', fontSize: 14, fontWeight: 700, padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', marginRight: 8 }} onClick={closeAddToPlaylistModal}>Cancel</button>
          <button className="done-btn" style={{ backgroundColor: '#fff', color: '#000', borderRadius: 32, fontSize: 14, fontWeight: 700, padding: '8px 24px', border: 'none', cursor: 'pointer' }} onClick={closeAddToPlaylistModal}>Done</button>
        </div>
      </div>
    </div>
  );
}
