import { create } from 'zustand';
import type { CartItem } from './cart.types';

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  total: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
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
}));
