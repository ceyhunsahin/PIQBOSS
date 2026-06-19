import * as SecureStore from 'expo-secure-store';

const CRED_KEY = 'piqboss.cred';

export type StoredCredentials = {
  username: string;
  password: string;
  tenant: string;
};

/** Marketler arasi otomatik gecis icin kullanici/sifre guvenli saklanir (SecureStore = Keychain/Keystore). */
export async function saveCredentials(cred: StoredCredentials): Promise<void>
{
  await SecureStore.setItemAsync(CRED_KEY, JSON.stringify(cred));
}

export async function loadCredentials(): Promise<StoredCredentials | null>
{
  const raw = await SecureStore.getItemAsync(CRED_KEY);
  if(!raw)
  {
    return null;
  }
  try
  {
    const parsed = JSON.parse(raw) as StoredCredentials;
    if(parsed && parsed.username && parsed.password)
    {
      return parsed;
    }
    return null;
  }
  catch
  {
    return null;
  }
}

export async function clearCredentials(): Promise<void>
{
  await SecureStore.deleteItemAsync(CRED_KEY);
}
