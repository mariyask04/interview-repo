import { create } from 'zustand';
import { ClothingItem, AddItemRequest } from '../types';
import { wardrobeAPI } from '../services/api/wardrobe';
import { friendlyError } from '../utils/friendlyError';

type SortMode = 'newest' | 'oldest' | 'name';

const sortItems = (items: ClothingItem[], mode: SortMode) => {
  return [...items].sort((a, b) => {
    if (mode === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (mode === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
};

interface WardrobeState {
  items: ClothingItem[];
  categories: Record<string, number>;
  selectedCategory: string;

  sortMode: SortMode;

  isLoading: boolean;
  error: string | null;

  fetchItems: (category?: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  addItem: (req: AddItemRequest) => Promise<ClothingItem>;
  deleteItem: (id: string) => Promise<void>;
  setCategory: (category: string) => void;

  setSortMode: (mode: SortMode) => void;

  clearError: () => void;
}

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  items: [],
  categories: {},
  selectedCategory: '',
  sortMode: 'newest', // ✅ default
  isLoading: false,
  error: null,

  fetchItems: async (category) => {
    set({ isLoading: true, error: null });
    try {
      const items = await wardrobeAPI.listItems(category || get().selectedCategory || undefined);
      const sorted = sortItems(items, get().sortMode);
      set({ items: sorted, isLoading: false });
    } catch (e: unknown) {
      set({
        isLoading: false,
        error: friendlyError(e, "Couldn't load your wardrobe. Please try again."),
      });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await wardrobeAPI.getCategories();
      set({ categories });
    } catch (e: unknown) {
      set({
        error: friendlyError(e, "Couldn't load categories. Please try again."),
      });
    }
  },

  //without proper error handling the user wouldn't understand the reason rejection of their action, which is not a good hallmark of a user friendly interface
  addItem: async (req) => {
    set({ error: null });
    try {
      const item = await wardrobeAPI.addItem(req);

      const sorted = sortItems([item, ...get().items], get().sortMode);

      set({ items: sorted });
      return item;
    } catch (e: unknown) {
      set({
        error: friendlyError(e, "Couldn't add item. Please try again.")
      });
    }
  },

  deleteItem: async (id) => {
    set({ error: null });
    try {
      await wardrobeAPI.deleteItem(id);

      const filtered = get().items.filter((i) => i.id !== id);
      const sorted = sortItems(filtered, get().sortMode);

      set({ items: sorted });
    } catch (e: unknown) {
      set({
        error: friendlyError(e, "Couldn't delete item. Please try again.")
      });
    }
  },

  setCategory: (category) => {
    set({ selectedCategory: category });
    get().fetchItems(category);
  },

  setSortMode: (mode) => {
    const sorted = sortItems(get().items, mode);
    set({ sortMode: mode, items: sorted });
  },

  clearError: () => set({ error: null }),
}));