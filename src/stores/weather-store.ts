import { create } from 'zustand';
import { WeatherDay, QPEvent } from '@/types';
import { WeatherSnapshot } from '@/types/weather';

interface WeatherStore {
  forecast: WeatherDay[];
  qpEvents: QPEvent[];
  current: WeatherSnapshot | null;
  selectedDay: string | null;
  loading: boolean;
  error: string | null;
  setSelectedDay: (date: string | null) => void;
  fetchWeather: () => Promise<void>;
}

export const useWeatherStore = create<WeatherStore>((set, get) => ({
  forecast: [],
  qpEvents: [],
  current: null,
  selectedDay: null,
  loading: false,
  error: null,
  setSelectedDay: (date) => set({ selectedDay: date }),
  fetchWeather: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const [currentRes, forecastRes, qpeRes] = await Promise.all([
        fetch('/api/weather/current'),
        fetch('/api/weather/forecast'),
        fetch('/api/weather/qpe-events'),
      ]);

      if (!currentRes.ok || !forecastRes.ok || !qpeRes.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const [current, forecast, qpEvents] = await Promise.all([
        currentRes.json(),
        forecastRes.json(),
        qpeRes.json(),
      ]);

      set({ current, forecast, qpEvents, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Unknown error', loading: false });
    }
  },
}));
