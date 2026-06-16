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

  // Tùy chọn (Không bắt buộc)
  const [lyricsText, setLyricsText] = useState(''); 
  const [lyricsFile, setLyricsFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const lyricsFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleLyricsFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setLyricsFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLyricsText(event.target.result as string);
        }
      };
      reader.readAsText(file);
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
    
    // 🔴 Kiểm tra ràng buộc bắt buộc: Phải có file ảnh bìa và file âm thanh
    if (!coverFile) {
      alert('Vui lòng chọn ảnh bìa (Cover Image) cho bài hát!');
      return;
    }
    if (!mediaFile) {
      alert('Vui lòng chọn file âm thanh chính (Audio File) để tải lên!');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(15);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('artist', artist);
      formData.append('categoryId', category.toString());
      
      const selectedCategory = categoriesList.find(c => c.id === category);
      if (selectedCategory) {
        formData.append('categoryName', selectedCategory.name);
      }

      formData.append('coverFile', coverFile);
      formData.append('audioFile', mediaFile);

      // Các trường tùy chọn: có thì gửi, không có thì bỏ qua
      if (videoFile) {
        formData.append('videoFile', videoFile);
      }
      if (lyricsText) {
        formData.append('lyricsUrl', lyricsText); 
      }
      if (lyricsFile) {
        formData.append('lyricsFile', lyricsFile);
      }

      setUploadProgress(50);

      await API.post('/songs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(Math.min(50 + Math.floor(percentCompleted / 2), 99));
          }
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
        alert('Có lỗi xảy ra khi upload! Vui lòng kiểm tra cấu hình DTO/Controller ở Backend.');
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
              <p>Upload your media and track details in TuneVault</p>
            </div>
            
            <form className="upload-form" onSubmit={handleSubmit}>
              {/* --- HÀNG NGANG CHỨA 3 KHỐI CHỌN FILE --- */}
              <div className="upload-media-row">
                
                {/* 1. Cover Image (Bắt buộc) */}
                <input type="file" ref={coverInputRef} style={{ display: 'none' }} accept="image/png, image/jpeg" onChange={handleCoverSelect} />
                <div className={`file-upload-card ${coverFile ? 'active' : ''}`} onClick={() => coverInputRef.current?.click()}>
                  {coverFile ? (
                    <div className="file-upload-success">
                      <span className="file-status-icon">✓</span>
                      <div className="file-name-text">Ảnh bìa: {coverFile.name}</div>
                    </div>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <div className="file-upload-text">Cover Image <span className="required-star">*</span></div>
                      <div className="file-upload-hint">JPG, PNG (Max 5MB)</div>
                    </>
                  )}
                </div>

                {/* 2. Video File (Không bắt buộc - Có đường viền dashed xanh lá khi được chọn) */}
                <input type="file" ref={videoInputRef} style={{ display: 'none' }} accept="video/mp4, video/webm, video/mkv" onChange={handleVideoSelect} />
                <div className={`file-upload-card video-card ${videoFile ? 'active-video' : ''}`} onClick={() => videoInputRef.current?.click()}>
                  {videoFile ? (
                    <div className="file-upload-success video-success">
                      <span className="file-status-icon">✓</span>
                      <div className="file-name-text">Video: {videoFile.name}</div>
                    </div>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </svg>
                      <div className="file-upload-text">Video File (MP4)</div>
                      <div className="file-upload-hint">Hỗ trợ các file .mp4 từ máy</div>
                    </>
                  )}
                </div>

                {/* 3. Audio File (Bắt buộc) */}
                <input type="file" ref={mediaInputRef} style={{ display: 'none' }} accept="audio/*" onChange={handleMediaSelect} />
                <div className={`file-upload-card ${mediaFile ? 'active' : ''}`} onClick={() => mediaInputRef.current?.click()}>
                  {mediaFile ? (
                    <div className="file-upload-success">
                      <span className="file-status-icon">✓</span>
                      <div className="file-name-text">Nhạc: {mediaFile.name}</div>
                    </div>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                      <div className="file-upload-text">Audio File <span className="required-star">*</span></div>
                      <div className="file-upload-hint">MP3, WAV, M4A</div>
                    </>
                  )}
                </div>
              </div>

              {/* --- KHU VỰC ĐIỀN THÔNG TIN VĂN BẢN VÀ LỜI BÀI HÁT --- */}
              <div className="upload-metadata-section">
                <div className="form-group">
                  <label>Title <span className="required-star">*</span></label>
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
                    <label>Artist / Creator <span className="required-star">*</span></label>
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

                {/* Lyrics Area (Không bắt buộc) */}
                <div className="form-group" style={{ marginTop: '20px' }}>
                  <div className="lyrics-label-container">
                    <label style={{ margin: 0 }}>Lyrics (Lời bài hát)</label>
                    <input type="file" ref={lyricsFileInputRef} style={{ display: 'none' }} accept=".txt, .lrc" onChange={handleLyricsFileSelect} />
                    <button type="button" className="lyrics-file-btn" onClick={() => lyricsFileInputRef.current?.click()}>
                      {lyricsFile ? `File: ${lyricsFile.name}` : 'Chọn file .txt / .lrc'}
                    </button>
                  </div>
                  <textarea
                    placeholder="Nhập lời bài hát vào đây hoặc tải lên file văn bản từ máy tính nếu có..."
                    value={lyricsText}
                    onChange={(e) => setLyricsText(e.target.value)}
                    rows={6}
                  />
                </div>
              </div>

              {/* Thanh tiến trình Upload */}
              {isUploading && (
                <div className="progress-container">
                  <div className="progress-labels">
                    <span>Processing & uploading media...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {/* Nút Submit nằm gọn gàng ở đáy */}
              <div className="submit-container">
                <button type="submit" className="upload-submit-btn" disabled={isUploading}>
                  {isUploading ? 'Processing Media...' : 'Publish Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {isLoggedIn && <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />}
      <PlayerBar />
    </div>
  );
} 