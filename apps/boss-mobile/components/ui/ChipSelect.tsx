import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '@/lib/theme';

type Option = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
};

export function ChipSelect({ label, options, value, onChange }: Props)
{
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((opt) =>
        {
          const active = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChange(opt.value)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: theme.space.lg
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.color.textSecondary,
    marginBottom: theme.space.sm
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space.sm
  },
  chip: {
    paddingHorizontal: theme.space.lg,
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
  chipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.color.textSecondary
  },
  chipTextActive: {
    color: theme.color.textOnPrimary
  }
});
