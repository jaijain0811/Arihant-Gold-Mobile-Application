import api from './api';

export const orderService = {
  createOrder: async (data: any) => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  getUserOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  getOrderById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  validateCoupon: async (code: string, amount: number) => {
    const response = await api.post('/coupons/validate', { code, amount });
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  }
};
