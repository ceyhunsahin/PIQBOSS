import { Alert, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import i18n from './i18n';

// Mobil MAGAZA surumu MERKEZI piqhub'dan gelir (her musteri sunucusundan bagimsiz).
// app.json > extra.mobileVersionUrl ile override edilebilir.
const DEFAULT_VERSION_URL = 'https://piqhub.piqsoft.com/api/mobile-version';
function getVersionUrl(): string
{
  return (Constants.expoConfig?.extra?.mobileVersionUrl as string) || DEFAULT_VERSION_URL;
}

type MobileVersionResponse = {
  success?: boolean;
  version?: string | null;
  android?: string;
  ios?: string;
  mandatory?: boolean;
  note?: string;
};

/** "1.0.20f" → { nums:[1,0,20], suffix:'f' } */
function parseVersion(value: string): { nums: number[]; suffix: string }
{
  const parts = String(value ?? '').trim().split('.');
  const nums: number[] = [];
  let suffix = '';
  for(const part of parts)
  {
    const match = /^(\d+)([a-zA-Z]*)$/.exec(part.trim());
    if(match)
    {
      nums.push(parseInt(match[1], 10));
      if(match[2])
      {
        suffix = match[2];
      }
    }
    else
    {
      nums.push(0);
    }
  }
  return { nums, suffix };
}

/** a > b => 1, a < b => -1, esit => 0 */
function compareVersion(a: string, b: string): number
{
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  const len = Math.max(pa.nums.length, pb.nums.length);
  for(let i = 0; i < len; i++)
  {
    const na = pa.nums[i] ?? 0;
    const nb = pb.nums[i] ?? 0;
    if(na !== nb)
    {
      return na > nb ? 1 : -1;
    }
  }
  if(pa.suffix !== pb.suffix)
  {
    return pa.suffix > pb.suffix ? 1 : -1;
  }
  return 0;
}

let lastCheckAt = 0;
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

/** Merkezi piqhub /api/mobile-version → kurulu surumden yeni ise guncelleme uyarisi. */
export async function checkForUpdate(force = false): Promise<void>
{
  if(!force && Date.now() - lastCheckAt < CHECK_INTERVAL_MS)
  {
    return;
  }
  lastCheckAt = Date.now();
  let res: MobileVersionResponse;
  try
  {
    const r = await fetch(`${getVersionUrl()}?app=boss`, { method: 'GET' });
    if(!r.ok)
    {
      return;
    }
    res = (await r.json()) as MobileVersionResponse;
  }
  catch
  {
    return;
  }
  if(!res?.success || !res.version)
  {
    return;
  }
  const current = String(Constants.expoConfig?.version ?? '0.0.0');
  if(compareVersion(res.version, current) <= 0)
  {
    return;
  }
  const url = Platform.OS === 'ios' ? (res.ios ?? '') : (res.android ?? '');
  if(!url)
  {
    return;
  }
  const t = (key: string) => i18n.t(key);
  const body = `${t('updateAvailableBody')}${res.note ? `\n\n${res.note}` : ''}`;
  const updateBtn = { text: t('btnUpdateNow'), onPress: () => { void Linking.openURL(url); } };
  const buttons = res.mandatory ?
    [updateBtn] :
    [{ text: t('btnLater'), style: 'cancel' as const }, updateBtn];
  Alert.alert(t('updateAvailableTitle'), body, buttons, { cancelable: !res.mandatory });
}
