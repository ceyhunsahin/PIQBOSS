import * as SecureStore from 'expo-secure-store';
import { loadServerUrl, saveServerUrl } from './serverConfig';

const PROFILES_KEY = 'piqboss.serverProfiles';
const ACTIVE_PROFILE_KEY = 'piqboss.activeServerProfile';

export type ServerProfile = {
  id: string;
  url: string;
  label: string;
  db: string;
};

function newId(): string
{
  return `srv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Host/IP girisini tam URL'e cevirir: protokol yoksa http:// ekler, sondaki / temizler. */
export function normalizeServerUrl(input: string): string
{
  const v = input.trim().replace(/\/+$/, '');
  if(!v)
  {
    return '';
  }
  if(/^https?:\/\//i.test(v))
  {
    return v;
  }
  return `http://${v}`;
}

/** Gosterim icin host kismi (protokolsuz). */
export function serverHost(url: string): string
{
  return url.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

export async function loadServerProfiles(): Promise<ServerProfile[]>
{
  const raw = await SecureStore.getItemAsync(PROFILES_KEY);
  if(raw)
  {
    try
    {
      const parsed = JSON.parse(raw) as ServerProfile[];
      if(parsed.length > 0)
      {
        return parsed;
      }
    }
    catch
    {
      // fall through
    }
  }
  const legacyUrl = await loadServerUrl();
  if(legacyUrl)
  {
    return [{ id: newId(), url: legacyUrl, label: legacyUrl, db: '' }];
  }
  return [];
}

export async function saveServerProfiles(list: ServerProfile[]): Promise<void>
{
  await SecureStore.setItemAsync(PROFILES_KEY, JSON.stringify(list));
}

export async function loadActiveProfileId(): Promise<string | null>
{
  return SecureStore.getItemAsync(ACTIVE_PROFILE_KEY);
}

export async function setActiveProfile(profile: ServerProfile): Promise<void>
{
  await SecureStore.setItemAsync(ACTIVE_PROFILE_KEY, profile.id);
  await saveServerUrl(profile.url);
}

export async function resolveActiveProfile(): Promise<ServerProfile | null>
{
  const list = await loadServerProfiles();
  if(list.length === 0)
  {
    return null;
  }
  const activeId = await loadActiveProfileId();
  const found = activeId ? list.find((x) => x.id === activeId) : null;
  return found ?? list[0] ?? null;
}

export async function upsertServerProfile(input: Omit<ServerProfile, 'id'> & { id?: string }): Promise<ServerProfile[]>
{
  const list = await loadServerProfiles();
  const url = normalizeServerUrl(input.url);
  const profile: ServerProfile =
  {
    id: input.id ?? newId(),
    url,
    label: input.label.trim() || serverHost(url),
    db: input.db.trim()
  };
  const idx = list.findIndex((x) => x.id === profile.id);
  const next = idx >= 0 ? list.map((x, i) => (i === idx ? profile : x)) : [...list, profile];
  await saveServerProfiles(next);
  return next;
}

export async function removeServerProfile(id: string): Promise<ServerProfile[]>
{
  const next = (await loadServerProfiles()).filter((x) => x.id !== id);
  await saveServerProfiles(next);
  const activeId = await loadActiveProfileId();
  if(activeId === id)
  {
    await SecureStore.deleteItemAsync(ACTIVE_PROFILE_KEY);
    if(next[0])
    {
      await setActiveProfile(next[0]);
    }
  }
  return next;
}
