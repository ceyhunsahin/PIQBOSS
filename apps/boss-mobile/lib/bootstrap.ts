import { create } from 'zustand';
import { initAppLanguage } from './i18n';
import { usePrefs } from './preferences';
import { loadServerUrl } from './serverConfig';
import { resolveActiveProfile, type SectorModule } from './serverProfiles';

type BootstrapState = {
  ready: boolean;
  serverUrl: string | null;
  sector: SectorModule;
  selectedDb: string;
  init: () => Promise<void>;
  setServerUrl: (url: string) => void;
  setSector: (sector: SectorModule) => void;
  setSelectedDb: (db: string) => void;
};

export const useBootstrap = create<BootstrapState>((set) => ({
  ready: false,
  serverUrl: null,
  sector: 'pos',
  selectedDb: '',
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
      const active = await resolveActiveProfile();
      set({ serverUrl: saved, sector: active?.module ?? 'pos', ready: true });
    }
    catch
    {
      set({ serverUrl: null, ready: true });
    }
  },
  setServerUrl: (url) => set({ serverUrl: url }),
  setSector: (sector) => set({ sector }),
  setSelectedDb: (db) => set({ selectedDb: db })
}));
