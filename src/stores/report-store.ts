import { create } from 'zustand';
import { ReportSection } from '@/types';

interface ReportStore {
  sections: ReportSection[];
  signed: boolean;
  signedBy: string | null;
  signedDate: string | null;
  setSections: (sections: ReportSection[]) => void;
  updateSection: (id: string, content: string) => void;
  sign: (name: string) => void;
  unsign: () => void;
}

export const useReportStore = create<ReportStore>((set) => ({
  sections: [],
  signed: false,
  signedBy: null,
  signedDate: null,
  setSections: (sections) => set({ sections }),
  updateSection: (id, content) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id ? { ...s, content, edited: true } : s
      ),
    })),
  sign: (name) =>
    set({ signed: true, signedBy: name, signedDate: new Date().toISOString() }),
  unsign: () => set({ signed: false, signedBy: null, signedDate: null }),
}));
