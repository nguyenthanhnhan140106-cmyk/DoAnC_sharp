import React, { useState } from 'react';
import Header from '../Components/header';
import Sidebar from '../Components/Sidebar';
import PlayerBar from '../Components/PlayerBar';
import RightSidebar from '../Components/RightSidebar';
import Footer from '../Components/Footer';
import { useAuth } from '../Contexts/AuthContext';
import '../Components/Styles/HomePage.css';
import '../Components/Styles/NotificationsPage.css';

export default function NotificationsPage() {
  const { isLoggedIn } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Music');

  return (
    <div className={`spotify-layout ${isSidebarCollapsed ? 'sidebar-hidden' : ''} ${!isLoggedIn || isRightCollapsed ? 'right-hidden' : ''}`}>
      <Header />
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <div className="main-view">
        <div className="content-wrapper notifications-wrapper">
          <div className="notifications-header">
            <h1>What's New</h1>
            <p>The latest releases from artists, podcasts, and shows you follow.</p>
            
            <div className="notifications-filters">
              <button 
                className={`filter-chip ${activeFilter === 'Music' ? 'active' : ''}`}
                onClick={() => setActiveFilter('Music')}
              >
                Music
              </button>
              <button 
                className={`filter-chip ${activeFilter === 'Podcast & Shows' ? 'active' : ''}`}
                onClick={() => setActiveFilter('Podcast & Shows')}
              >
                Podcast & Shows
              </button>
            </div>
          </div>

          <div className="notifications-empty-state">
            <h2>We don't have any updates for you yet</h2>
            <p>When there's news, we'll post it here. Follow your favorite artists and podcasts to stay updated on them too.</p>
          </div>
          
          <div style={{ marginTop: 'auto' }}>
            <Footer />
          </div>
        </div>
      </div>

      {isLoggedIn && <RightSidebar isCollapsed={isRightCollapsed} setIsCollapsed={setIsRightCollapsed} />}
      <PlayerBar />
    </div>
  );
}
