import { create } from 'zustand';
import { Checkpoint, BMPCategory, CheckpointStatus, Zone } from '@/types';
import { checkpoints } from '@/data/checkpoints';

interface CheckpointFilters {
  status: CheckpointStatus | 'all';
  bmpType: BMPCategory | 'all';
  zone: Zone | 'all';
  search: string;
}

interface CheckpointStore {
  checkpoints: Checkpoint[];
  selectedCheckpointId: string | null;
  filters: CheckpointFilters;
  setSelectedCheckpoint: (id: string | null) => void;
  setFilter: <K extends keyof CheckpointFilters>(key: K, value: CheckpointFilters[K]) => void;
  resetFilters: () => void;
  filteredCheckpoints: () => Checkpoint[];
}

const defaultFilters: CheckpointFilters = {
  status: 'all',
  bmpType: 'all',
  zone: 'all',
  search: '',
};

export const useCheckpointStore = create<CheckpointStore>((set, get) => ({
  checkpoints,
  selectedCheckpointId: null,
  filters: defaultFilters,
  setSelectedCheckpoint: (id) => set({ selectedCheckpointId: id }),
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: defaultFilters }),
  filteredCheckpoints: () => {
    const { checkpoints, filters } = get();
    return checkpoints.filter((cp) => {
      if (filters.status !== 'all' && cp.status !== filters.status) return false;
      if (filters.bmpType !== 'all' && cp.bmpType !== filters.bmpType) return false;
      if (filters.zone !== 'all' && cp.zone !== filters.zone) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        return (
          cp.name.toLowerCase().includes(search) ||
          cp.id.toLowerCase().includes(search) ||
          cp.description.toLowerCase().includes(search)
        );
      }
      return true;
    });
  },
}));
