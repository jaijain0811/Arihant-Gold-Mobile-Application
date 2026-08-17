import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user: User, token: string) => {
    await AsyncStorage.setItem('user_token', token);
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem('user_token');
    await AsyncStorage.removeItem('user_data');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('user_token');
      const userData = await AsyncStorage.getItem('user_data');
      if (token && userData) {
        set({ user: JSON.parse(userData), token, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (e) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
