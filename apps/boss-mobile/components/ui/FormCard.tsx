import { type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { ms } from '@/lib/responsive';
import { theme } from '@/lib/theme';

type Props = {
  children: ReactNode;
};

export function FormCard({ children }: Props)
{
  return (
    <View style={styles.shell}>
      <View style={styles.handle} />
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexGrow: 1,
    marginTop: -theme.radius.xl
  },
  handle: {
    alignSelf: 'center',
    width: ms(40),
    height: ms(4),
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginBottom: theme.space.sm
  },
  card: {
    flexGrow: 1,
    backgroundColor: theme.color.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingHorizontal: theme.space.xl,
    paddingTop: theme.space.lg,
    paddingBottom: theme.space.lg,
    ...theme.shadow.card
  }
});
