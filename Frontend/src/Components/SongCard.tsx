import { useMusic } from '../Contexts/MusicContext';
import './Styles/HomePage.css';

interface Song {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl?: string;
  category?: string;
}

// ← getCover phải đứng TRƯỚC SongCard
const getCover = (song: Song) =>
  song.coverUrl || `https://picsum.photos/seed/${song.id}/160/160`;

const SongCard = ({ song }: { song: Song }) => {
  const { playSong, currentSong, isPlaying } = useMusic();
  const isActive = currentSong?.id === song.id;

  return (
    <div className="song-card-item" onClick={() => playSong(song)}>
      <div className="song-card-img-wrapper">
        <img
          src={getCover(song)}
          alt={song.title}
          className="song-card-img"
          onError={(e) => {
            e.currentTarget.src = `https://picsum.photos/seed/${song.id}/160/160`;
          }}
        />
        <button
          className={`card-play-btn ${isActive && isPlaying ? 'playing' : ''}`}
          aria-label={`Phát ${song.title}`}
          onClick={(e) => { e.stopPropagation(); playSong(song); }}
        />
      </div>
      <h4 className="song-card-title" style={{ color: isActive ? '#1db954' : '#fff' }}>
        {song.title}
      </h4>
      <p className="song-card-artist">{song.artist}</p>
    </div>
  );
};