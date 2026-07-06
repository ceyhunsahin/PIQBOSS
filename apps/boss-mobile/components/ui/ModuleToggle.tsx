import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ms } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';
import type { SectorModule } from '@/lib/serverProfiles';

const OPTIONS: { value: SectorModule; label: string }[] = [
  { value: 'pos', label: 'POS' },
  { value: 'off', label: 'OFF' },
  { value: 'rest', label: 'RESTAURANT' }
];

type Props = {
  label?: string;
  value: SectorModule;
  onChange: (value: SectorModule) => void;
};

export const ModuleToggle = memo(function ModuleToggle({ label, value, onChange }: Props)
{
  return (
    <View style={styles.wrap}>
      {label ?
        <Text style={[textSharp, styles.label]}>{label}</Text> : null}
      <View style={styles.row}>
        {OPTIONS.map((opt) =>
        {
          const active = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={[styles.segment, active && styles.segmentActive]}
              onPress={() => onChange(opt.value)}
            >
              <Text style={[textSharp, styles.segmentText, active && styles.segmentTextActive]} numberOfLines={1}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

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
    gap: theme.space.xs,
    padding: ms(4),
    borderRadius: theme.radius.sm,
    backgroundColor: theme.color.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.color.border
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.space.sm,
    borderRadius: theme.radius.sm
  },
  segmentActive: {
    backgroundColor: theme.color.brand
  },
  segmentText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.color.textSecondary
  },
  segmentTextActive: {
    color: theme.color.textOnPrimary
  }
});
