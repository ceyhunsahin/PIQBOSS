import { Stack, usePathname, useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { POS_TABS, posTabLabel } from '@/features/boss-pos/config/posTabs';
import { OFF_TABS } from '@/features/boss-off/config/offTabs';
import { REST_TABS } from '@/features/boss-rest/config/restTabs';
import { ModuleSelect } from '@/components/ui/ModuleSelect';
import { MarketSelect } from '@/components/ui/MarketSelect';
import { useAuth } from '@/lib/auth';
import { useBootstrap } from '@/lib/bootstrap';
import { useTDash } from '@/lib/i18n';
import { useOffTab } from '@/lib/offTabStore';
import { usePosTab } from '@/lib/posTabStore';
import { useRestTab } from '@/lib/restTabStore';
import { f, ms } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { useEmptyLabel } from '@/lib/uiText';
import { theme } from '@/lib/theme';

export default function MainLayout()
{
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const dash = useTDash();
  const emptyLabel = useEmptyLabel();
  const menuItems = useAuth((s) => s.menuItems);
  const sector = useBootstrap((s) => s.sector);
  const user = useAuth((s) => s.user);
  const companyName = useAuth((s) => s.companyName);
  const posTab = usePosTab((s) => s.tab);
  const offTab = useOffTab((s) => s.tab);
  const restTab = useRestTab((s) => s.tab);
  // Login'de secilen modul neyse sadece ona baglaniyoruz; diger sektorleri menude gostermiyoruz.
  const sectorMenu = useMemo(() =>
  {
    const filtered = menuItems.filter((item) => item.sector === sector);
    return filtered.length > 0 ? filtered : menuItems;
  }, [menuItems, sector]);
  const activeItem = useMemo(() =>
  {
    return sectorMenu.find((item) =>
    {
      const href = item.route.replace('/(main)', '');
      return pathname === href || pathname.startsWith(`${href}/`);
    });
  }, [sectorMenu, pathname]);
  const isPosDashboard = pathname.includes('/boss/pos');
  const isOffDashboard = pathname.includes('/boss/off');
  const isRestDashboard = pathname.includes('/boss/rest');
  const isSettings = pathname.includes('/boss/settings');
  const activePosTab = useMemo(() => POS_TABS.find((x) => x.id === posTab) ?? POS_TABS[0], [posTab]);
  const activeOffTab = useMemo(() => OFF_TABS.find((x) => x.id === offTab) ?? OFF_TABS[0], [offTab]);
  const activeRestTab = useMemo(() => REST_TABS.find((x) => x.id === restTab) ?? REST_TABS[0], [restTab]);
  const initials = (user?.displayName ?? user?.username ?? t('lblLogin')).slice(0, 1).toUpperCase();
  const goBack = () =>
  {
    if(router.canGoBack())
    {
      router.back();
      return;
    }
    const fallback = sectorMenu[0]?.route ?? '/(main)/boss/pos';
    router.replace(fallback as Href);
  };
  const contextLabel = isSettings ?
    t('txtLangSelect') :
    isPosDashboard ?
      posTabLabel(activePosTab, t, dash) :
      isOffDashboard ?
        t(`dashboardOff.${activeOffTab.labelKey}`) :
        isRestDashboard ?
          t(`dashboardRest.${activeRestTab.labelKey}`) :
          (activeItem ? t(activeItem.labelKey) : t('menu.dash'));
  const userLabel = user?.displayName ?? user?.username ?? emptyLabel;
  const headerTitle = companyName ?? userLabel;
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={theme.gradient.night}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGrad}
      >
        <View style={styles.glowGold} />
        <View style={styles.glowIndigo} />
        <SafeAreaView edges={['top']}>
          <View style={styles.topRow}>
            {isSettings ?
              (
                <Pressable style={styles.iconBtn} onPress={goBack} hitSlop={10}>
                  <Ionicons name="chevron-back" size={ms(22)} color={theme.color.textOnInk} />
                </Pressable>
              ) :
              (
                <ModuleSelect items={sectorMenu} activeId={activeItem?.id} />
              )}
            <View style={styles.brand}>
              <Pressable
                onPress={() => { if(!isSettings) { router.push('/(main)/boss/settings' as Href); } }}
                disabled={isSettings}
                hitSlop={6}
              >
                <Text style={[textSharp, styles.brandTitle]} numberOfLines={1} ellipsizeMode="tail">{headerTitle}</Text>
              </Pressable>
              {!isSettings ? <MarketSelect /> : null}
            </View>
            <Pressable
              style={styles.avatarWrap}
              onPress={() => (isSettings ? goBack() : router.push('/(main)/boss/settings' as Href))}
            >
              <LinearGradient
                colors={theme.gradient.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={[textSharp, styles.avatarText]}>{initials}</Text>
              </LinearGradient>
            </Pressable>
          </View>
          <View style={styles.contextRow}>
            <View style={styles.contextDot} />
            <Text style={[textSharp, styles.contextText]} numberOfLines={1} ellipsizeMode="tail">{contextLabel}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.color.bg } }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg },
  headerGrad: {
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    overflow: 'hidden',
    ...theme.shadow.card
  },
  glowGold: {
    position: 'absolute',
    top: -ms(50),
    right: -ms(30),
    width: ms(150),
    height: ms(150),
    borderRadius: ms(75),
    backgroundColor: theme.color.accentGlow,
    opacity: 0.12
  },
  glowIndigo: {
    position: 'absolute',
    bottom: -ms(60),
    left: -ms(40),
    width: ms(160),
    height: ms(160),
    borderRadius: ms(80),
    backgroundColor: theme.color.primaryGlow,
    opacity: 0.18
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.space.md,
    paddingTop: theme.space.xs,
    paddingBottom: theme.space.xs,
    gap: theme.space.sm
  },
  brand: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: theme.space.xs,
    justifyContent: 'center',
    gap: ms(4)
  },
  brandTitle: {
    color: theme.color.textOnInk,
    fontSize: f(17),
    fontWeight: '800',
    letterSpacing: 0.2
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(6),
    paddingBottom: theme.space.sm,
    paddingTop: ms(2),
    paddingHorizontal: theme.space.lg
  },
  contextDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: theme.color.accentLight
  },
  contextText: {
    color: theme.color.textOnInkMuted,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    letterSpacing: 0.3,
    flexShrink: 1
  },
  iconBtn: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)'
  },
  avatarWrap: {
    borderRadius: ms(12),
    marginLeft: theme.space.xs,
    ...theme.shadow.glow
  },
  avatar: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: theme.color.textOnInk,
    fontWeight: '900',
    fontSize: f(16)
  }
});
