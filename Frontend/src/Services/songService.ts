import API from './api';

export const songService = {
  getAllSongs: async () => {
    const response = await API.get('/songs');
    return response.data?.data || response.data;
  },

  getSongsByCategory: async (category: string) => {
    const response = await API.get(`/songs/category/${category}`);
    return response.data?.data || response.data;
  },

  getSongById: async (id: number) => {
    const response = await API.get(`/songs/${id}`);
    return response.data?.data || response.data;
  },

  searchSongs: async (query: string) => {
    const response = await API.get(`/songs/search?q=${encodeURIComponent(query)}`);
    return response.data?.data || response.data;
  },

  savePlayHistory: async (songId: number) => {
    const response = await API.post(`/history/played/${songId}`);
    return response.data;
  }
};
