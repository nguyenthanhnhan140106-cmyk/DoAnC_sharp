import React, { useState, useRef } from 'react';
import Header from '../Components/header';
import Sidebar from '../Components/Sidebar';
import PlayerBar from '../Components/PlayerBar';
import RightSidebar from '../Components/RightSidebar';
import { useAuth } from '../Contexts/AuthContext';
import API from '../Services/api';
import { useNavigate } from 'react-router-dom';
import '../Components/Styles/HomePage.css';
import '../Components/Styles/UploadPage.css';

export default function UploadPage() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState<number>(1);
  const [categoriesList, setCategoriesList] = useState<{ id: number, name: string }[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCoverFile(e.target.files[0]);
    }
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMediaFile(e.target.files[0]);
    }
  };

  React.useEffect(() => {
    API.get('/categories')
      .then(res => {
        setCategoriesList(res.data);
        if (res.data.length > 0) {
          setCategory(res.data[0].id);
        }
      })
      .catch(err => console.error("Lỗi lấy category:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile) {
      alert('Vui lòng chọn file audio/video để tải lên!');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(20);
    
    try {
      const isVideo = mediaFile.name.match(/\.(mp4|webm|mkv)$/i) !== null;
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('artist', artist);
      formData.append('categoryId', category.toString());
      
      const selectedCategory = categoriesList.find(c => c.id === category);
      if (selectedCategory) {
        formData.append('categoryName', selectedCategory.name);
      }

      if (coverFile) {
        formData.append('coverFile', coverFile);
      }
      
      if (isVideo) {
        formData.append('videoFile', mediaFile);
      } else {
        formData.append('audioFile', mediaFile);
      }

      setUploadProgress(60);

      // Gửi FormData thẳng về Backend
      await API.post('/songs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadProgress(100);
      alert('Upload bài hát thành công!');
      navigate('/');
      
    } catch (err: any) {
      console.error(err);
      setIsUploading(false);
      setUploadProgress(0);
      
      if (err.response?.status === 401) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng xuất và đăng nhập lại!');
      } else {
        alert('Có lỗi xảy ra khi upload! Vui lòng kiểm tra console Backend.');
      }
    }
  };

  return (
    <div className={`spotify-layout ${isSidebarCollapsed ? 'sidebar-hidden' : ''} ${!isLoggedIn || isRightCollapsed ? 'right-hidden' : ''}`}>
      <Header />
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <div className="main-view">
        <div className="content-wrapper">
          <div className="upload-container">
            <div className="upload-header">
              <h1>Upload Media</h1>
              <p>Share your music or podcasts with the world.</p>
            </div>
            
            <form className="upload-form" onSubmit={handleSubmit}>
              <div className="upload-content-row">
                <div className="upload-left-col">
                  <input type="file" ref={coverInputRef} style={{ display: 'none' }} accept="image/png, image/jpeg" onChange={handleCoverSelect} />
                  <div className="file-upload-area cover-upload" onClick={() => coverInputRef.current?.click()} style={coverFile ? { background: '#333', borderColor: '#1db954' } : {}}>
                    {coverFile ? (
                      <div className="file-upload-text" style={{ color: '#1db954' }}>Đã chọn: {coverFile.name}</div>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <div className="file-upload-text">Cover</div>
                        <div className="file-upload-hint">JPG, PNG (Max 5MB)</div>
                      </>
                    )}
                  </div>
                </div>

                <div className="upload-right-col">
                  <input type="file" ref={mediaInputRef} style={{ display: 'none' }} accept="audio/*, video/mp4, video/webm" onChange={handleMediaSelect} />
                  <div className="file-upload-area audio-upload" onClick={() => mediaInputRef.current?.click()} style={mediaFile ? { background: '#333', borderColor: '#1db954' } : {}}>
                    {mediaFile ? (
                      <div className="file-upload-text" style={{ color: '#1db954' }}>Đã chọn: {mediaFile.name}</div>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18V5l12-2v13" />
                          <circle cx="6" cy="18" r="3" />
                          <circle cx="18" cy="16" r="3" />
                        </svg>
                        <div className="file-upload-text">Audio/Video File</div>
                        <div className="file-upload-hint">MP3, WAV, MP4 up to 50MB</div>
                      </>
                    )}
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
                      <select value={category} onChange={(e) => setCategory(Number(e.target.value))}>
                        {categoriesList.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {isUploading && (
                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#b3b3b3' }}>Đang upload...</span>
                    <span style={{ fontSize: '14px', color: '#1db954' }}>{uploadProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#1db954', transition: 'width 0.3s ease' }}></div>
                  </div>
                </div>
              )}

              <button type="submit" className="upload-submit-btn" disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Publish Track'}
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
