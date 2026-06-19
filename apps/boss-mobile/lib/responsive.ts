import { Dimensions, PixelRatio, Platform } from 'react-native';

/**
 * Responsive ölçek — iPhone 11 ... 17 Pro Max ailesini hedefler.
 * Kısa kenar 360..440, uzun kenar 667..956 aralığında otomatik orantılar.
 *
 * Base: iPhone 12/13/14 (390x844). Küçük ekranlarda taşma olmaması için
 * min 0.92, büyük ekranlarda devasa font olmaması için max 1.18 ile clamp.
 */

const win = Dimensions.get('window');
const SHORT = Math.min(win.width, win.height);
const LONG = Math.max(win.width, win.height);

const BASE_W = 390;
const BASE_H = 844;

const clamp = (v: number, min: number, max: number): number =>
{
  return Math.min(max, Math.max(min, v));
};

const wRatio = clamp(SHORT / BASE_W, 0.92, 1.15);
const hRatio = clamp(LONG / BASE_H, 0.92, 1.18);

/** Yatay ölçek (kısa kenara göre, padding/width/icon) */
export function s(n: number): number
{
  return Math.round(n * wRatio);
}

/** Dikey ölçek (uzun kenara göre, height/marginVertical) */
export function vs(n: number): number
{
  return Math.round(n * hRatio);
}

/** Moderate scale — büyük değerleri orantısal, küçükleri sabite yakın tutar */
export function ms(n: number, factor = 0.5): number
{
  return Math.round(n + (s(n) - n) * factor);
}

/** Font ölçeği — sistem font ayarını da dikkate alır ama 0.9..1.15 ile sınırlar */
export function f(n: number): number
{
  const sysScale = clamp(PixelRatio.getFontScale(), 0.9, 1.15);
  return PixelRatio.roundToNearestPixel(Math.round(ms(n, 0.4) * sysScale));
}

const SE_W = 380;
const STD_W = 410;
const PROMAX_W = 425;

export const device =
{
  width: win.width,
  height: win.height,
  short: SHORT,
  long: LONG,
  isSE: SHORT < SE_W,
  isStandard: SHORT >= SE_W && SHORT < STD_W,
  isPlus: SHORT >= STD_W && SHORT < PROMAX_W,
  isProMax: SHORT >= PROMAX_W,
  isShortHeight: LONG < 750,
  isTallHeight: LONG >= 900,
  isAndroid: Platform.OS === 'android',
  isIOS: Platform.OS === 'ios'
};

/** Hedef cihaz: iPhone 11 -> iPhone 17 Pro Max. */
export type DeviceClass = 'se' | 'standard' | 'plus' | 'proMax';

export function deviceClass(): DeviceClass
{
  if(device.isSE)
  {
    return 'se';
  }
  if(device.isStandard)
  {
    return 'standard';
  }
  if(device.isPlus)
  {
    return 'plus';
  }
  return 'proMax';
}

/** width yüzdesine sabit `n` ekleyerek sayısal değer üretir (örn. yatay padding hesabı) */
export function pct(percent: number): number
{
  return Math.round(win.width * percent / 100);
}

/** İçeride sabit yüksekli sheet/list için kullanılan oran */
export function pctH(percent: number): number
{
  return Math.round(win.height * percent / 100);
}

/** Grid sütun sayısı — küçük ekranda 2, büyük ekranda 3 */
export function gridCols(min = 2): number
{
  if(device.isProMax && win.width >= 420)
  {
    return Math.max(min, 3);
  }
  return min;
}
