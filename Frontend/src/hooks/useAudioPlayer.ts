import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { songService } from '../Services/songService';

export interface Song {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl?: string;
  category?: string;
  lyrics?: string;
}

export type RepeatMode = 'none' | 'all' | 'one';

export function useAudioPlayer() {
  const { isLoggedIn, openAuthModal } = useAuth();
  const historyTimeoutRef = useRef<any>(null);
  
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
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem('recentlyPlayed');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error('Failed to parse recently played', e); }
    return [];
  });

  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const queueRef = useRef<Song[]>([]);
  const originalQueueRef = useRef<Song[]>([]);
  const currentIndexRef = useRef(-1);
  const repeatModeRef = useRef<RepeatMode>('none');

  useEffect(() => {
    if (currentSong && !audioRef.current.src && currentSong.audioUrl) {
      audioRef.current.src = currentSong.audioUrl;
    }
  }, [currentSong]);

  useEffect(() => {
    if (!isLoggedIn) {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
      }
      setIsPlaying(false);
      setCurrentSong(null);
      setQueueState([]);
      currentIndexRef.current = -1;
      localStorage.removeItem('lastPlayedSong');
    }
  }, [isLoggedIn]);

  const internalPlay = useCallback((song: Song, index: number) => {
    currentIndexRef.current = index;
    const audio = audioRef.current;
    audio.src = song.audioUrl || '';
    
    setCurrentSong(song);
    localStorage.setItem('lastPlayedSong', JSON.stringify(song));
    
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      const updated = [song, ...filtered].slice(0, 10);
      localStorage.setItem('recentlyPlayed', JSON.stringify(updated));
      return updated;
    });

    // Xóa timeout lưu lịch sử cũ nếu người dùng bấm qua bài quá nhanh (chống spam)
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    // Chỉ lưu lịch sử khi nghe bài hát được 10 giây
    historyTimeoutRef.current = setTimeout(() => {
      songService.savePlayHistory(song.id).catch(err => {
        // Có thể sẽ lỗi 401 nếu chưa đăng nhập, cứ bỏ qua
        console.warn("Lưu lịch sử nghe thất bại (có thể do chưa đăng nhập):", err);
      });
    }, 10000);

    audio.play();
    setIsPlaying(true);

    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onloadedmetadata = () => setDuration(audio.duration);
    
    audio.onended = () => {
      const repeat = repeatModeRef.current;
      const q = queueRef.current;
      const idx = currentIndexRef.current;

      if (repeat === 'one') {
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
  }, []);

  const playSong = async (song: Song) => {
    if (!isLoggedIn) {
      openAuthModal({ title: song.title, coverUrl: song.coverUrl || '' });
      return;
    }
    
    if (currentSong?.id === song.id) {
      togglePlay();
      return;
    }
    const idx = queueRef.current.findIndex(s => s.id === song.id);
    if (idx !== -1) {
      internalPlay(song, idx);
    } else {
      setQueueState([song]);
      queueRef.current = [song];
      originalQueueRef.current = [song];
      internalPlay(song, 0);

      try {
        const res = await songService.getAllSongs();
        const allSongs = res as Song[];
        const otherSongs = allSongs.filter((s: Song) => s.id !== song.id);
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
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(e => console.log("Play failed:", e));
      setIsPlaying(true);
    }
  };

  const pauseSong = useCallback(() => {
    const audio = audioRef.current;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const seek = (time: number) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const setVolume = (v: number) => {
    audioRef.current.volume = v;
    setVolumeState(v);
  };

  const setQueue = (songs: Song[], startIndex = 0) => {
    originalQueueRef.current = songs;
    queueRef.current = songs;
    currentIndexRef.current = startIndex;
    setQueueState(songs);
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => {
      if (!prev) {
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
        const curId = queueRef.current[currentIndexRef.current]?.id;
        const restoredIdx = originalQueueRef.current.findIndex(s => s.id === curId);
        currentIndexRef.current = restoredIdx !== -1 ? restoredIdx : 0;
        queueRef.current = originalQueueRef.current;
        setQueueState([...originalQueueRef.current]);
      }
      return !prev;
    });
  };

  const cycleRepeat = () => {
    setRepeatMode(prev => {
      const next: RepeatMode = prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none';
      repeatModeRef.current = next;
      return next;
    });
  };

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

  const playPrev = () => {
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

  return {
    currentSong, isPlaying, playSong, togglePlay, pauseSong,
    currentTime, duration, seek, volume, setVolume,
    queue, setQueue,
    isShuffle, toggleShuffle,
    repeatMode, cycleRepeat,
    playNext, playPrev,
    recentlyPlayed
  };
}
