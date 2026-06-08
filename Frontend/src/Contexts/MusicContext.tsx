import { createContext, useContext, useRef, useState, useEffect } from 'react';

interface Song {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl?: string;
  category?: string;
}

export type RepeatMode = 'none' | 'all' | 'one';

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  volume: number;
  setVolume: (v: number) => void;
  // Queue & controls
  queue: Song[];
  setQueue: (songs: Song[], startIndex?: number) => void;
  isShuffle: boolean;
  toggleShuffle: () => void;
  repeatMode: RepeatMode;
  cycleRepeat: () => void;
  playNext: () => void;
  playPrev: () => void;
  isQueueViewOpen: boolean;
  toggleQueueView: () => void;
  isLyricsViewOpen: boolean;
  toggleLyricsView: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(() => {
    try {
      const saved = localStorage.getItem('lastPlayedSong');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error('Failed to parse last played song', e); }
    return null;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [queue, setQueueState] = useState<Song[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [isQueueViewOpen, setIsQueueViewOpen] = useState(false);
  const [isLyricsViewOpen, setIsLyricsViewOpen] = useState(false);

  const toggleQueueView = () => {
    setIsQueueViewOpen(prev => !prev);
    // Auto close lyrics if opening queue
    if (!isQueueViewOpen) setIsLyricsViewOpen(false);
  };

  const toggleLyricsView = () => {
    setIsLyricsViewOpen(prev => !prev);
  };

  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    if (currentSong && !audioRef.current.src && currentSong.audioUrl) {
      audioRef.current.src = currentSong.audioUrl;
    }
  }, [currentSong]);

  // Refs để tránh stale closure trong audio callbacks
  const queueRef = useRef<Song[]>([]);
  const originalQueueRef = useRef<Song[]>([]);
  const currentIndexRef = useRef(-1);
  const repeatModeRef = useRef<RepeatMode>('none');

  // ── Hàm nội bộ: phát bài theo index trong queue ──
  const internalPlay = (song: Song, index: number) => {
    currentIndexRef.current = index;
    const audio = audioRef.current;
    audio.src = song.audioUrl || '';
    audio.play();
    setCurrentSong(song);
    try {
      localStorage.setItem('lastPlayedSong', JSON.stringify(song));
    } catch (e) {}
    setIsPlaying(true);

    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.onended = () => {
      const repeat = repeatModeRef.current;
      const q = queueRef.current;
      const idx = currentIndexRef.current;

      if (repeat === 'one') {
        // Lặp lại bài hiện tại
        audio.currentTime = 0;
        audio.play();
      } else {
        const nextIdx = idx + 1;
        if (nextIdx < q.length) {
          internalPlay(q[nextIdx], nextIdx);
        } else if (repeat === 'all' && q.length > 0) {
          internalPlay(q[0], 0);
        } else {
          setIsPlaying(false);
        }
      }
    };
  };

  // ── playSong: gọi từ UI khi click vào bài ──
  const playSong = async (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
      return;
    }
    const idx = queueRef.current.findIndex(s => s.id === song.id);
    if (idx !== -1) {
      internalPlay(song, idx);
    } else {
      // Auto-generate a queue starting with this song if it's played outside a playlist
      setQueueState([song]);
      queueRef.current = [song];
      originalQueueRef.current = [song];
      internalPlay(song, 0);

      try {
        const res = await fetch('/api/songs').then(r => r.json());
        const allSongs = res as Song[];
        const otherSongs = allSongs.filter(s => s.id !== song.id);
        const shuffled = otherSongs.sort(() => 0.5 - Math.random()).slice(0, 15);
        const newQueue = [song, ...shuffled];
        setQueueState(newQueue);
        queueRef.current = newQueue;
        originalQueueRef.current = newQueue;
      } catch (e) {
        console.error("Lỗi fetch random queue:", e);
      }
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const seek = (time: number) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const setVolume = (v: number) => {
    audioRef.current.volume = v;
    setVolumeState(v);
  };

  // ── Đặt danh sách bài hát (queue) ──
  const setQueue = (songs: Song[], startIndex = 0) => {
    originalQueueRef.current = songs;
    queueRef.current = songs;
    currentIndexRef.current = startIndex;
    setQueueState(songs);
  };

  // ── Trộn / bỏ trộn bài ──
  const toggleShuffle = () => {
    setIsShuffle(prev => {
      if (!prev) {
        // BẬT shuffle: trộn ngẫu nhiên, giữ bài đang phát ở vị trí hiện tại
        const shuffled = [...originalQueueRef.current].sort(() => Math.random() - 0.5);
        const curId = queueRef.current[currentIndexRef.current]?.id;
        if (curId !== undefined) {
          const shuffledIdx = shuffled.findIndex(s => s.id === curId);
          const targetIdx = Math.max(0, currentIndexRef.current);
          if (shuffledIdx !== -1 && shuffledIdx !== targetIdx) {
            [shuffled[targetIdx], shuffled[shuffledIdx]] = [shuffled[shuffledIdx], shuffled[targetIdx]];
          }
          currentIndexRef.current = targetIdx;
        }
        queueRef.current = shuffled;
        setQueueState([...shuffled]);
      } else {
        // TẮT shuffle: khôi phục thứ tự gốc, cập nhật lại index
        const curId = queueRef.current[currentIndexRef.current]?.id;
        const restoredIdx = originalQueueRef.current.findIndex(s => s.id === curId);
        currentIndexRef.current = restoredIdx !== -1 ? restoredIdx : 0;
        queueRef.current = originalQueueRef.current;
        setQueueState([...originalQueueRef.current]);
      }
      return !prev;
    });
  };

  // ── Vòng lặp 3 trạng thái: none → all → one → none ──
  const cycleRepeat = () => {
    setRepeatMode(prev => {
      const next: RepeatMode =
        prev === 'none' ? 'all' :
          prev === 'all' ? 'one' : 'none';
      repeatModeRef.current = next;
      return next;
    });
  };

  // ── Bài tiếp theo ──
  const playNext = () => {
    const q = queueRef.current;
    if (q.length === 0) return;
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < q.length) {
      internalPlay(q[nextIdx], nextIdx);
    } else if (repeatModeRef.current === 'all') {
      internalPlay(q[0], 0);
    }
  };

  // ── Bài trước ──
  const playPrev = () => {
    // Nếu đã qua 3 giây → tua về đầu bài hiện tại
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const q = queueRef.current;
    if (q.length === 0) return;
    const prevIdx = currentIndexRef.current - 1;
    if (prevIdx >= 0) {
      internalPlay(q[prevIdx], prevIdx);
    } else if (repeatModeRef.current === 'all') {
      internalPlay(q[q.length - 1], q.length - 1);
    }
  };

  return (
    <MusicContext.Provider value={{
      currentSong, isPlaying, playSong, togglePlay,
      currentTime, duration, seek, volume, setVolume,
      queue, setQueue,
      isShuffle, toggleShuffle,
      repeatMode, cycleRepeat,
      playNext, playPrev,
      isQueueViewOpen, toggleQueueView,
      isLyricsViewOpen, toggleLyricsView
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export const useMusic = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic phải dùng trong MusicProvider');
  return ctx;
};