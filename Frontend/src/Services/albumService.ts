import API from './api';

export const albumService = {
  getAllAlbums: async () => {
    const response = await API.get('/albums');
    return response.data;
  },

  getAlbumById: async (id: number | string) => {
    const response = await API.get(`/albums/${id}`);
    return response.data;
  }
};
