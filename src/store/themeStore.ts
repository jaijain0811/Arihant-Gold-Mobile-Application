import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeType } from '../theme';

interface ThemeStore {
  theme: ThemeType;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  loadStoredTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'light', // Default warm light theme for first open
  toggleTheme: async () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: nextTheme });
    try {
      await AsyncStorage.setItem('app_theme', nextTheme);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  },
  setTheme: async (theme: ThemeType) => {
    set({ theme });
    try {
      await AsyncStorage.setItem('app_theme', theme);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  },
  loadStoredTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        set({ theme: savedTheme });
      }
    } catch (e) {
      console.error('Failed to load theme preference', e);
    }
  },
}));
