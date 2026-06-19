import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import type { DatePresetId } from './dateRange';
import { APP_LANG_OPTIONS, loadAppLang, normalizeAppLang, saveAppLang, type AppLang, type LangOption } from './langConfig';
import { langTr } from '../locale/tr';
import { langFr } from '../locale/fr';
import { langEn } from '../locale/en';
import { mobileExtraTr, mobileExtraFr, mobileExtraEn } from '../locale/mobileExtra';

const deviceLang = getLocales()[0]?.languageCode ?? 'fr';
const bootLng = normalizeAppLang(deviceLang) ?? 'fr';

void i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: { ...langTr, mobileExtra: mobileExtraTr } },
    fr: { translation: { ...langFr, mobileExtra: mobileExtraFr } },
    en: { translation: { ...langEn, mobileExtra: mobileExtraEn } }
  },
  lng: bootLng,
  fallbackLng: 'fr',
  compatibilityJSON: 'v3',
  interpolation: { escapeValue: false }
});

type LangTickState = {
  tick: number;
  bump: () => void;
};

export const useLangTick = create<LangTickState>((set) => ({
  tick: 0,
  bump: () => set((s) => ({ tick: s.tick + 1 }))
}));

export async function initAppLanguage(): Promise<AppLang>
{
  const saved = await loadAppLang();
  const lng = saved ?? bootLng;
  await i18n.changeLanguage(lng);
  useLangTick.getState().bump();
  return lng;
}

export async function setAppLanguage(lng: AppLang): Promise<void>
{
  await saveAppLang(lng);
  await i18n.changeLanguage(lng);
  useLangTick.getState().bump();
}

export type { AppLang, LangOption };
export { APP_LANG_OPTIONS };

export type LangSelectOption = { value: AppLang; label: string };

export function useLangOptions(): LangSelectOption[]
{
  useLangTick((s) => s.tick);
  const { t } = useTranslation();
  return APP_LANG_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(`mobileExtra.${opt.labelKey}`)
  }));
}

export function tDash(key: string): string
{
  return i18n.t(`dashboard.${key}`);
}

export function useTDash(): (key: string) => string
{
  useLangTick((s) => s.tick);
  const { i18n: inst } = useTranslation();
  return (key: string) => inst.t(`dashboard.${key}`);
}

const PRESET_DASH_KEYS: Record<Exclude<DatePresetId, 'custom'>, string> = {
  today: 'dtToday',
  yesterday: 'tdLastDay',
  thisWeek: 'dtThisWeek',
  lastWeek: 'dtLastWeek',
  thisMonth: 'dtMount',
  lastMonth: 'dtLastMount',
  thisYear: 'dtYear',
  lastYear: 'dtLastYear'
};

export function bossPresetLabel(preset: DatePresetId): string
{
  if(preset === 'custom')
  {
    return tDash('selectDateRange');
  }
  const key = PRESET_DASH_KEYS[preset];
  return key ? tDash(key) : tDash('selectDateRange');
}

export function useBossPresetLabel(): (preset: DatePresetId) => string
{
  useLangTick((s) => s.tick);
  const { i18n: inst } = useTranslation();
  return (preset: DatePresetId) =>
  {
    if(preset === 'custom')
    {
      return inst.t('dashboard.selectDateRange');
    }
    const key = PRESET_DASH_KEYS[preset];
    return key ? inst.t(`dashboard.${key}`) : inst.t('dashboard.selectDateRange');
  };
}

export default i18n;
