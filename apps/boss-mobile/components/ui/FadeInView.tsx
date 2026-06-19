import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  delay?: number;
  offset?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

/** Mount aninda asagidan yukari + fade giris. Sirali (staggered) kullanim icin delay ver. */
export function FadeInView({ children, delay = 0, offset = 14, duration = 360, style }: Props)
{
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() =>
  {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true
    });
    anim.start();
    return () => anim.stop();
  }, [progress, delay, duration]);
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] });
  return (
    <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
