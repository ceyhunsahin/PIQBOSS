import * as SecureStore from 'expo-secure-store';

const LANG_KEY = 'lang';

export type AppLang = 'tr' | 'fr' | 'en';

export type LangOption = {
  value: AppLang;
  labelKey: 'langTr' | 'langFr' | 'langEn';
  flag: string;
};

export const APP_LANG_OPTIONS: LangOption[] = [
  { value: 'tr', labelKey: 'langTr', flag: '🇹🇷' },
  { value: 'fr', labelKey: 'langFr', flag: '🇫🇷' },
  { value: 'en', labelKey: 'langEn', flag: '🇬🇧' }
];

export function normalizeAppLang(value: string | null | undefined): AppLang | null
{
  if(value === 'tr' || value === 'fr' || value === 'en')
  {
    return value;
  }
  return null;
}

export async function loadAppLang(): Promise<AppLang | null>
{
  const saved = await SecureStore.getItemAsync(LANG_KEY);
  return normalizeAppLang(saved);
}

export async function saveAppLang(lang: AppLang): Promise<void>
{
  await SecureStore.setItemAsync(LANG_KEY, lang);
}
