import { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComparisonResult } from '@piqboss/shared';
import { Button } from '@/components/ui/Button';
import { DateRangePicker } from '@/features/boss-pos/components/DateRangePicker';
import type { DatePresetId, DateRange } from '@/lib/dateRange';
import { getDatePreset, normalizeRange } from '@/lib/dateRange';
import { formatCurrency, formatNumber } from '@/lib/format';
import { useTDash } from '@/lib/i18n';
import { ms } from '@/lib/responsive';
import { theme } from '@/lib/theme';

type Props = {
  result: ComparisonResult | null;
  pending?: boolean;
  onCompare: (rangeA: DateRange, rangeB: DateRange) => void;
};

function deltaPercent(a: number, b: number): string
{
  if(b === 0)
  {
    return a === 0 ? '0%' : '+100%';
  }
  const d = ((a - b) / b) * 100;
  return `${d >= 0 ? '+' : ''}${d.toFixed(1)}%`;
}

export function ComparePanel({ result, pending, onCompare }: Props)
{
  const dash = useTDash();
  const [presetA, setPresetA] = useState<DatePresetId>('thisMonth');
  const [rangeA, setRangeA] = useState<DateRange>(() => getDatePreset('thisMonth'));
  const [presetB, setPresetB] = useState<DatePresetId>('lastMonth');
  const [rangeB, setRangeB] = useState<DateRange>(() => getDatePreset('lastMonth'));
  const deltas = useMemo(() =>
  {
    if(!result)
    {
      return null;
    }
    return {
      total: deltaPercent(result.sideA.total, result.sideB.total),
      count: deltaPercent(result.sideA.count, result.sideB.count),
      avg: deltaPercent(result.sideA.avg, result.sideB.avg)
    };
  }, [result]);
  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{dash('comparison')}</Text>
        <Text style={styles.heroSub}>{dash('dateComparison')}</Text>
      </View>
      <View style={styles.block}>
        <Text style={styles.blockTitle}>{dash('firstDate')}</Text>
        <DateRangePicker
          range={rangeA}
          preset={presetA}
          busy={pending}
          onApply={(r, p) => { setRangeA(normalizeRange(r)); setPresetA(p); }}
          onRefresh={() => onCompare(rangeA, rangeB)}
        />
      </View>
      <View style={styles.block}>
        <Text style={styles.blockTitle}>{dash('secondDate')}</Text>
        <DateRangePicker
          range={rangeB}
          preset={presetB}
          busy={pending}
          onApply={(r, p) => { setRangeB(normalizeRange(r)); setPresetB(p); }}
          onRefresh={() => onCompare(rangeA, rangeB)}
        />
      </View>
      <View style={styles.actions}>
        <Button label={dash('compareNow')} loading={pending} onPress={() => onCompare(rangeA, rangeB)} />
      </View>
      {result && deltas ?
        (
          <View style={styles.result}>
            <CompareCard
              title={dash('dailySalesTotal')}
              a={formatCurrency(result.sideA.total)}
              b={formatCurrency(result.sideB.total)}
              delta={deltas.total}
              sideA={dash('firstDate')}
              sideB={dash('secondDate')}
            />
            <CompareCard
              title={dash('ticketCount')}
              a={formatNumber(result.sideA.count)}
              b={formatNumber(result.sideB.count)}
              delta={deltas.count}
              sideA={dash('firstDate')}
              sideB={dash('secondDate')}
            />
            <CompareCard
              title={dash('avgBasket')}
              a={formatCurrency(result.sideA.avg)}
              b={formatCurrency(result.sideB.avg)}
              delta={deltas.avg}
              sideA={dash('firstDate')}
              sideB={dash('secondDate')}
            />
          </View>
        ) : null}
    </View>
  );
}

function CompareCard({ title, a, b, delta, sideA, sideB }: { title: string; a: string; b: string; delta: string; sideA: string; sideB: string })
{
  const up = delta.startsWith('+') && delta !== '+0.0%';
  const down = delta.startsWith('-');
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.cardRow}>
        <View style={styles.side}>
          <Text style={styles.sideLabel}>{sideA}</Text>
          <Text style={styles.sideValue}>{a}</Text>
        </View>
        <View style={styles.side}>
          <Text style={styles.sideLabel}>{sideB}</Text>
          <Text style={styles.sideValue}>{b}</Text>
        </View>
        <View style={styles.deltaWrap}>
          <Ionicons
            name={up ? 'arrow-up' : down ? 'arrow-down' : 'remove'}
            size={ms(14)}
            color={up ? theme.color.success : down ? theme.color.danger : theme.color.textMuted}
          />
          <Text style={[styles.delta, up && styles.deltaUp, down && styles.deltaDown]}>{delta}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: theme.space.xl
  },
  hero: {
    marginHorizontal: theme.space.lg,
    marginBottom: theme.space.md,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    padding: theme.space.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
    ...theme.shadow.soft
  },
  heroTitle: {
    color: theme.color.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '800'
  },
  heroSub: {
    color: theme.color.textMuted,
    fontSize: theme.fontSize.sm,
    marginTop: theme.space.xs
  },
  block: {
    marginBottom: theme.space.sm
  },
  blockTitle: {
    marginHorizontal: theme.space.lg,
    marginBottom: theme.space.xs,
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    color: theme.color.textSecondary
  },
  actions: {
    paddingHorizontal: theme.space.lg,
    marginBottom: theme.space.lg
  },
  result: {
    gap: theme.space.md,
    paddingHorizontal: theme.space.lg
  },
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
    ...theme.shadow.soft
  },
  cardTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    color: theme.color.text,
    marginBottom: theme.space.md
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.space.md
  },
  side: {
    flex: 1
  },
  sideLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted,
    fontWeight: '700'
  },
  sideValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.color.primary,
    marginTop: 2
  },
  deltaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.xs
  },
  delta: {
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    color: theme.color.textSecondary
  },
  deltaUp: {
    color: theme.color.success
  },
  deltaDown: {
    color: theme.color.danger
  }
});
