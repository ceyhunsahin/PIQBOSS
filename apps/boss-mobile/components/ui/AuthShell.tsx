import { type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { AuthHeader } from '@/components/ui/AuthHeader';
import { FadeInView } from '@/components/ui/FadeInView';
import { FormCard } from '@/components/ui/FormCard';
import { Screen } from '@/components/ui/Screen';
import { theme } from '@/lib/theme';

type Props = {
  subtitle?: string;
  children: ReactNode;
};

export function AuthShell({ subtitle, children }: Props)
{
  return (
    <Screen keyboard scroll bg={theme.color.brand} contentStyle={styles.grow}>
      <AuthHeader subtitle={subtitle} />
      <FadeInView offset={20} duration={420} style={styles.grow}>
        <FormCard>{children}</FormCard>
      </FadeInView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grow: { flexGrow: 1 }
});
