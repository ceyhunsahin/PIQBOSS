import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { PromoMargin } from '@piqboss/shared';
import { FadeInView } from '@/components/ui/FadeInView';
import { PressableScale } from '@/components/ui/PressableScale';
import { formatCurrency, formatPercent } from '@/lib/format';
import { useTDash } from '@/lib/i18n';
import { f, ms } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';

type Props = {
  promo: PromoMargin;
  onPress?: () => void;
};

export const PromoMarginCard = memo(function PromoMarginCard({ promo, onPress }: Props)
{
  const dash = useTDash();
  const positive = promo.marginRate >= 0;
  const accent = theme.color.pink;
  const grad = theme.gradient.gold;
  const share = Math.max(0.02, Math.min(1, Math.abs(promo.marginRate) / 100));
  return (
    <FadeInView offset={14} duration={360} style={styles.wrap}>
      <PressableScale onPress={onPress} style={styles.card}>
        <View style={[styles.accent, { backgroundColor: accent }]} />
        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={[styles.tag, { backgroundColor: `${accent}1A` }]}>
              <Ionicons name="pricetag" size={ms(12)} color={accent} />
            </View>
            <Text style={[textSharp, styles.title]} numberOfLines={1}>{dash('promo')}</Text>
            <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ratePill}>
              <Ionicons name={positive ? 'trending-up' : 'trending-down'} size={ms(12)} color={theme.color.textOnPrimary} />
              <Text style={[textSharp, styles.rateText]}>{formatPercent(promo.marginRate)}</Text>
            </LinearGradient>
          </View>
          <View style={styles.valueRow}>
            <Text style={[textSharp, styles.margin, { color: accent }]} numberOfLines={1}>{formatCurrency(promo.margin)}</Text>
            {onPress ?
              <Ionicons name="chevron-forward" size={ms(15)} color={theme.color.textMuted} /> : null}
          </View>
          <Text style={[textSharp, styles.sub]} numberOfLines={1}>{dash('totalSales')} {formatCurrency(promo.sales)}</Text>
          <View style={styles.track}>
            <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.fill, { width: `${share * 100}%` }]} />
          </View>
        </View>
      </PressableScale>
    </FadeInView>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: theme.space.lg,
    marginBottom: theme.space.md
  },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    overflow: 'hidden',
    ...theme.shadow.soft
  },
  accent: {
    width: ms(4)
  },
  body: {
    flex: 1,
    padding: theme.space.md
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm
  },
  tag: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(7),
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    flex: 1,
    fontSize: theme.fontSize.body,
    fontWeight: '800',
    color: theme.color.text
  },
  ratePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: theme.space.sm,
    paddingVertical: 3,
    borderRadius: 999
  },
  rateText: {
    color: theme.color.textOnPrimary,
    fontSize: theme.fontSize.xs,
    fontWeight: '800'
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.space.xs
  },
  margin: {
    fontSize: f(20),
    fontWeight: '900',
    letterSpacing: -0.3
  },
  sub: {
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted,
    marginTop: 2
  },
  track: {
    marginTop: theme.space.sm,
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: theme.color.surfaceMuted,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: ms(3)
  }
});
