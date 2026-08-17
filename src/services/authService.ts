import api from './api';

export const authService = {
  register: async (data: { name: string; email?: string; phone: string; password: string; accessCode?: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (identity: string, password: string) => {
    const response = await api.post('/auth/login', { identity, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/auth/delete-account');
    return response.data;
  }
};
