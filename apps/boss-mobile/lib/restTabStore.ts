import { create } from 'zustand';

export type RestTabId = 'overview' | 'charts' | 'operations';

type RestTabState = {
  tab: RestTabId;
  setTab: (tab: RestTabId) => void;
};

export const useRestTab = create<RestTabState>((set) => ({
  tab: 'overview',
  setTab: (tab) => set({ tab })
}));
