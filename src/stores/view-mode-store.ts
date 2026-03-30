import { create } from 'zustand';

type ViewMode = 'website' | 'app';

interface ViewModeStore {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useViewModeStore = create<ViewModeStore>((set) => ({
  viewMode: 'website',
  setViewMode: (mode) => set({ viewMode: mode }),
}));
