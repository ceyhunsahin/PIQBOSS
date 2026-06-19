import { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ms } from '@/lib/responsive';
import { theme } from '@/lib/theme';

type Props = {
  progress: number;
  visible: boolean;
};

/** Ince, belirleyici (determinate) yukleme cubugu — bittiginde yumusakca kaybolur. */
export const ProgressBar = memo(function ProgressBar({ progress, visible }: Props)
{
  const width = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() =>
  {
    Animated.timing(width, {
      toValue: Math.max(0, Math.min(1, progress)),
      duration: 280,
      useNativeDriver: false
    }).start();
  }, [width, progress]);
  useEffect(() =>
  {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: visible ? 160 : 360,
      useNativeDriver: true
    }).start();
  }, [opacity, visible]);
  const fillWidth = width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <Animated.View style={[styles.track, { opacity }]} pointerEvents="none">
      <Animated.View style={[styles.fill, { width: fillWidth }]}>
        <LinearGradient colors={theme.gradient.royal} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.grad} />
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  track: {
    height: ms(3),
    marginHorizontal: theme.space.lg,
    marginTop: theme.space.xs,
    borderRadius: ms(2),
    backgroundColor: theme.color.surfaceMuted,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: ms(2),
    overflow: 'hidden'
  },
  grad: {
    flex: 1
  }
});
