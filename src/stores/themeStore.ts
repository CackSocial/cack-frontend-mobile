import {create} from 'zustand';
import * as storage from '../utils/storage';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme(): void;
  hydrate(): Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',

  toggleTheme() {
    const next = get().theme === 'light' ? 'dark' : 'light';
    set({theme: next});
    storage.setTheme(next);
  },

  async hydrate() {
    const saved = await storage.getTheme();
    if (saved) {
      set({theme: saved});
    }
  },
}));
