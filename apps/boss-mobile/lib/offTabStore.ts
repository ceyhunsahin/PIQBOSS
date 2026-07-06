import { create } from 'zustand';

export type OffTabId = 'overview' | 'orders' | 'shipments' | 'customers' | 'margin' | 'charts';

type OffTabState = {
  tab: OffTabId;
  setTab: (tab: OffTabId) => void;
};

export const useOffTab = create<OffTabState>((set) => ({
  tab: 'overview',
  setTab: (tab) => set({ tab })
}));
