import { useEffect, useState } from 'react';
import API from '../Services/api';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/header';
import PlayerBar from '../Components/PlayerBar';
import RightSidebar from '../Components/RightSidebar'; 
import '../Components/Styles/HomePage.css';

export default function HomePage() {
  const [songs, setSongs] = useState<any[]>([]);

  useEffect(() => {
    API.get('/songs')
      .then((data: any) => setSongs(data))
      .catch((err) => console.error("Lỗi gọi API bài hát:", err));
  }, []);


  return (
  <div className="spotify-layout">
    <Header />  
    <Sidebar /> 
    <div className="main-view"> 
      <div className="content-wrapper">
      </div>
    </div>
    <RightSidebar />
    <PlayerBar />
  </div>
);
}