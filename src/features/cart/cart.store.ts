import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartItem } from './cart.types';

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  total: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const exists = state.items.some((existing) => existing.id === item.id);
          if (exists) return state;

          return {
            items: [...state.items, item],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearCart: () => set({ items: [] }),

      isInCart: (id) => get().items.some((item) => item.id === id),

      total: () => get().items.reduce((sum, item) => sum + item.price, 0),
    }),
    {
      name: 'shoout-cart',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the items array; derived methods (isInCart, total) are re-created
      partialize: (state) => ({ items: state.items }),
    }
  )
);
