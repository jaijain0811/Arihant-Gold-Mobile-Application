import api from './api';

export const bannerService = {
  getBanners: async () => {
    const response = await api.get('/banners');
    return response.data;
  },

  getAllAdminBanners: async () => {
    const response = await api.get('/banners/admin');
    return response.data;
  },

  createBanner: async (data: any) => {
    const response = await api.post('/banners', data);
    return response.data;
  },

  updateBanner: async (id: string, data: any) => {
    const response = await api.put(`/banners/${id}`, data);
    return response.data;
  },

  deleteBanner: async (id: string) => {
    const response = await api.delete(`/banners/${id}`);
    return response.data;
  }
};
