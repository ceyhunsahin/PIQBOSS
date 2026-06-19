import { ScrollView, View, Text, StyleSheet } from 'react-native';
import type { PosDashboardSnapshot } from '@piqboss/shared';
import type { ParamRow } from '@piqboss/shared';
import { formatCurrency, formatNumber } from '@/lib/format';
import { useTDash } from '@/lib/i18n';
import { theme } from '@/lib/theme';
import { kpisForTab, type KpiDef } from '../config/kpiDefinitions';
import { isKpiVisible } from '../lib/kpiVisibility';
import type { PosTabId } from '../hooks/usePosDashboard';
import { ModernKpiCard, KPI_CARD_H_STRIDE } from './ModernKpiCard';

type Props = {
  tab: PosTabId;
  data: PosDashboardSnapshot;
  paramRows: ParamRow[];
  pending?: boolean;
  horizontal?: boolean;
  rows?: boolean;
  exclude?: string[];
  t: (key: string) => string;
  onKpiPress?: (def: KpiDef) => void;
  onComparePress?: (def: KpiDef) => void;
  onLeftBadgePress?: (def: KpiDef) => void;
  onInfoPress?: (def: KpiDef) => void;
};

function kpiLabel(def: KpiDef, t: (key: string) => string, dash: (key: string) => string): string
{
  if(def.labelScope === 'root')
  {
    return t(def.labelKey);
  }
  return dash(def.labelKey);
}

function formatValue(def: KpiDef, value: number): string
{
  return def.format === 'currency' ? formatCurrency(value) : formatNumber(value);
}

function cardValue(def: KpiDef, data: PosDashboardSnapshot): { value: string; suffix?: string; infoBadge?: boolean }
{
  if(def.composite === 'allItemGroups')
  {
    const total = (data.allItemGroups || 0) + (data.unsoldItemGroups || 0);
    return {
      value: formatNumber(total),
      suffix: `/ ${formatNumber(data.unsoldItemGroups)}`,
      infoBadge: true
    };
  }
  if(def.composite === 'balanceCreated')
  {
    return {
      value: formatNumber(data.balanceTicketCreated),
      suffix: `/ -${formatNumber(data.balanceTicketUnchecked)}`
    };
  }
  if(def.composite === 'balanceUnchecked')
  {
    return {
      value: formatNumber(data.balanceTicketSupprime),
      suffix: `/ ${formatNumber(data.balanceTicketNonTraite)}`
    };
  }
  return { value: formatValue(def, data[def.key]) };
}

export function KpiGrid({ tab, data, paramRows, pending, horizontal, rows, exclude, t, onKpiPress, onComparePress, onLeftBadgePress, onInfoPress }: Props)
{
  const dash = useTDash();
  const defs = kpisForTab(tab)
    .filter((d) => isKpiVisible(paramRows, d.prmId))
    .filter((d) => !exclude?.includes(d.key));
  if(defs.length === 0)
  {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{dash('noData')}</Text>
      </View>
    );
  }
  const cards = defs.map((def, i) =>
  {
    const display = cardValue(def, data);
    const tappable = !!def.detail && !!onKpiPress;
    const animateValue = def.composite ? undefined : data[def.key];
    const formatFn = def.format === 'currency' ? formatCurrency : formatNumber;
    return (
      <ModernKpiCard
        key={def.key}
        index={i}
        horizontal={horizontal}
        row={rows}
        label={kpiLabel(def, t, dash)}
        value={display.value}
        suffix={display.suffix}
        icon={def.icon}
        accent={def.accent}
        wide={def.wide}
        pending={pending}
        tappable={tappable}
        compare={def.compare}
        leftBadge={def.leftBadge === 'posDevices' ? '💵' : undefined}
        infoBadge={display.infoBadge}
        animateValue={animateValue}
        formatValue={formatFn}
        onPress={tappable && onKpiPress ? () => onKpiPress(def) : undefined}
        onComparePress={def.compare && onComparePress ? () => onComparePress(def) : undefined}
        onLeftBadgePress={def.leftBadge && onLeftBadgePress ? () => onLeftBadgePress(def) : undefined}
        onInfoPress={def.infoAction && onInfoPress ? () => onInfoPress(def) : undefined}
      />
    );
  });
  if(rows)
  {
    return (
      <View style={styles.rowsWrap}>
        {cards}
      </View>
    );
  }
  if(horizontal)
  {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rowH}
        snapToInterval={KPI_CARD_H_STRIDE}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
      >
        {cards}
      </ScrollView>
    );
  }
  return (
    <View style={styles.grid}>
      {cards}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.space.lg
  },
  rowH: {
    flexDirection: 'row',
    gap: theme.space.sm,
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.xs
  },
  rowsWrap: {
    paddingHorizontal: theme.space.lg
  },
  empty: {
    padding: theme.space.xl,
    alignItems: 'center'
  },
  emptyText: {
    color: theme.color.textMuted,
    fontSize: theme.fontSize.sm
  }
});

export { kpiLabel };
