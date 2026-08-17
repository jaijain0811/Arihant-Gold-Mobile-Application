import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccessStore {
  accessCode: string | null;
  isValidated: boolean;
  isLoading: boolean;
  error: string | null;
  checkAccessStatus: () => Promise<boolean>;
  setValidatedAccess: (code: string) => Promise<void>;
  revokeAccess: () => Promise<void>;
}

export const useAccessStore = create<AccessStore>((set) => ({
  accessCode: null,
  isValidated: false,
  isLoading: true,
  error: null,

  checkAccessStatus: async () => {
    try {
      set({ isLoading: true, error: null });
      const savedCode = await AsyncStorage.getItem('user_access_code');
      const isValid = await AsyncStorage.getItem('user_access_validated');

      if (savedCode && isValid === 'true') {
        set({ accessCode: savedCode, isValidated: true, isLoading: false });
        return true;
      } else {
        set({ accessCode: null, isValidated: false, isLoading: false });
        return false;
      }
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      return false;
    }
  },

  setValidatedAccess: async (code: string) => {
    await AsyncStorage.setItem('user_access_code', code);
    await AsyncStorage.setItem('user_access_validated', 'true');
    set({ accessCode: code, isValidated: true, error: null });
  },

  revokeAccess: async () => {
    await AsyncStorage.removeItem('user_access_code');
    await AsyncStorage.removeItem('user_access_validated');
    set({ accessCode: null, isValidated: false, error: null });
  }
}));
