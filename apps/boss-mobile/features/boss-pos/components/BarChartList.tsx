import { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { f, ms } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';

type Item = {
  label: string;
  value: number;
  display: string;
  sub?: string;
  onPress?: () => void;
};

type Props = {
  items: Item[];
  color?: string;
  colors?: [string, string];
  rank?: boolean;
  emptyText?: string;
};

const MEDALS = [theme.color.accent, '#94A3B8', '#B45309'];

function rankColor(index: number): string
{
  return index < 3 ? MEDALS[index] : theme.color.surfaceMuted;
}

function Bar({ item, max, index, gradient, rank, progress }: {
  item: Item;
  max: number;
  index: number;
  gradient: [string, string];
  rank: boolean;
  progress: Animated.Value;
})
{
  const pct = Math.max(4, (item.value / max) * 100);
  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${pct}%`] });
  const content = (
    <View style={styles.row}>
      <View style={styles.head}>
        {rank ?
          (
            <View style={[styles.rank, { backgroundColor: rankColor(index) }]}>
              <Text style={[textSharp, styles.rankText, index < 3 && styles.rankTextTop]}>{index + 1}</Text>
            </View>
          ) : null}
        <View style={styles.labelCol}>
          <Text style={[textSharp, styles.label]} numberOfLines={1}>{item.label}</Text>
          {item.sub ?
            <Text style={[textSharp, styles.sub]} numberOfLines={1}>{item.sub}</Text> : null}
        </View>
        <Text style={[textSharp, styles.value]} numberOfLines={1}>{item.display}</Text>
        {item.onPress ?
          <Text style={[textSharp, styles.chevron]}>›</Text> : null}
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]}>
          <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fillInner} />
        </Animated.View>
      </View>
    </View>
  );
  if(item.onPress)
  {
    return <Pressable onPress={item.onPress}>{content}</Pressable>;
  }
  return content;
}

export const BarChartList = memo(function BarChartList({ items, color, colors, rank, emptyText }: Props)
{
  const progress = useRef(new Animated.Value(0)).current;
  // items her render'da yeni dizi referansi; animasyonu sadece gercek veri degisince tetikle (yoksa cift render gibi gozukur).
  const sig = items.map((i) => `${i.label}:${i.value}`).join('|');
  useEffect(() =>
  {
    progress.setValue(0);
    const anim = Animated.timing(progress, { toValue: 1, duration: 620, useNativeDriver: false });
    anim.start();
    return () => anim.stop();
  }, [progress, sig]);
  if(items.length === 0)
  {
    return <Text style={[textSharp, styles.empty]}>{emptyText ?? ''}</Text>;
  }
  const max = Math.max(...items.map((i) => i.value), 1);
  const gradient: [string, string] = colors ?? (color ? [color, color] : theme.gradient.royal);
  return (
    <View style={styles.wrap}>
      {items.map((item, index) =>
      (
        <Bar
          key={`${item.label}-${index}`}
          item={item}
          max={max}
          index={index}
          gradient={gradient}
          rank={Boolean(rank)}
          progress={progress}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: theme.space.sm
  },
  row: {
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.sm
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    marginBottom: theme.space.xs
  },
  rank: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    alignItems: 'center',
    justifyContent: 'center'
  },
  rankText: {
    fontSize: f(11),
    fontWeight: '800',
    color: theme.color.textSecondary
  },
  rankTextTop: {
    color: theme.color.textOnPrimary
  },
  labelCol: {
    flex: 1
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.color.text
  },
  sub: {
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted,
    marginTop: 1
  },
  value: {
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    color: theme.color.text
  },
  chevron: {
    fontSize: f(18),
    color: theme.color.textMuted,
    fontWeight: '300'
  },
  track: {
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: theme.color.surfaceMuted,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: ms(4),
    overflow: 'hidden'
  },
  fillInner: {
    flex: 1
  },
  empty: {
    padding: theme.space.lg,
    fontSize: theme.fontSize.body,
    color: theme.color.textMuted
  }
});
