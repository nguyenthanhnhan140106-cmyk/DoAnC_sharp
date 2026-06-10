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
  likedSongs: Song[];
  toggleLikeSong: (song: Song) => void;
  isSongLiked: (songId: number) => boolean;
  isAddToPlaylistModalOpen: boolean;
  openAddToPlaylistModal: (song: Song, e?: React.MouseEvent) => void;
  closeAddToPlaylistModal: () => void;
  selectedSongForModal: Song | null;
  modalPosition: {x: number, y: number} | null;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioState = useAudioPlayer();
  const [isQueueViewOpen, setIsQueueViewOpen] = useState(false);
  const [isLyricsViewOpen, setIsLyricsViewOpen] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
  const [selectedSongForModal, setSelectedSongForModal] = useState<Song | null>(null);

  const toggleLikeSong = (song: Song) => {
    setLikedSongs(prev => {
      if (prev.find(s => s.id === song.id)) {
        return prev.filter(s => s.id !== song.id);
      }
      return [song, ...prev];
    });
  };

  const isSongLiked = (songId: number) => likedSongs.some(s => s.id === songId);

  const [modalPosition, setModalPosition] = useState<{x: number, y: number} | null>(null);

  const openAddToPlaylistModal = (song: Song, e?: React.MouseEvent) => {
    setSelectedSongForModal(song);
    if (e) {
      setModalPosition({ x: e.clientX, y: e.clientY });
    } else {
      setModalPosition(null);
    }
    setIsAddToPlaylistModalOpen(true);
  };

  const closeAddToPlaylistModal = () => {
    setIsAddToPlaylistModalOpen(false);
    setSelectedSongForModal(null);
  };

  const toggleQueueView = () => {
    setIsQueueViewOpen(prev => {
      if (!prev) setIsLyricsViewOpen(false);
      return !prev;
    });
  };

  const toggleLyricsView = () => {
    setIsLyricsViewOpen(prev => !prev);
  };

  return (
    <MusicContext.Provider value={{
      ...audioState,
      isQueueViewOpen, toggleQueueView,
      isLyricsViewOpen, toggleLyricsView,
      isAddToPlaylistModalOpen, openAddToPlaylistModal, closeAddToPlaylistModal, selectedSongForModal, modalPosition,
      recentlyPlayed: audioState.recentlyPlayed,
      likedSongs,
      toggleLikeSong,
      isSongLiked,
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