import { create } from 'zustand';
import { Product, CartItem, ProductDesignVariant } from '../types';

interface CartStore {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string, selectedDesign?: ProductDesignVariant) => void;
  removeFromCart: (productId: string, selectedSize?: string, selectedColor?: string, selectedDesignId?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string, selectedColor?: string, selectedDesignId?: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addToCart: (product, quantity = 1, selectedSize, selectedColor, selectedDesign) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (i) =>
          i.product.id === product.id &&
          i.selectedSize === selectedSize &&
          i.selectedColor === selectedColor &&
          i.selectedDesign?.id === selectedDesign?.id
      );

      if (existingIndex > -1) {
        const updated = [...state.items];
        updated[existingIndex].quantity += quantity;
        return { items: updated };
      } else {
        return {
          items: [...state.items, { product, quantity, selectedSize, selectedColor, selectedDesign }],
        };
      }
    });
  },

  removeFromCart: (productId, selectedSize, selectedColor, selectedDesignId) => {
    set((state) => ({
      items: state.items.filter(
        (i) =>
          !(
            i.product.id === productId &&
            i.selectedSize === selectedSize &&
            i.selectedColor === selectedColor &&
            i.selectedDesign?.id === selectedDesignId
          )
      ),
    }));
  },

  updateQuantity: (productId, quantity, selectedSize, selectedColor, selectedDesignId) => {
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter(
            (i) =>
              !(
                i.product.id === productId &&
                i.selectedSize === selectedSize &&
                i.selectedColor === selectedColor &&
                i.selectedDesign?.id === selectedDesignId
              )
          ),
        };
      }

      return {
        items: state.items.map((i) => {
          if (
            i.product.id === productId &&
            i.selectedSize === selectedSize &&
            i.selectedColor === selectedColor &&
            i.selectedDesign?.id === selectedDesignId
          ) {
            return { ...i, quantity };
          }
          return i;
        }),
      };
    });
  },

  clearCart: () => set({ items: [] }),

  getSubtotal: () => {
    return get().items.reduce((total, i) => {
      const itemPrice = i.selectedDesign ? i.selectedDesign.price : i.product.price;
      return total + itemPrice * i.quantity;
    }, 0);
  },

  getItemCount: () => {
    return get().items.reduce((count, i) => count + i.quantity, 0);
  },
}));
