import { create } from 'zustand';

export type PosTabId = 'overview' | 'sales' | 'charts' | 'operations' | 'margin' | 'comparison';

type PosTabState = {
  tab: PosTabId;
  setTab: (tab: PosTabId) => void;
};

export const usePosTab = create<PosTabState>((set) => ({
  tab: 'overview',
  setTab: (tab) => set({ tab })
}));
