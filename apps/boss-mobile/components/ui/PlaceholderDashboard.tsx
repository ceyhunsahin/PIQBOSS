import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { theme } from '@/lib/theme';

type Props = {
  title: string;
  subtitle: string;
};

export function PlaceholderDashboard({ title, subtitle }: Props)
{
  return (
    <Screen contentStyle={styles.center}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.space.xl
  },
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space.xl,
    alignItems: 'center',
    ...theme.shadow.card
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.color.text,
    textAlign: 'center'
  },
  subtitle: {
    marginTop: theme.space.sm,
    fontSize: theme.fontSize.sm,
    color: theme.color.textMuted,
    textAlign: 'center'
  }
});
