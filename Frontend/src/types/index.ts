export interface User {
  id: number;
  username: string;
  email?: string;
  profileImageUrl?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  totalPlaylists: number;
  playlists: Playlist[];
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  artistId?: number;
  coverUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  category?: string;
  categoryId?: number;
  categoryName?: string;
  lyricsUrl?: string;
  lyrics?: string;
  createdAt?: string;
  worldRank?: number;
  followers?: number;
  monthlyListeners?: number;
  bio?: string;
  artistBanner?: string;
  isVerified?: boolean;
  addedAt?: string;
}

export interface Playlist {
  id: number;
  name: string;
  userId: number;
  description?: string;
  coverUrl?: string;
  creatorName: string;
  createdAt?: string;
  isPublic: boolean;
  songs: Song[];
}

export interface Artist {
  id: number;
  name: string;
  imageUrl?: string;
  bio?: string;
  monthlyListeners?: number;
  followers?: number;
  worldRank?: number;
  isVerified?: boolean;
  bannerUrl?: string;
}

export interface Album {
  id: number;
  title: string;
  artistId: number;
  artistName: string;
  releaseDate: string;
  coverUrl: string;
  songs?: Song[];
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface FollowedArtist {
  artistId: number;
  artistName: string;
  imageUrl?: string;
  followedAt: string;
}

export interface Category {
  id: number;
  name: string;
  imageUrl?: string;
}
