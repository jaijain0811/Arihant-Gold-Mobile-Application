import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAccessStore } from '../store/accessStore';
import { useThemeStore } from '../store/themeStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

export const useHydrateStores = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrateAll = async () => {
      try {
        await Promise.all([
          useAuthStore.getState().hydrate?.(),
          useAccessStore.getState().hydrate?.(),
          useThemeStore.getState().hydrate?.(),
          useCartStore.getState().hydrate?.(),
          useWishlistStore.getState().hydrate?.(),
        ]);
      } catch (e) {
        console.warn('Store hydration warning:', e);
      } finally {
        setHydrated(true);
      }
    };

    hydrateAll();
  }, []);

  return hydrated;
};
