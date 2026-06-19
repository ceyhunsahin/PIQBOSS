import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ChartDatasetId } from '../hooks/usePosDashboard';
import { useSnapOffsets } from '../hooks/useSnapOffsets';
import { useTDash } from '@/lib/i18n';
import { theme } from '@/lib/theme';

type Props = {
  active: ChartDatasetId;
  onChange: (id: ChartDatasetId) => void;
};

const DATASETS: { id: ChartDatasetId; labelKey: string; scope?: 'root' | 'dashboard' }[] = [
  { id: 'monthly', labelKey: 'monthlyGroupAnalysis', scope: 'dashboard' },
  { id: 'hourly', labelKey: 'hourlyDistribution', scope: 'dashboard' },
  { id: 'trend', labelKey: 'salesTrends', scope: 'root' },
  { id: 'payments', labelKey: 'paymentTypes', scope: 'root' },
  { id: 'products', labelKey: 'topSellingProducts', scope: 'dashboard' },
  { id: 'groups', labelKey: 'topSellingGroups', scope: 'dashboard' },
  { id: 'devices', labelKey: 'devicePaymentDistribution', scope: 'dashboard' },
  { id: 'vat', labelKey: 'salesTotalVatBreakdown', scope: 'dashboard' }
];

function datasetLabel(item: (typeof DATASETS)[number], t: (key: string) => string, dash: (key: string) => string): string
{
  if(item.scope === 'dashboard')
  {
    return dash(item.labelKey);
  }
  return t(item.labelKey);
}

export const ChartDatasetBar = memo(function ChartDatasetBar({ active, onChange }: Props)
{
  const { t } = useTranslation();
  const dash = useTDash();
  const { offsets, onItemLayout } = useSnapOffsets(DATASETS.length);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.wrap}
      snapToOffsets={offsets.length ? offsets : undefined}
      decelerationRate="fast"
      disableIntervalMomentum
    >
      {DATASETS.map((d, i) =>
      {
        const isActive = d.id === active;
        return (
          <Pressable key={d.id} onLayout={onItemLayout(i)} style={[styles.chip, isActive && styles.chipActive]} onPress={() => onChange(d.id)}>
            <Text style={[styles.text, isActive && styles.textActive]}>{datasetLabel(d, t, dash)}</Text>
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
