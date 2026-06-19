/** PiqBoss mobil — "Executive Boss" tasarım sistemi (responsive: iPhone 11..17 Pro Max) */
import { f, ms, s, vs } from './responsive';

/**
 * Boss palet:
 *  - Royal Indigo (primary)
 *  - Imperial Gold (accent) — "patron rengi"
 *  - Midnight Ink (header/hero arka planı)
 */
export const theme =
{
  color:
  {
    primary: '#4F46E5',
    primaryDark: '#3730A3',
    primaryLight: '#818CF8',
    primarySoft: 'rgba(79, 70, 229, 0.12)',
    primaryGlow: 'rgba(79, 70, 229, 0.32)',
    brand: '#231C61',
    brandDark: '#181246',
    brandLight: '#3A3192',
    brandCoral: '#EC6A8C',
    accent: '#F59E0B',
    accentDark: '#B45309',
    accentLight: '#FCD34D',
    accentSoft: 'rgba(245, 158, 11, 0.18)',
    accentGlow: 'rgba(245, 158, 11, 0.4)',
    violet: '#7C3AED',
    violetSoft: 'rgba(124, 58, 237, 0.18)',
    pink: '#DB2777',
    teal: '#14B8A6',
    ink: '#0B1120',
    inkSoft: '#1E1B4B',
    inkRoyal: '#312E81',
    bg: '#F4F5FB',
    bgAlt: '#EEF0F8',
    surface: '#FFFFFF',
    surfaceMuted: '#F8FAFC',
    surfaceTint: '#F1F2FB',
    surfaceGlass: 'rgba(255, 255, 255, 0.92)',
    surfaceGlassDark: 'rgba(15, 23, 42, 0.72)',
    border: '#E5E7F4',
    borderStrong: '#CBD0E5',
    borderFocus: '#4F46E5',
    text: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    textOnPrimary: '#FFFFFF',
    textOnPrimaryMuted: 'rgba(255,255,255,0.88)',
    textOnInk: '#FFFFFF',
    textOnInkMuted: 'rgba(255,255,255,0.82)',
    headerBg: '#0B1120',
    headerBorder: 'rgba(255,255,255,0.08)',
    tabInactive: 'rgba(255,255,255,0.55)',
    tabActiveBg: '#FFFFFF',
    tabActiveInk: '#0B1120',
    danger: '#EF4444',
    dangerBg: '#FEF2F2',
    success: '#10B981',
    successSoft: '#ECFDF5',
    warning: '#F59E0B',
    warningSoft: '#FFFBEB',
    chart1: '#4F46E5',
    chart2: '#7C3AED',
    chart3: '#14B8A6',
    chart4: '#F59E0B',
    chart5: '#DB2777',
    overlay: 'rgba(11, 17, 32, 0.66)',
    sheetHeader: '#0F172A',
    drawerBg: '#FFFFFF',
    drawerActive: 'rgba(79, 70, 229, 0.10)'
  },
  /** LinearGradient için renk dizileri — soldan sağa / yukarıdan aşağıya */
  gradient:
  {
    /** Header / hero arka planı — gece imparatorluğu */
    night: ['#0B1120', '#1E1B4B', '#312E81'] as [string, string, string],
    /** Primary aksiyonlar — kraliyet indigosu */
    royal: ['#4F46E5', '#7C3AED'] as [string, string],
    /** PIQSOFT kurumsal indigo — login / marka (app icon paleti) */
    brand: ['#211A5C', '#332B82'] as [string, string],
    /** PIQSOFT amblem gradyanı — pembe → turuncu */
    brandEmblem: ['#EC4E78', '#F59E3C'] as [string, string],
    /** Premium hero KPI */
    royalDeep: ['#312E81', '#4F46E5', '#7C3AED'] as [string, string, string],
    /** Patron altını — promosyon, başarı rozeti */
    gold: ['#F59E0B', '#DB2777'] as [string, string],
    goldSoft: ['#FCD34D', '#F59E0B'] as [string, string],
    /** Yeşil — kar, marj */
    emerald: ['#10B981', '#14B8A6'] as [string, string],
    /** KPI kart şeritleri (kenar şeridi) — şeffaf bitiş */
    accentStrip: ['#4F46E5', 'rgba(79, 70, 229, 0)'] as [string, string],
    /** Cam efekti */
    glass: ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.78)'] as [string, string],
    glassDark: ['rgba(15,23,42,0.85)', 'rgba(15,23,42,0.65)'] as [string, string]
  },
  space:
  {
    xs: ms(4),
    sm: ms(8),
    md: ms(12),
    lg: ms(16),
    xl: ms(24),
    xxl: ms(32)
  },
  spaceV:
  {
    xs: vs(4),
    sm: vs(8),
    md: vs(12),
    lg: vs(16),
    xl: vs(24),
    xxl: vs(32)
  },
  radius:
  {
    sm: ms(10),
    md: ms(14),
    lg: ms(18),
    xl: ms(24),
    pill: 999
  },
  fontSize:
  {
    xs: f(10),
    sm: f(12),
    body: f(14),
    md: f(16),
    lg: f(20),
    xl: f(28),
    kpi: f(22),
    hero: f(26),
    display: f(36),
    giant: f(44)
  },
  layout:
  {
    inputHeight: vs(48),
    buttonHeight: vs(48),
    headerHeight: vs(52),
    tabIconSize: ms(22),
    tabBarHeight: vs(72),
    authHeaderMin: vs(168),
    drawerWidth: Math.min(s(300), 360),
    sheetMaxHeightPct: 0.82,
    listMaxHeightPct: 0.62
  },
  shadow:
  {
    card:
    {
      shadowColor: '#0B1120',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6
    },
    soft:
    {
      shadowColor: '#0B1120',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2
    },
    tab:
    {
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.28,
      shadowRadius: 10,
      elevation: 4
    },
    glow:
    {
      shadowColor: '#F59E0B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 20,
      elevation: 8
    },
    sheet:
    {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 12
    }
  }
};

export type Theme = typeof theme;
