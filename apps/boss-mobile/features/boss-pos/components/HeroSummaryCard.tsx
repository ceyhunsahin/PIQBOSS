import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CountUpText } from '@/components/ui/CountUpText';
import { FadeInView } from '@/components/ui/FadeInView';
import { PressableScale } from '@/components/ui/PressableScale';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatNumber } from '@/lib/format';
import { useTDash } from '@/lib/i18n';
import { f, ms, vs } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';

type Props = {
  total: number;
  count: number;
  avg: number;
  rangeLabel: string;
  pending?: boolean;
  onCashStatus?: () => void;
  onDetail?: () => void;
};

export const HeroSummaryCard = memo(function HeroSummaryCard({ total, count, avg, rangeLabel, pending, onCashStatus, onDetail }: Props)
{
  const dash = useTDash();
  return (
    <FadeInView offset={16} duration={420} style={styles.wrap}>
      <LinearGradient colors={theme.gradient.night} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.glowGold} />
        <View style={styles.glowIndigo} />
        <View style={styles.topRow}>
          <View style={styles.capWrap}>
            <Text style={[textSharp, styles.caption]}>{dash('dailySalesTotal')}</Text>
            <Text style={[textSharp, styles.range]}>{rangeLabel}</Text>
          </View>
        </View>
        <View style={styles.valueRow}>
          {pending ?
            <Skeleton width={ms(180)} height={f(36)} radius={ms(10)} /> :
            <CountUpText value={total} format={formatCurrency} style={[styles.value]} />}
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <View style={styles.statIcon}>
              <Ionicons name="receipt-outline" size={ms(15)} color={theme.color.accentLight} />
            </View>
            <View style={styles.statTextWrap}>
              <Text style={[textSharp, styles.statLabel]} numberOfLines={1}>{dash('dailySalesCount')}</Text>
              {pending ?
                <Skeleton width={ms(48)} height={f(15)} /> :
                <Text style={[textSharp, styles.statValue]} numberOfLines={1}>{formatNumber(count)}</Text>}
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <View style={styles.statIcon}>
              <Ionicons name="trending-up-outline" size={ms(15)} color={theme.color.accentLight} />
            </View>
            <View style={styles.statTextWrap}>
              <Text style={[textSharp, styles.statLabel]} numberOfLines={1}>{dash('salesAvg')}</Text>
              {pending ?
                <Skeleton width={ms(64)} height={f(15)} /> :
                <Text style={[textSharp, styles.statValue]} numberOfLines={1}>{formatCurrency(avg)}</Text>}
            </View>
          </View>
        </View>
        {(onCashStatus || onDetail) ?
          (
            <View style={styles.actionsRow}>
              {onCashStatus ?
                (
                  <PressableScale onPress={onCashStatus} style={styles.heroBtn}>
                    <Ionicons name="wallet-outline" size={ms(17)} color={theme.color.accentLight} />
                    <Text style={[textSharp, styles.heroBtnText]} numberOfLines={1}>{dash('posDevicesTitle')}</Text>
                  </PressableScale>
                ) : null}
              {onDetail ?
                (
                  <PressableScale onPress={onDetail} style={styles.heroBtn}>
                    <Ionicons name="stats-chart-outline" size={ms(17)} color={theme.color.accentLight} />
                    <Text style={[textSharp, styles.heroBtnText]} numberOfLines={1}>{dash('details')}</Text>
                  </PressableScale>
                ) : null}
            </View>
          ) : null}
      </LinearGradient>
    </FadeInView>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: theme.space.lg,
    marginBottom: theme.space.md
  },
  card: {
    borderRadius: theme.radius.lg,
    padding: theme.space.lg,
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
    opacity: 0.16
  },
  glowIndigo: {
    position: 'absolute',
    bottom: -ms(60),
    left: -ms(40),
    width: ms(160),
    height: ms(160),
    borderRadius: ms(80),
    backgroundColor: theme.color.primaryGlow,
    opacity: 0.22
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.space.sm,
    marginTop: theme.space.lg
  },
  heroBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space.xs,
    height: vs(40),
    borderRadius: ms(12),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)'
  },
  heroBtnText: {
    color: theme.color.textOnInk,
    fontSize: theme.fontSize.sm,
    fontWeight: '700'
  },
  capWrap: {
    flex: 1
  },
  caption: {
    color: theme.color.textOnInkMuted,
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6
  },
  range: {
    color: theme.color.textOnInk,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginTop: 2
  },
  valueRow: {
    minHeight: vs(44),
    justifyContent: 'center',
    marginTop: theme.space.sm
  },
  value: {
    color: theme.color.textOnInk,
    fontSize: theme.fontSize.display,
    fontWeight: '900',
    letterSpacing: -0.6
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.space.lg
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm
  },
  statIcon: {
    width: ms(30),
    height: ms(30),
    borderRadius: ms(9),
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statTextWrap: {
    flex: 1,
    minWidth: 0
  },
  statLabel: {
    color: theme.color.textOnInkMuted,
    fontSize: f(10),
    fontWeight: '600'
  },
  statValue: {
    color: theme.color.textOnInk,
    fontSize: f(15),
    fontWeight: '800',
    marginTop: 1
  },
  statDivider: {
    width: 1,
    height: ms(28),
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: theme.space.md
  }
});
