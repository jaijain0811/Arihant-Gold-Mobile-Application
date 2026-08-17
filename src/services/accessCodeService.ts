import api from './api';

export const accessCodeService = {
  validateCode: async (accessCode: string) => {
    try {
      const response = await api.post('/access-codes/validate', { accessCode });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  getAllCodes: async () => {
    const response = await api.get('/access-codes');
    return response.data;
  },

  createCode: async (data: { code: string; label?: string; maxUsages?: number; expiresAt?: string | null }) => {
    const response = await api.post('/access-codes', data);
    return response.data;
  },

  updateCode: async (id: string, data: any) => {
    const response = await api.put(`/access-codes/${id}`, data);
    return response.data;
  },

  deleteCode: async (id: string) => {
    const response = await api.delete(`/access-codes/${id}`);
    return response.data;
  }
};
