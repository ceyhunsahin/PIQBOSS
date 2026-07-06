import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { theme } from '@/lib/theme';

export type ChartChip = { id: string; label: string };

type Props = {
  items: ChartChip[];
  active: string;
  onChange: (id: string) => void;
};

export const ChartChips = memo(function ChartChips({ items, active, onChange }: Props)
{
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wrap}>
      {items.map((d) =>
      {
        const isActive = d.id === active;
        return (
          <Pressable key={d.id} style={[styles.chip, isActive && styles.chipActive]} onPress={() => onChange(d.id)}>
            <Text style={[styles.text, isActive && styles.textActive]}>{d.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: theme.space.lg,
    gap: theme.space.sm,
    marginBottom: theme.space.md
  },
  chip: {
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    borderRadius: 999,
    backgroundColor: theme.color.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.color.border
  },
  chipActive: {
    backgroundColor: theme.color.primary,
    borderColor: theme.color.primary
  },
  text: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.color.textSecondary
  },
  textActive: {
    color: theme.color.textOnPrimary
  }
});
