import { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { ms } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';

type Item = {
  label: string;
  value: number;
  display: string;
};

type Props = {
  items: Item[];
  palette?: string[];
  emptyText?: string;
};

const DEFAULT_PALETTE = [
  theme.color.chart1,
  theme.color.chart2,
  theme.color.chart3,
  theme.color.chart4,
  theme.color.chart5,
  theme.color.primaryLight,
  theme.color.teal
];

export const ShareBar = memo(function ShareBar({ items, palette, emptyText }: Props)
{
  const progress = useRef(new Animated.Value(0)).current;
  // items her render'da yeni dizi referansi; animasyonu sadece gercek veri degisince tetikle (yoksa cift render gibi gozukur).
  const sig = items.map((i) => `${i.label}:${i.value}`).join('|');
  useEffect(() =>
  {
    progress.setValue(0);
    const anim = Animated.timing(progress, { toValue: 1, duration: 640, useNativeDriver: false });
    anim.start();
    return () => anim.stop();
  }, [progress, sig]);
  if(items.length === 0)
  {
    return <Text style={[textSharp, styles.empty]}>{emptyText ?? ''}</Text>;
  }
  const colors = palette ?? DEFAULT_PALETTE;
  const total = items.reduce((sum, it) => sum + Math.max(0, it.value), 0) || 1;
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const fillWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: fillWidth }]}>
          {sorted.map((item, i) =>
          {
            const share = Math.max(0, item.value) / total;
            if(share <= 0)
            {
              return null;
            }
            return (
              <View
                key={`${item.label}-${i}`}
                style={{ flex: share, backgroundColor: colors[i % colors.length] }}
              />
            );
          })}
        </Animated.View>
      </View>
      <View style={styles.legend}>
        {sorted.map((item, i) =>
        {
          const share = Math.max(0, item.value) / total;
          return (
            <View key={`${item.label}-${i}`} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: colors[i % colors.length] }]} />
              <Text style={[textSharp, styles.legendLabel]} numberOfLines={1}>{item.label}</Text>
              <Text style={[textSharp, styles.legendShare]}>{Math.round(share * 100)}%</Text>
              <Text style={[textSharp, styles.legendValue]} numberOfLines={1}>{item.display}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    padding: theme.space.lg
  },
  track: {
    height: ms(16),
    borderRadius: ms(8),
    backgroundColor: theme.color.surfaceMuted,
    overflow: 'hidden',
    flexDirection: 'row'
  },
  fill: {
    flexDirection: 'row',
    height: '100%'
  },
  legend: {
    marginTop: theme.space.md,
    gap: theme.space.sm
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm
  },
  dot: {
    width: ms(10),
    height: ms(10),
    borderRadius: ms(5)
  },
  legendLabel: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.color.textSecondary,
    fontWeight: '600'
  },
  legendShare: {
    width: ms(40),
    textAlign: 'right',
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    color: theme.color.textMuted
  },
  legendValue: {
    width: ms(90),
    textAlign: 'right',
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    color: theme.color.text
  },
  empty: {
    padding: theme.space.lg,
    fontSize: theme.fontSize.body,
    color: theme.color.textMuted
  }
});
