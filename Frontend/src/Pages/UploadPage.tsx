import React, { useState } from 'react';
import Header from '../Components/header';
import Sidebar from '../Components/Sidebar';
import PlayerBar from '../Components/PlayerBar';
import RightSidebar from '../Components/RightSidebar';
import { useAuth } from '../Contexts/AuthContext';
import '../Components/Styles/HomePage.css';
import '../Components/Styles/UploadPage.css';

export default function UploadPage() {
  const { isLoggedIn } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState('pop');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Chức năng upload đang được phát triển!');
  };

  return (
    <div className={`spotify-layout ${isSidebarCollapsed ? 'sidebar-hidden' : ''} ${!isLoggedIn || isRightCollapsed ? 'right-hidden' : ''}`}>
      <Header />
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <div className="main-view">
        <div className="content-wrapper">
          <div className="upload-container">
            <div className="upload-header">
              <h1>Upload Audio</h1>
              <p>Share your music or podcasts with the world.</p>
            </div>
            
            <form className="upload-form" onSubmit={handleSubmit}>
              <div className="upload-content-row">
                {/* Cột trái: Ảnh bìa */}
                <div className="upload-left-col">
                  <div className="file-upload-area cover-upload" onClick={() => alert('Chọn ảnh bìa đang được phát triển!')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <div className="file-upload-text">Cover</div>
                    <div className="file-upload-hint">JPG, PNG (Max 5MB)</div>
                  </div>
                </div>

                {/* Cột phải: Thông tin và File Audio */}
                <div className="upload-right-col">
                  <div className="file-upload-area audio-upload" onClick={() => alert('Chọn file audio đang được phát triển!')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                    <div className="file-upload-text">Audio File</div>
                    <div className="file-upload-hint">MP3, WAV up to 50MB</div>
                  </div>

                  <div className="form-group">
                    <label>Title</label>
                    <input 
                      type="text" 
                      placeholder="Enter track title" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>Artist / Creator</label>
                      <input 
                        type="text" 
                        placeholder="Enter artist name" 
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        required 
                      />
                    </div>

                    <div className="form-group half">
                      <label>Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="pop">Pop</option>
                        <option value="rap">Rap / Hip Hop</option>
                        <option value="vsound">Vietnamese Sound</option>
                        <option value="friday">Lofi / Chill</option>
                        <option value="podcast">Podcast</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="upload-submit-btn">
                Publish Track
              </button>
            </form>
          </div>
        </div>
      </div>

      {isLoggedIn && <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />}
      <PlayerBar />
    </div>
  );
}
