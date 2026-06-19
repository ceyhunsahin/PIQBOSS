import { memo, useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';
import { theme } from '@/lib/theme';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

/** Yumusak nabiz efektli yukleme iskeleti (shimmer) — ek bagimlilik yok, native driver. */
export const Skeleton = memo(function Skeleton({ width = '100%', height = 14, radius = theme.radius.sm, style }: Props)
{
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() =>
  {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 720, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 720, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.85] });
  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: theme.color.borderStrong, opacity },
        style
      ]}
    />
  );
});
