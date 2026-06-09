import React, { createContext, useContext, useState } from 'react';
import { useAudioPlayer, type Song, type RepeatMode } from '../hooks/useAudioPlayer';

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
  recentlyPlayed: Song[];
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioState = useAudioPlayer();
  const [isQueueViewOpen, setIsQueueViewOpen] = useState(false);
  const [isLyricsViewOpen, setIsLyricsViewOpen] = useState(false);

  const toggleQueueView = () => {
    setIsQueueViewOpen(prev => !prev);
    if (!isQueueViewOpen) setIsLyricsViewOpen(false);
  };

  const toggleLyricsView = () => {
    setIsLyricsViewOpen(prev => !prev);
  };

  return (
    <MusicContext.Provider value={{
      ...audioState,
      isQueueViewOpen, toggleQueueView,
      isLyricsViewOpen, toggleLyricsView,
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