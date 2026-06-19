import { memo, useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { f, ms, vs } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';

type Item = {
  label: string;
  value: number;
  display: string;
};

type Props = {
  items: Item[];
  colors?: [string, string];
  emptyText?: string;
};

const CHART_H = vs(150);
const BAR_W = ms(18);
const COL_W = ms(38);

function Column({ item, max, peak, colors, progress, showValue }: {
  item: Item;
  max: number;
  peak: boolean;
  colors: [string, string];
  progress: Animated.Value;
  showValue: boolean;
})
{
  const target = Math.max(ms(3), (item.value / max) * CHART_H);
  const height = progress.interpolate({ inputRange: [0, 1], outputRange: [ms(3), target] });
  const barColors = peak ? theme.gradient.gold : colors;
  return (
    <View style={styles.col}>
      <View style={styles.valueSlot}>
        {showValue ?
          <Text style={[textSharp, styles.value, peak && styles.valuePeak]} numberOfLines={1}>{item.display}</Text> : null}
      </View>
      <View style={styles.barArea}>
        <Animated.View style={[styles.bar, { height }]}>
          <LinearGradient colors={barColors} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} style={styles.fill} />
        </Animated.View>
      </View>
      <Text style={[textSharp, styles.xLabel, peak && styles.xLabelPeak]} numberOfLines={1}>{item.label}</Text>
    </View>
  );
}

export const ColumnChart = memo(function ColumnChart({ items, colors, emptyText }: Props)
{
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() =>
  {
    progress.setValue(0);
    const anim = Animated.timing(progress, { toValue: 1, duration: 620, useNativeDriver: false });
    anim.start();
    return () => anim.stop();
  }, [progress, items]);
  if(items.length === 0)
  {
    return <Text style={[textSharp, styles.empty]}>{emptyText ?? ''}</Text>;
  }
  const max = Math.max(...items.map((i) => i.value), 1);
  const peakIndex = items.reduce((best, it, i) => (it.value > items[best].value ? i : best), 0);
  const showAllValues = items.length <= 12;
  const palette = colors ?? theme.gradient.royal;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.wrap, items.length * COL_W < ms(320) && styles.wrapFill]}
    >
      {items.map((item, i) =>
      (
        <Column
          key={`${item.label}-${i}`}
          item={item}
          max={max}
          peak={i === peakIndex}
          colors={palette}
          progress={progress}
          showValue={showAllValues || i === peakIndex}
        />
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.md,
    alignItems: 'flex-end'
  },
  wrapFill: {
    flexGrow: 1,
    justifyContent: 'space-around'
  },
  col: {
    width: COL_W,
    alignItems: 'center'
  },
  valueSlot: {
    height: f(14),
    justifyContent: 'flex-end'
  },
  value: {
    fontSize: f(9),
    fontWeight: '700',
    color: theme.color.textMuted
  },
  valuePeak: {
    color: theme.color.accentDark,
    fontSize: f(10)
  },
  barArea: {
    height: CHART_H,
    justifyContent: 'flex-end',
    marginVertical: theme.space.xs
  },
  bar: {
    width: BAR_W,
    borderTopLeftRadius: ms(5),
    borderTopRightRadius: ms(5),
    overflow: 'hidden',
    backgroundColor: theme.color.primary
  },
  fill: {
    flex: 1,
    width: '100%'
  },
  xLabel: {
    fontSize: f(9),
    color: theme.color.textMuted,
    fontWeight: '600'
  },
  xLabelPeak: {
    color: theme.color.text,
    fontWeight: '800'
  },
  empty: {
    padding: theme.space.lg,
    fontSize: theme.fontSize.body,
    color: theme.color.textMuted
  }
});
