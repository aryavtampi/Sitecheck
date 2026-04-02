import { create } from 'zustand';
import { DroneMission } from '@/types';

interface DroneStore {
  missions: DroneMission[];
  selectedMissionId: string | null;
  playbackState: 'idle' | 'playing' | 'paused';
  playbackSpeed: 1 | 2 | 4;
  currentWaypointIndex: number;
  playbackProgress: number;
  loading: boolean;
  error: string | null;
  setSelectedMission: (id: string | null) => void;
  setPlaybackState: (state: 'idle' | 'playing' | 'paused') => void;
  setPlaybackSpeed: (speed: 1 | 2 | 4) => void;
  setCurrentWaypointIndex: (index: number) => void;
  setPlaybackProgress: (progress: number) => void;
  resetPlayback: () => void;
  addMission: (mission: DroneMission) => void;
  updateMission: (id: string, updates: Partial<DroneMission>) => void;
  fetchMissions: () => Promise<void>;
}

export const useDroneStore = create<DroneStore>((set, get) => ({
  missions: [],
  selectedMissionId: null,
  playbackState: 'idle',
  playbackSpeed: 1,
  currentWaypointIndex: 0,
  playbackProgress: 0,
  loading: false,
  error: null,
  setSelectedMission: (id) => set({ selectedMissionId: id }),
  setPlaybackState: (playbackState) => set({ playbackState }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setCurrentWaypointIndex: (currentWaypointIndex) => set({ currentWaypointIndex }),
  setPlaybackProgress: (playbackProgress) => set({ playbackProgress }),
  resetPlayback: () =>
    set({ playbackState: 'idle', currentWaypointIndex: 0, playbackProgress: 0 }),
  addMission: (mission) =>
    set((state) => ({
      missions: [mission, ...state.missions.filter((m) => m.id !== mission.id)],
      selectedMissionId: mission.id,
    })),
  updateMission: (id, updates) =>
    set((state) => ({
      missions: state.missions.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
  fetchMissions: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/missions');
      if (!res.ok) throw new Error('Failed to fetch missions');
      const data = await res.json();
      set({
        missions: data,
        selectedMissionId: data.length > 0 ? data[0].id : null,
        loading: false,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Unknown error', loading: false });
    }
  },
}));
