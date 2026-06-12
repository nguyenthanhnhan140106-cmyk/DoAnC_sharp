import API from './api';

export interface SavedAlbum {
  id: number;
  title: string;
  coverUrl?: string;
  artistName: string;
}

export const libraryService = {
  // Lấy danh sách album đã lưu
  getSavedAlbums: async (): Promise<SavedAlbum[]> => {
    const res = await API.get('/library/albums');
    return res.data;
  },

  // Kiểm tra album đã lưu chưa
  getAlbumStatus: async (albumId: number): Promise<boolean> => {
    const res = await API.get(`/library/albums/${albumId}/status`);
    return res.data.isSaved;
  },

  // Lưu album vào thư viện
  saveAlbum: async (albumId: number): Promise<void> => {
    await API.post(`/library/albums/${albumId}`);
  },

  // Xóa album khỏi thư viện
  removeAlbum: async (albumId: number): Promise<void> => {
    await API.delete(`/library/albums/${albumId}`);
  },
};
