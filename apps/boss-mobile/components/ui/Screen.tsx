import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type ViewStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/lib/theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  keyboard?: boolean;
  bg?: string;
  contentStyle?: ViewStyle;
  scrollProps?: ScrollViewProps;
};

export function Screen({ children, scroll, keyboard, bg, contentStyle, scrollProps }: Props)
{
  const background = bg ?? theme.color.bg;
  const body = scroll ?
    (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, contentStyle]}
        {...scrollProps}
      >
        {children}
      </ScrollView>
    ) :
    (
      <View style={[styles.body, contentStyle]}>{children}</View>
    );
  const wrapped = keyboard ?
    (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {body}
      </KeyboardAvoidingView>
    ) :
    body;
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: background }]} edges={['left', 'right', 'bottom']}>
      {wrapped}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { flex: 1 },
  scroll: { flexGrow: 1 }
});
