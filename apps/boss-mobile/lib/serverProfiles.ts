import * as SecureStore from 'expo-secure-store';
import { loadServerUrl, saveServerUrl } from './serverConfig';

const PROFILES_KEY = 'piqboss.serverProfiles';
const ACTIVE_PROFILE_KEY = 'piqboss.activeServerProfile';

export type SectorModule = 'pos' | 'off' | 'rest';

export type ServerProfile = {
  id: string;
  url: string;
  label: string;
  db: string;
  module: SectorModule;
};

function normalizeModule(value: unknown): SectorModule
{
  return value === 'off' || value === 'rest' ? value : 'pos';
}

function newId(): string
{
  return `srv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function isIpAddress(host: string): boolean
{
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}

/** Yerel/IP adresleri http, herkese açık alan adları https kullanır. */
function looksLocal(host: string): boolean
{
  const h = host.toLowerCase();
  return isIpAddress(h) || h === 'localhost' || /\.local$/.test(h) || !h.includes('.');
}

function splitHostPort(hostPort: string): [string, string]
{
  const idx = hostPort.lastIndexOf(':');
  if(idx > 0 && /^\d+$/.test(hostPort.slice(idx + 1)))
  {
    return [hostPort.slice(0, idx), hostPort.slice(idx + 1)];
  }
  return [hostPort, ''];
}

/**
 * Kullanici girisini tam URL'e cevirir. Kullanici sadece host yazabilir:
 *  - "192.168.1.10" → "http://192.168.1.10"
 *  - "192.168.1.10:80" → "http://192.168.1.10"  (varsayilan port temizlenir)
 *  - "firma.piqpos.net" → "https://firma.piqpos.net/pos"  (hosted piqpos.net /pos alt yolundan servis edilir)
 * Protokol elle yazildiysa korunur; basta/sonda http:// ve :80 zorunlu degildir.
 * Kullanici elle bir yol (orn. /pos) yazdiysa korunur.
 */
export function normalizeServerUrl(input: string): string
{
  let v = input.trim().replace(/\s+/g, '');
  if(!v)
  {
    return '';
  }
  let scheme: string | null = null;
  const schemeMatch = v.match(/^(https?):\/\//i);
  if(schemeMatch)
  {
    scheme = schemeMatch[1].toLowerCase();
    v = v.slice(schemeMatch[0].length);
  }
  v = v.replace(/\/+$/, '');
  const slash = v.indexOf('/');
  const hostPort = slash >= 0 ? v.slice(0, slash) : v;
  const rest = slash >= 0 ? v.slice(slash) : '';
  const [host, port] = splitHostPort(hostPort);
  if(!host)
  {
    return '';
  }
  if(!scheme)
  {
    scheme = looksLocal(host) ? 'http' : 'https';
  }
  let portPart = port ? `:${port}` : '';
  if((scheme === 'http' && port === '80') || (scheme === 'https' && port === '443'))
  {
    portPart = '';
  }
  let path = rest;
  if(!path && /(^|\.)piqpos\.net$/i.test(host))
  {
    path = '/pos';
  }
  return `${scheme}://${host}${portPart}${path}`;
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
        return parsed.map((x) => ({ ...x, module: normalizeModule(x.module) }));
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
    return [{ id: newId(), url: legacyUrl, label: legacyUrl, db: '', module: 'pos' }];
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
    db: input.db.trim(),
    module: normalizeModule(input.module)
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
