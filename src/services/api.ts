import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { ENV } from '../config/env';

export const API_BASE_URL = ENV.API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to attach Access Code header and User JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const accessCode = await AsyncStorage.getItem('user_access_code');
      if (accessCode) {
        config.headers['x-access-code'] = accessCode;
      }

      const token = await AsyncStorage.getItem('user_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const adminPasskey = await AsyncStorage.getItem('admin_passkey');
      if (adminPasskey) {
        config.headers['x-admin-passkey'] = adminPasskey;
      }
    } catch (e) {
      console.error('Error fetching headers from AsyncStorage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle access revocation (403 INVALID_ACCESS_CODE / ACCESS_DENIED)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 403) {
      const errCode = error.response.data?.error;
      if (errCode === 'INVALID_ACCESS_CODE' || errCode === 'ACCESS_DENIED' || errCode === 'ACCESS_CODE_EXPIRED') {
        // Access code revoked or invalid - clear access storage
        await AsyncStorage.removeItem('user_access_code');
        await AsyncStorage.removeItem('user_access_validated');
      }
    }
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('user_token');
      await AsyncStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

export default api;
