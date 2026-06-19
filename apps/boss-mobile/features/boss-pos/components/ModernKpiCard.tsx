import { memo } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CountUpText } from '@/components/ui/CountUpText';
import { FadeInView } from '@/components/ui/FadeInView';
import { PressableScale } from '@/components/ui/PressableScale';
import { Skeleton } from '@/components/ui/Skeleton';
import { device, f, ms, vs } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';

function hexLuminance(hex: string): number
{
  const h = hex.replace('#', '');
  if(h.length < 6)
  {
    return 0;
  }
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
/** Soften a vivid hex by mixing it toward white so KPI bars look pleasant, not garish */
function softenHex(hex: string, ratio: number): string
{
  const h = hex.replace('#', '');
  if(h.length < 6)
  {
    return hex;
  }
  const mix = (c: number) => Math.round(c + (255 - c) * ratio);
  const r = mix(parseInt(h.slice(0, 2), 16));
  const g = mix(parseInt(h.slice(2, 4), 16));
  const b = mix(parseInt(h.slice(4, 6), 16));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

type Props = {
  label: string;
  value: string;
  suffix?: string;
  icon?: string;
  accent?: string;
  wide?: boolean;
  pending?: boolean;
  tappable?: boolean;
  compare?: boolean;
  leftBadge?: string;
  infoBadge?: boolean;
  horizontal?: boolean;
  row?: boolean;
  index?: number;
  animateValue?: number;
  formatValue?: (n: number) => string;
  onPress?: () => void;
  onComparePress?: () => void;
  onLeftBadgePress?: () => void;
  onInfoPress?: () => void;
};

export const ModernKpiCard = memo(function ModernKpiCard({
  label,
  value,
  suffix,
  icon,
  accent,
  wide,
  pending,
  tappable,
  compare,
  leftBadge,
  infoBadge,
  horizontal,
  row,
  index = 0,
  animateValue,
  formatValue,
  onPress,
  onComparePress,
  onLeftBadgePress,
  onInfoPress
}: Props)
{
  const accentColor = accent ?? theme.color.primary;
  const canCountUp = animateValue != null && !!formatValue;
  if(row)
  {
    const rowBg = softenHex(accentColor, 0.5);
    const lightBg = hexLuminance(rowBg) > 0.62;
    const onColor = lightBg ? theme.color.text : theme.color.textOnPrimary;
    const onMuted = lightBg ? theme.color.textMuted : theme.color.textOnPrimaryMuted;
    const rowBody = (
      <View style={styles.rowInner}>
        {leftBadge ?
          (
            <Pressable style={styles.rowBadgeBtn} onPress={onLeftBadgePress} hitSlop={6}>
              <Text style={[textSharp, styles.rowBadgeEmoji, { color: onColor }]}>{leftBadge}</Text>
            </Pressable>
          ) : null}
        {icon ?
          (
            <View style={[styles.rowIcon, { backgroundColor: accentColor }]}>
              <Text style={[textSharp, styles.rowIconText]}>{icon}</Text>
            </View>
          ) : null}
        <Text style={[textSharp, styles.rowLabel, { color: onColor }]} numberOfLines={2}>{label}</Text>
        {compare ?
          (
            <Pressable style={styles.rowBadgeBtn} onPress={onComparePress} hitSlop={6}>
              <Text style={[textSharp, styles.rowBadgeEmoji, { color: onColor }]}>⚖</Text>
            </Pressable>
          ) : null}
        <View style={styles.rowValueWrap}>
          {pending ?
            <Skeleton width={ms(70)} height={f(18)} /> :
            canCountUp ?
              <CountUpText value={animateValue as number} format={formatValue as (n: number) => string} style={[styles.rowValue, { color: onColor }]} /> :
              <Text style={[textSharp, styles.rowValue, { color: onColor }]}>{value}</Text>}
          {!pending && suffix ?
            <Text style={[textSharp, styles.rowSuffix, { color: onMuted }]}>{suffix}</Text> : null}
          {!pending && infoBadge ?
            (
              <Pressable onPress={onInfoPress} hitSlop={8}>
                <Text style={[textSharp, styles.rowInfoBadge, { color: onColor }]}>i</Text>
              </Pressable>
            ) : null}
        </View>
        {tappable ?
          <Ionicons name="chevron-forward" size={ms(16)} color={onMuted} /> : null}
      </View>
    );
    return (
      <FadeInView delay={Math.min(index * 40, 320)} style={styles.rowWrap}>
        {onPress ?
          (
            <PressableScale onPress={onPress} style={[styles.rowCard, { backgroundColor: rowBg }]}>
              {rowBody}
            </PressableScale>
          ) :
          (
            <View style={[styles.rowCard, { backgroundColor: rowBg }]}>
              {rowBody}
            </View>
          )}
      </FadeInView>
    );
  }
  const body = (
    <>
      <View style={[styles.accentStrip, { backgroundColor: accentColor }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          {leftBadge ?
            (
              <Pressable style={styles.badgeBtn} onPress={onLeftBadgePress} hitSlop={6}>
                <Text style={[textSharp, styles.badgeEmoji]}>{leftBadge}</Text>
              </Pressable>
            ) : null}
          {icon ?
            (
              <View style={[styles.iconBubble, { backgroundColor: `${accentColor}18` }]}>
                <Text style={[textSharp, styles.icon]}>{icon}</Text>
              </View>
            ) : null}
          <Text style={[textSharp, styles.label]} numberOfLines={2}>{label}</Text>
          {compare ?
            (
              <Pressable style={styles.badgeBtn} onPress={onComparePress} hitSlop={6}>
                <Text style={[textSharp, styles.badgeEmoji]}>⚖</Text>
              </Pressable>
            ) : null}
        </View>
        <View style={styles.valueBlock}>
          <View style={styles.valueRow}>
            {pending ?
              <Skeleton width={ms(76)} height={f(22)} /> :
              canCountUp ?
                <CountUpText value={animateValue as number} format={formatValue as (n: number) => string} style={[styles.value, { color: accentColor }]} /> :
                <Text style={[textSharp, styles.value, { color: accentColor }]}>{value}</Text>}
            {!pending && suffix ?
              <Text style={[textSharp, styles.suffix]}>{suffix}</Text> : null}
            {!pending && infoBadge ?
              (
                <Pressable onPress={onInfoPress} hitSlop={8}>
                  <Text style={[textSharp, styles.infoBadge]}>i</Text>
                </Pressable>
              ) : null}
          </View>
        </View>
      </View>
      {tappable ?
        (
          <View style={[styles.tapIcon, { backgroundColor: `${accentColor}18` }]}>
            <Ionicons name="chevron-forward" size={ms(12)} color={accentColor} />
          </View>
        ) : null}
    </>
  );
  return (
    <FadeInView delay={Math.min(index * 45, 360)} style={[styles.wrap, horizontal ? styles.wrapH : (wide && styles.wrapWide)]}>
      {onPress ?
        (
          <PressableScale onPress={onPress} style={styles.card}>
            {body}
          </PressableScale>
        ) :
        (
          <View style={styles.card}>
            {body}
          </View>
        )}
    </FadeInView>
  );
});

const CARD_MIN_H = device.isSE ? vs(108) : device.isProMax ? vs(128) : vs(118);
export const KPI_CARD_H_WIDTH = device.isSE ? ms(150) : ms(164);
export const KPI_CARD_H_STRIDE = KPI_CARD_H_WIDTH + theme.space.sm;

const styles = StyleSheet.create({
  wrap: {
    width: '48%',
    marginBottom: theme.space.sm
  },
  wrapWide: {
    width: '100%'
  },
  wrapH: {
    width: KPI_CARD_H_WIDTH,
    marginBottom: 0
  },
  rowWrap: {
    width: '100%',
    marginBottom: ms(6)
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: vs(56),
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
    ...theme.shadow.soft
  },
  rowInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    paddingHorizontal: theme.space.md,
    paddingVertical: ms(9)
  },
  rowIcon: {
    width: ms(32),
    height: ms(32),
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)'
  },
  rowIconText: {
    fontSize: f(16)
  },
  rowLabel: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.color.textOnPrimary,
    lineHeight: f(16)
  },
  rowValueWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4
  },
  rowValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    letterSpacing: -0.2,
    color: theme.color.textOnPrimary
  },
  rowSuffix: {
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    color: theme.color.textOnPrimaryMuted
  },
  rowInfoBadge: {
    width: ms(18),
    height: ms(18),
    borderRadius: ms(9),
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: ms(18),
    fontSize: f(11),
    fontWeight: '800',
    color: theme.color.textOnPrimary,
    backgroundColor: 'rgba(255,255,255,0.22)'
  },
  rowBadgeBtn: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowBadgeEmoji: {
    fontSize: f(13),
    fontWeight: '800',
    color: theme.color.textOnPrimary
  },
  card: {
    width: '100%',
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    minHeight: CARD_MIN_H,
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.border,
    ...theme.shadow.card
  },
  accentStrip: {
    height: ms(4),
    width: '100%'
  },
  body: {
    flex: 1,
    padding: theme.space.md,
    paddingTop: theme.space.sm
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.xs,
    marginBottom: theme.space.sm
  },
  badgeBtn: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    backgroundColor: theme.color.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.color.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeEmoji: {
    fontSize: f(14),
    fontWeight: '800',
    color: theme.color.textSecondary
  },
  iconBubble: {
    width: ms(28),
    height: ms(28),
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    fontSize: f(14)
  },
  label: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.color.textSecondary,
    lineHeight: f(18)
  },
  valueBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4
  },
  value: {
    fontSize: theme.fontSize.kpi,
    fontWeight: '700',
    textAlign: 'center'
  },
  suffix: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.color.danger
  },
  infoBadge: {
    width: ms(18),
    height: ms(18),
    borderRadius: ms(9),
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: ms(18),
    fontSize: f(11),
    fontWeight: '800',
    color: theme.color.primary,
    backgroundColor: theme.color.primarySoft
  },
  tapIcon: {
    position: 'absolute',
    right: theme.space.sm,
    bottom: theme.space.sm,
    width: ms(20),
    height: ms(20),
    borderRadius: ms(10),
    alignItems: 'center',
    justifyContent: 'center'
  }
});
