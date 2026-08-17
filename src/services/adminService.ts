import api from './api';

export const adminService = {
  getAnalytics: async () => {
    const response = await api.get('/analytics/admin');
    return response.data;
  },

  getAllOrders: async (params?: any) => {
    const response = await api.get('/orders/admin/all', { params });
    return response.data;
  },

  updateOrderStatus: async (id: string, data: any) => {
    const response = await api.put(`/orders/admin/status/${id}`, data);
    return response.data;
  },

  updateSettings: async (data: any) => {
    const response = await api.put('/settings/admin', data);
    return response.data;
  },

  sendNotification: async (data: { title: string; message: string; type?: string }) => {
    const response = await api.post('/notifications/admin', data);
    return response.data;
  },

  getCoupons: async () => {
    const response = await api.get('/coupons/admin');
    return response.data;
  },

  createCoupon: async (data: any) => {
    const response = await api.post('/coupons/admin', data);
    return response.data;
  },

  deleteCoupon: async (id: string) => {
    const response = await api.delete(`/coupons/admin/${id}`);
    return response.data;
  }
};
