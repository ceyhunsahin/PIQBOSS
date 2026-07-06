import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useBootstrap } from '@/lib/bootstrap';
import { getDatePreset, normalizeRange, type DatePresetId, type DateRange } from '@/lib/dateRange';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import { useTDash } from '@/lib/i18n';
import { useRestTab } from '@/lib/restTabStore';
import { usePrefs } from '@/lib/preferences';
import { theme } from '@/lib/theme';
import { BarChartList } from '@/features/boss-pos/components/BarChartList';
import { ChartChips } from '@/features/boss-pos/components/ChartChips';
import { ColumnChart } from '@/features/boss-pos/components/ColumnChart';
import { DashboardDetailSheet } from '@/features/boss-pos/components/DashboardDetailSheet';
import { DateRangePicker } from '@/features/boss-pos/components/DateRangePicker';
import { MetricRow } from '@/features/boss-pos/components/MetricRow';
import { ModernKpiCard } from '@/features/boss-pos/components/ModernKpiCard';
import { SectionBlock } from '@/features/boss-pos/components/SectionBlock';
import { ShareBar } from '@/features/boss-pos/components/ShareBar';
import { REST_OVERVIEW_KPIS } from '@/features/boss-rest/config/kpiDefinitions';
import { RestTabBar } from '@/features/boss-rest/components/RestTabBar';
import { useRestDashboard } from '@/features/boss-rest/hooks/useRestDashboard';
import { useRestDetail } from '@/features/boss-rest/hooks/useRestDetail';
import { useRestLists } from '@/features/boss-rest/hooks/useRestLists';

export default function RestDashboard()
{
  const { t } = useTranslation();
  const tDash = useTDash();
  const tab = useRestTab((s) => s.tab);
  const setTab = useRestTab((s) => s.setTab);
  const scrollRef = useRef<ScrollView>(null);
  const serverUrl = useBootstrap((s) => s.serverUrl);
  const defaultPreset = usePrefs((s) => s.defaultPreset);
  const prefsHydrated = usePrefs((s) => s.hydrated);
  const [preset, setPreset] = useState<DatePresetId>('today');
  const [range, setRange] = useState<DateRange>(() => getDatePreset('today'));
  const [chartId, setChartId] = useState('trend');
  const [reloadToken, setReloadToken] = useState(0);
  const appliedDefaultRef = useRef(false);
  const dash = useRestDashboard(range);
  const listsState = useRestLists(range, tab, reloadToken);
  const detail = useRestDetail(range);
  const dr = (key: string): string => t(`dashboardRest.${key}`);
  const onTabPress = useCallback((id: typeof tab) =>
  {
    setTab(id);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [setTab]);
  const applyRange = useCallback((next: DateRange, nextPreset: DatePresetId) =>
  {
    setRange(normalizeRange(next));
    setPreset(nextPreset);
  }, []);
  const reload = useCallback(() =>
  {
    listsState.invalidate();
    setReloadToken((v) => v + 1);
    void dash.reload();
  }, [dash, listsState]);
  useEffect(() =>
  {
    if(prefsHydrated && !appliedDefaultRef.current)
    {
      appliedDefaultRef.current = true;
      setPreset(defaultPreset);
      setRange(getDatePreset(defaultPreset));
    }
  }, [prefsHydrated, defaultPreset]);
  if(dash.error && dash.loadedCount === 0)
  {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>{tDash('noData')}</Text>
        <Text style={styles.errorBody}>{dash.error.message}</Text>
        <Button label={t('btnUpdate')} onPress={reload} />
      </View>
    );
  }
  const overview = listsState.lists.overview;
  const charts = listsState.lists.charts;
  const operations = listsState.lists.operations;
  // Ust global gosterge sadece kritik fazi yansitir (KPI'lar veya ilk liste verisi gelene kadar).
  // Agir listeler gelirken her bolumun kendi pending spinner'i var; ust spinner takili kalmaz.
  const anyListLoaded = !!(overview || charts || operations);
  const headerBusy = dash.pending || (listsState.pending && !anyListLoaded);
  const kpiHandlers: Partial<Record<string, () => void>> = {
    orderCount: () => void detail.openOrders(),
    waitingOrders: () => void detail.openWaiting(),
    completedOrders: () => void detail.openCompleted(),
    unprintedOrders: () => void detail.openUnprinted(),
    occupancyRate: () => void detail.openTables(),
    avgOrder: () => void detail.openAvgOrders(dash.data.avgOrder)
  };
  return (
    <>
      <View style={styles.screen}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={false} onRefresh={reload} tintColor={theme.color.primary} />}
        >
          <DateRangePicker
            range={range}
            preset={preset}
            busy={headerBusy}
            onApply={applyRange}
            onRefresh={reload}
          />
          <ProgressBar
            visible={headerBusy}
            progress={dash.pending && dash.totalCount > 0 ? dash.loadedCount / dash.totalCount : 0.9}
          />
          {tab === 'overview' ?
            (
              <>
                <View style={styles.kpiList}>
                  {REST_OVERVIEW_KPIS.map((def, i) =>
                  {
                    const formatFn = def.format === 'currency' ?
                      formatCurrency :
                      (def.format === 'percent' ?
                        formatPercent :
                        (def.format === 'minutes' ?
                          (n: number) => `${formatNumber(n)} min` :
                          formatNumber));
                    const onPress = kpiHandlers[def.key];
                    return (
                      <ModernKpiCard
                        key={`${def.key}-${i}`}
                        row
                        index={i}
                        label={dr(def.labelKey)}
                        value={formatFn(dash.data[def.key])}
                        icon={def.icon}
                        accent={def.accent}
                        pending={dash.pending}
                        animateValue={dash.data[def.key]}
                        formatValue={formatFn}
                        onPress={onPress}
                        tappable={!!onPress}
                      />
                    );
                  })}
                </View>
                <SectionBlock card title={dr('topSellingItems')} count={overview?.topItems.length ?? 0} pending={listsState.pending && !overview} accent={theme.color.accent}>
                  <BarChartList
                    rank
                    colors={theme.gradient.gold}
                    emptyText={tDash('noData')}
                    items={(overview?.topItems ?? []).map((r) => ({
                      label: r.name,
                      value: r.amount,
                      display: formatCurrency(r.amount),
                      sub: `${formatNumber(r.qty)} ${dr('quantity')}`
                    }))}
                  />
                </SectionBlock>
                <SectionBlock card title={dr('zoneSales')} count={overview?.zoneSales.length ?? 0} pending={listsState.pending && !overview} accent={theme.color.success} defaultExpanded={false}>
                  <BarChartList
                    rank
                    colors={theme.gradient.emerald}
                    emptyText={tDash('noData')}
                    items={(overview?.zoneSales ?? []).map((r) => ({
                      label: r.name,
                      value: r.total,
                      display: formatCurrency(r.total),
                      sub: `${formatNumber(r.orderCount)} ${dr('orders')}`
                    }))}
                  />
                </SectionBlock>
              </>
            ) : null}
          {tab === 'charts' ?
            (
              <>
                <ChartChips
                  active={chartId}
                  onChange={setChartId}
                  items={[
                    { id: 'trend', label: dr('orderTrend30Days') },
                    { id: 'hourly', label: dr('hourlyOrderDistribution') },
                    { id: 'payments', label: tDash('paymentTypesTitle') },
                    { id: 'topItems', label: dr('topSellingItems') },
                    { id: 'productGroups', label: dr('productGroups') }
                  ]}
                />
                {chartId === 'trend' ?
                  (
                    <SectionBlock title={dr('orderTrend30Days')} count={charts?.trend.length ?? 0} pending={listsState.pending && !charts}>
                      <ColumnChart
                        items={(charts?.trend ?? []).map((r) => ({ label: r.date.slice(5), value: r.total, display: formatCurrency(r.total) }))}
                        colors={theme.gradient.royal}
                        emptyText={tDash('noData')}
                      />
                    </SectionBlock>
                  ) : null}
                {chartId === 'hourly' ?
                  (
                    <SectionBlock title={dr('hourlyOrderDistribution')} count={charts?.hourly.length ?? 0} pending={listsState.pending && !charts} accent={theme.color.chart3}>
                      <ColumnChart
                        items={(charts?.hourly ?? []).map((r) => ({ label: r.hour, value: r.total, display: formatCurrency(r.total) }))}
                        colors={theme.gradient.emerald}
                        emptyText={tDash('noData')}
                      />
                    </SectionBlock>
                  ) : null}
                {chartId === 'payments' ?
                  (
                    <SectionBlock title={tDash('paymentTypesTitle')} count={charts?.payments.length ?? 0} pending={listsState.pending && !charts} accent={theme.color.chart2}>
                      <ShareBar
                        items={(charts?.payments ?? []).map((r) => ({ label: r.name, value: r.amount, display: formatCurrency(r.amount) }))}
                        emptyText={tDash('noData')}
                      />
                    </SectionBlock>
                  ) : null}
                {chartId === 'topItems' ?
                  (
                    <SectionBlock title={dr('topSellingItems')} count={charts?.topItems.length ?? 0} pending={listsState.pending && !charts} accent={theme.color.accent}>
                      <BarChartList
                        rank
                        colors={theme.gradient.gold}
                        emptyText={tDash('noData')}
                        items={(charts?.topItems ?? []).map((r) => ({ label: r.name, value: r.amount, display: formatCurrency(r.amount) }))}
                      />
                    </SectionBlock>
                  ) : null}
                {chartId === 'productGroups' ?
                  (
                    <SectionBlock card title={dr('productGroups')} count={charts?.productGroups.length ?? 0} pending={listsState.pending && !charts} accent={theme.color.chart4}>
                      {charts && charts.productGroups.length === 0 ?
                        <Text style={styles.empty}>{tDash('noData')}</Text> : null}
                      {(charts?.productGroups ?? []).map((row, index) =>
                      (
                        <MetricRow
                          key={`${row.code}-${index}`}
                          label={row.name}
                          value={formatCurrency(row.total)}
                          sub={`${formatNumber(row.qty)} ${dr('quantity')} · ${formatNumber(row.itemCount)} ${tDash('items')}`}
                          last={index === (charts?.productGroups.length ?? 0) - 1}
                          onPress={() => void detail.openProductGroup(row.name)}
                        />
                      ))}
                    </SectionBlock>
                  ) : null}
              </>
            ) : null}
          {tab === 'operations' ?
            (
              <>
                <SectionBlock card title={dr('waiterPerformance')} count={operations?.waiters.length ?? 0} pending={listsState.pending && !operations} accent={theme.color.primary}>
                  {operations && operations.waiters.length === 0 ?
                    <Text style={styles.empty}>{tDash('noData')}</Text> : null}
                  {(operations?.waiters ?? []).map((row, index) =>
                  (
                    <MetricRow
                      key={`${row.name}-${index}`}
                      label={row.name || dr('waiter')}
                      value={formatCurrency(row.total)}
                      sub={`${formatNumber(row.orderCount)} ${dr('orders')} · ${dr('avgOrder')}: ${formatCurrency(row.avg)}`}
                      last={index === (operations?.waiters.length ?? 0) - 1}
                      onPress={() => void detail.openWaiter(row.name)}
                    />
                  ))}
                </SectionBlock>
                <SectionBlock card title={dr('zoneSales')} count={operations?.zones.length ?? 0} pending={listsState.pending && !operations} accent={theme.color.success} defaultExpanded={false}>
                  {operations && operations.zones.length === 0 ?
                    <Text style={styles.empty}>{tDash('noData')}</Text> : null}
                  {(operations?.zones ?? []).map((row, index) =>
                  (
                    <MetricRow
                      key={`${row.name}-${index}`}
                      label={row.name || dr('zone')}
                      value={formatCurrency(row.total)}
                      sub={`${formatNumber(row.orderCount)} ${dr('orders')}`}
                      last={index === (operations?.zones.length ?? 0) - 1}
                      onPress={() => void detail.openZone(row.name)}
                    />
                  ))}
                </SectionBlock>
                <SectionBlock card title={dr('popularProperties')} count={operations?.properties.length ?? 0} pending={listsState.pending && !operations} accent={theme.color.chart4} defaultExpanded={false}>
                  {operations && operations.properties.length === 0 ?
                    <Text style={styles.empty}>{tDash('noData')}</Text> : null}
                  {(operations?.properties ?? []).map((row, index) =>
                  (
                    <MetricRow
                      key={`${row.name}-${index}`}
                      label={row.name}
                      value={`${formatNumber(row.qty)} ${dr('quantity')}`}
                      sub={`${formatNumber(row.orderCount)} ${dr('orders')}`}
                      last={index === (operations?.properties.length ?? 0) - 1}
                      onPress={() => void detail.openProperty(row.name)}
                    />
                  ))}
                </SectionBlock>
                <SectionBlock card title={dr('tables')} count={operations?.tables.length ?? 0} pending={listsState.pending && !operations} accent={theme.color.chart5} defaultExpanded={false}>
                  {operations && operations.tables.length === 0 ?
                    <Text style={styles.empty}>{tDash('noData')}</Text> : null}
                  {(operations?.tables ?? []).map((row, index) =>
                  (
                    <MetricRow
                      key={`${row.code}-${index}`}
                      label={row.name || row.code}
                      value={row.occupied ? dr('completed') : '—'}
                      sub={`${formatNumber(row.orderCount)} ${dr('orders')}`}
                      accent={row.occupied ? theme.color.success : theme.color.textMuted}
                      last={index === (operations?.tables.length ?? 0) - 1}
                    />
                  ))}
                </SectionBlock>
              </>
            ) : null}
        </ScrollView>
        <RestTabBar active={tab} onChange={onTabPress} />
      </View>
      <DashboardDetailSheet
        visible={detail.visible}
        loading={detail.loading}
        content={detail.content}
        onClose={detail.close}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.bg },
  scroll: { flex: 1 },
  content: { paddingBottom: theme.space.xl },
  kpiList: {
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.sm
  },
  empty: {
    padding: theme.space.lg,
    fontSize: theme.fontSize.body,
    color: theme.color.textMuted
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.space.xl,
    backgroundColor: theme.color.bg
  },
  errorTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.color.text,
    marginBottom: theme.space.sm
  },
  errorBody: {
    fontSize: theme.fontSize.body,
    color: theme.color.textSecondary,
    textAlign: 'center',
    marginBottom: theme.space.lg
  }
});
