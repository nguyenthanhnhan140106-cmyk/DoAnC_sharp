import API from './api';

export interface SavedAlbum {
  id: number;
  title: string;
  coverUrl?: string;
  artistName: string;
}

export const libraryService = {
  getSavedAlbums: async (): Promise<SavedAlbum[]> => {
    const res = await API.get('/library/albums');
    return res.data;
  },
  getAlbumStatus: async (albumId: number): Promise<boolean> => {
    const res = await API.get(`/library/albums/${albumId}/status`);
    return res.data.isSaved;
  },
  saveAlbum: async (albumId: number): Promise<void> => {
    await API.post(`/library/albums/${albumId}`);
  },
  removeAlbum: async (albumId: number): Promise<void> => {
    await API.delete(`/library/albums/${albumId}`);
  },
};
