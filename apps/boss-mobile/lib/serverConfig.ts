import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const SERVER_KEY = 'piqboss.serverUrl';

export function getDefaultServerUrl(): string
{
  return (Constants.expoConfig?.extra?.apiUrl as string) ?? 'http://localhost:80';
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
