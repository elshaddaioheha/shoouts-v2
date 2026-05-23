import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { LibraryItem } from './library.types';

type LibraryState = {
  items: LibraryItem[];
  addItem: (item: LibraryItem) => void;
  removeItem: (id: string) => void;
  isInLibrary: (id: string) => boolean;
};

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          if (state.items.some((existing) => existing.id === item.id)) return state;
          return { items: [...state.items, item] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      isInLibrary: (id) => get().items.some((item) => item.id === id),
    }),
    {
      name: 'shoout-library',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
