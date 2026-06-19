import { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FadeInView } from '@/components/ui/FadeInView';
import { PressableScale } from '@/components/ui/PressableScale';
import { formatCurrency, formatPercent } from '@/lib/format';
import { f, ms } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';

type Props = {
  name: string;
  margin: number;
  marginRate: number;
  sales: number;
  subLabel: string;
  index?: number;
  onPress?: () => void;
  onLossInfo?: () => void;
  onMarginFilter?: () => void;
};

export const MARGIN_CARD_WIDTH = ms(168);
export const MARGIN_CARD_STRIDE = MARGIN_CARD_WIDTH + theme.space.sm;

function rateColor(rate: number): string
{
  if(rate >= 40)
  {
    return theme.color.success;
  }
  if(rate >= 30)
  {
    return theme.color.warning;
  }
  return theme.color.danger;
}

export const MarginGroupCard = memo(function MarginGroupCard({ name, margin, marginRate, sales, subLabel, index = 0, onPress, onLossInfo, onMarginFilter }: Props)
{
  const accent = rateColor(marginRate);
  return (
    <FadeInView delay={Math.min(index * 45, 360)} offset={14} style={styles.wrap}>
      <PressableScale onPress={onPress} style={styles.card}>
        <View style={[styles.accent, { backgroundColor: accent }]} />
        <View style={styles.headRow}>
          <View style={styles.rankPill}>
            <Text style={[textSharp, styles.rankText]}>{`#${index + 1}`}</Text>
          </View>
          <Text style={styles.fire}>🔥</Text>
          <View style={styles.spacer} />
          {onLossInfo ?
            <Pressable style={styles.iconBtn} onPress={onLossInfo} hitSlop={6}>
              <Text style={[textSharp, styles.iconQ]}>?</Text>
            </Pressable> : null}
          {onMarginFilter ?
            <Pressable style={styles.iconBtn} onPress={onMarginFilter} hitSlop={6}>
              <Text style={[textSharp, styles.iconPct]}>%</Text>
            </Pressable> : null}
        </View>
        <Text style={[textSharp, styles.title]} numberOfLines={2}>{name}</Text>
        <Text style={[textSharp, styles.margin]} numberOfLines={1}>{formatCurrency(margin)}</Text>
        <View style={[styles.ratePill, { backgroundColor: `${accent}1A` }]}>
          <Ionicons name={marginRate >= 0 ? 'trending-up' : 'trending-down'} size={ms(12)} color={accent} />
          <Text style={[textSharp, styles.rateText2, { color: accent }]}>{formatPercent(marginRate)}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={[textSharp, styles.footerLabel]} numberOfLines={1}>{subLabel}</Text>
          <Text style={[textSharp, styles.footerValue]} numberOfLines={1}>{formatCurrency(sales)}</Text>
        </View>
      </PressableScale>
    </FadeInView>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginRight: theme.space.sm
  },
  card: {
    width: MARGIN_CARD_WIDTH,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
    paddingHorizontal: theme.space.md,
    paddingTop: theme.space.md,
    paddingBottom: theme.space.sm,
    overflow: 'hidden',
    ...theme.shadow.soft
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ms(4)
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.xs,
    marginTop: theme.space.xs
  },
  rankPill: {
    paddingHorizontal: theme.space.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: theme.color.surfaceMuted
  },
  rankText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
    color: theme.color.textSecondary
  },
  fire: {
    fontSize: theme.fontSize.sm
  },
  spacer: {
    flex: 1
  },
  iconBtn: {
    width: ms(24),
    height: ms(24),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.border,
    ...theme.shadow.soft
  },
  iconQ: {
    fontSize: theme.fontSize.sm,
    fontWeight: '900',
    color: theme.color.primary
  },
  iconPct: {
    fontSize: theme.fontSize.sm,
    fontWeight: '900',
    color: theme.color.warning
  },
  title: {
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    color: theme.color.text,
    marginTop: theme.space.sm,
    minHeight: f(32)
  },
  margin: {
    fontSize: f(18),
    fontWeight: '900',
    color: theme.color.text,
    letterSpacing: -0.3,
    marginTop: theme.space.xs
  },
  ratePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: theme.space.sm,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: theme.space.xs
  },
  rateText2: {
    fontSize: theme.fontSize.xs,
    fontWeight: '800'
  },
  footer: {
    marginTop: theme.space.sm,
    paddingTop: theme.space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.color.border
  },
  footerLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted
  },
  footerValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    color: theme.color.textSecondary,
    marginTop: 1
  }
});
