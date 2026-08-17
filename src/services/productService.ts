import api from './api';

export const productService = {
  getProducts: async (params?: { category?: string; collection?: string; search?: string; minPrice?: number; maxPrice?: number; sort?: string; page?: number; limit?: number }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProductById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  createProduct: async (data: any) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  updateProduct: async (id: string, data: any) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  rateProduct: async (id: string, rating: number, comment?: string, userName?: string) => {
    const response = await api.post(`/products/${id}/reviews`, { rating, comment, userName });
    return response.data;
  },

  getProductReviews: async (id: string) => {
    const response = await api.get(`/products/${id}/reviews`);
    return response.data;
  }
};
