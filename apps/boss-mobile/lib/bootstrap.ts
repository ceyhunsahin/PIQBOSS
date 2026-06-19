import { create } from 'zustand';
import { initAppLanguage } from './i18n';
import { usePrefs } from './preferences';
import { loadServerUrl } from './serverConfig';

type BootstrapState = {
  ready: boolean;
  serverUrl: string | null;
  init: () => Promise<void>;
  setServerUrl: (url: string) => void;
};

export const useBootstrap = create<BootstrapState>((set) => ({
  ready: false,
  serverUrl: null,
  init: async () =>
  {
    if(useBootstrap.getState().ready)
    {
      return;
    }
    try
    {
      await initAppLanguage();
      await usePrefs.getState().hydrate();
      const saved = await loadServerUrl();
      set({ serverUrl: saved, ready: true });
    }
    catch
    {
      set({ serverUrl: null, ready: true });
    }
  },
  setServerUrl: (url) => set({ serverUrl: url })
}));
