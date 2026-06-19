import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { DatePresetId } from './dateRange';
import { usePosTab, type PosTabId } from './posTabStore';

const PRESET_KEY = 'piqboss.pref.preset';
const TAB_KEY = 'piqboss.pref.tab';

type PrefState = {
  hydrated: boolean;
  defaultPreset: DatePresetId;
  defaultTab: PosTabId;
  hydrate: () => Promise<void>;
  setDefaultPreset: (preset: DatePresetId) => void;
  setDefaultTab: (tab: PosTabId) => void;
};

export const usePrefs = create<PrefState>((set) => ({
  hydrated: false,
  defaultPreset: 'today',
  defaultTab: 'overview',
  hydrate: async () =>
  {
    try
    {
      const [preset, tab] = await Promise.all([
        SecureStore.getItemAsync(PRESET_KEY),
        SecureStore.getItemAsync(TAB_KEY)
      ]);
      const defaultPreset = (preset as DatePresetId) || 'today';
      const defaultTab = (tab as PosTabId) || 'overview';
      set({ defaultPreset, defaultTab, hydrated: true });
      usePosTab.getState().setTab(defaultTab);
    }
    catch
    {
      set({ hydrated: true });
    }
  },
  setDefaultPreset: (preset) =>
  {
    set({ defaultPreset: preset });
    void SecureStore.setItemAsync(PRESET_KEY, preset);
  },
  setDefaultTab: (tab) =>
  {
    set({ defaultTab: tab });
    void SecureStore.setItemAsync(TAB_KEY, tab);
  }
}));
