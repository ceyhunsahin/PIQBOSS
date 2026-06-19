import { useRef } from 'react';
import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { theme } from '@/lib/theme';

type Props = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
};

function resolveStyle(
  state: PressableStateCallbackType,
  isPrimary: boolean,
  disabled: boolean | null | undefined,
  loading: boolean | undefined,
  style: Props['style']
): StyleProp<ViewStyle>
{
  const extra = typeof style === 'function' ? style(state) : style;
  const inactive = Boolean(disabled || loading);
  return [
    styles.base,
    isPrimary ? styles.primary : styles.ghost,
    inactive && styles.disabled,
    state.pressed && isPrimary && !inactive && styles.primaryPressed,
    extra
  ];
}

export function Button({ label, loading, variant = 'primary', disabled, style, onPressIn, onPressOut, ...rest }: Props)
{
  const isPrimary = variant === 'primary';
  const inactive = Boolean(disabled || loading);
  const scale = useRef(new Animated.Value(1)).current;
  const spring = (to: number) =>
  {
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={(state) => resolveStyle(state, isPrimary, disabled, loading, style)}
        disabled={disabled || loading}
        onPressIn={(e) => { if(!inactive) { spring(0.97); } onPressIn?.(e); }}
        onPressOut={(e) => { spring(1); onPressOut?.(e); }}
        {...rest}
      >
        {loading ?
          <ActivityIndicator color={isPrimary ? theme.color.textOnPrimary : theme.color.primary} /> :
          <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textGhost]}>{label}</Text>}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: theme.layout.buttonHeight,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.space.sm
  },
  primary: {
    backgroundColor: theme.color.primary
  },
  primaryPressed: {
    backgroundColor: theme.color.primaryDark
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.color.border
  },
  disabled: {
    opacity: 0.55
  },
  text: {
    fontSize: theme.fontSize.body,
    fontWeight: '700'
  },
  textPrimary: {
    color: theme.color.textOnPrimary
  },
  textGhost: {
    color: theme.color.textSecondary
  }
});
