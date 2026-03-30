import { create } from 'zustand';
import { WeatherDay, QPEvent } from '@/types';
import { forecast as weatherForecast, qpEvents, currentWeather } from '@/data/weather';
import { WeatherSnapshot } from '@/types/weather';

interface WeatherStore {
  forecast: WeatherDay[];
  qpEvents: QPEvent[];
  current: WeatherSnapshot;
  selectedDay: string | null;
  setSelectedDay: (date: string | null) => void;
}

export const useWeatherStore = create<WeatherStore>((set) => ({
  forecast: weatherForecast,
  qpEvents: qpEvents,
  current: currentWeather,
  selectedDay: null,
  setSelectedDay: (date) => set({ selectedDay: date }),
}));
