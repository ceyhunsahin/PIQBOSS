import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const SERVER_KEY = 'piqboss.serverUrl';

export function getDefaultServerUrl(): string
{
  // Lokal gelistirme adresi (orn. 192.168.x.x) yalnizca DEV build'de on-doldurulur; boylece
  // developer kendi sunucusunu hazir gorur. Production'da bos donulur — son kullanici kendi
  // sunucu adresini girer, LAN/lokal adres asla gosterilmez.
  if(__DEV__)
  {
    return (Constants.expoConfig?.extra?.apiUrl as string) ?? 'http://localhost:80';
  }
  return '';
}

export async function loadServerUrl(): Promise<string | null>
{
  return SecureStore.getItemAsync(SERVER_KEY);
}

export async function saveServerUrl(url: string): Promise<void>
{
  const trimmed = url.trim().replace(/\/+$/, '');
  await SecureStore.setItemAsync(SERVER_KEY, trimmed);
}

export async function clearServerUrl(): Promise<void>
{
  await SecureStore.deleteItemAsync(SERVER_KEY);
}
