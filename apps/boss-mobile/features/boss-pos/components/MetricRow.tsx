import { memo } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { f, ms } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';

type Props = {
  label: string;
  value: string;
  sub?: string;
  last?: boolean;
  share?: number;
  accent?: string;
  onPress?: () => void;
};

export const MetricRow = memo(function MetricRow({ label, value, sub, last, share, accent, onPress }: Props)
{
  const barColor = accent ?? theme.color.primary;
  const inner = (
    <>
      <View style={styles.left}>
        <Text style={[textSharp, styles.label]} numberOfLines={2}>{label}</Text>
        {sub ?
          <Text style={[textSharp, styles.sub]} numberOfLines={1}>{sub}</Text> : null}
        {typeof share === 'number' ?
          (
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.max(2, Math.min(1, share) * 100)}%`, backgroundColor: barColor }]} />
            </View>
          ) : null}
      </View>
      <View style={styles.right}>
        <Text style={[textSharp, styles.value]}>{value}</Text>
        {onPress ?
          <Text style={[textSharp, styles.chevron]}>›</Text> : null}
      </View>
    </>
  );
  if(onPress)
  {
    return (
      <Pressable style={[styles.row, !last && styles.rowBorder]} onPress={onPress}>
        {inner}
      </Pressable>
    );
  }
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      {inner}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
    gap: theme.space.md
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.color.border
  },
  left: {
    flex: 1
  },
  label: {
    fontSize: theme.fontSize.body,
    fontWeight: '600',
    color: theme.color.text
  },
  sub: {
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted,
    marginTop: 2
  },
  track: {
    marginTop: theme.space.xs,
    height: ms(5),
    borderRadius: ms(3),
    backgroundColor: theme.color.surfaceMuted,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: ms(3)
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.xs
  },
  value: {
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    color: theme.color.primary
  },
  chevron: {
    fontSize: f(18),
    color: theme.color.textMuted,
    fontWeight: '300'
  }
});
