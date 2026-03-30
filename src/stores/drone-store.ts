import { create } from 'zustand';
import { DroneMission } from '@/types';
import { droneMissions } from '@/data/drone-missions';

interface DroneStore {
  missions: DroneMission[];
  selectedMissionId: string | null;
  playbackState: 'idle' | 'playing' | 'paused';
  playbackSpeed: 1 | 2 | 4;
  currentWaypointIndex: number;
  playbackProgress: number; // 0-1
  setSelectedMission: (id: string | null) => void;
  setPlaybackState: (state: 'idle' | 'playing' | 'paused') => void;
  setPlaybackSpeed: (speed: 1 | 2 | 4) => void;
  setCurrentWaypointIndex: (index: number) => void;
  setPlaybackProgress: (progress: number) => void;
  resetPlayback: () => void;
  addMission: (mission: DroneMission) => void;
}

export const useDroneStore = create<DroneStore>((set) => ({
  missions: droneMissions,
  selectedMissionId: 'MISSION-001',
  playbackState: 'idle',
  playbackSpeed: 1,
  currentWaypointIndex: 0,
  playbackProgress: 0,
  setSelectedMission: (id) => set({ selectedMissionId: id }),
  setPlaybackState: (playbackState) => set({ playbackState }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setCurrentWaypointIndex: (currentWaypointIndex) => set({ currentWaypointIndex }),
  setPlaybackProgress: (playbackProgress) => set({ playbackProgress }),
  resetPlayback: () =>
    set({ playbackState: 'idle', currentWaypointIndex: 0, playbackProgress: 0 }),
  addMission: (mission) =>
    set((state) => ({
      missions: [mission, ...state.missions],
      selectedMissionId: mission.id,
    })),
}));
