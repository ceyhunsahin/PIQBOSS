import { useRef, type ReactNode } from 'react';
import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
};

/** Basildiginda hafif kuculen dokunsal geri bildirim (native driver spring). */
export function PressableScale({ children, onPress, disabled, scaleTo = 0.97, style }: Props)
{
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (to: number) =>
  {
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6
    }).start();
  };
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => animate(scaleTo)}
      onPressOut={() => animate(1)}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
