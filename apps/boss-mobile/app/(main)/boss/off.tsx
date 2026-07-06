import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useBootstrap } from '@/lib/bootstrap';
import { getDatePreset, normalizeRange, type DatePresetId, type DateRange } from '@/lib/dateRange';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import { useTDash } from '@/lib/i18n';
import { useOffTab } from '@/lib/offTabStore';
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
import { OFF_OVERVIEW_KPIS, OFF_TAB_KPIS, type OffKpiDef } from '@/features/boss-off/config/kpiDefinitions';
import { CustomerSearchSheet } from '@/features/boss-off/components/CustomerSearchSheet';
import { OffTabBar } from '@/features/boss-off/components/OffTabBar';
import { useOffDashboard } from '@/features/boss-off/hooks/useOffDashboard';
import { useOffDetail } from '@/features/boss-off/hooks/useOffDetail';
import { useOffLists } from '@/features/boss-off/hooks/useOffLists';
import type { OffConvRow, OffDocRow } from '@/features/boss-off/fetchOffLists';

export default function OffDashboard()
{
  const { t } = useTranslation();
  const tDash = useTDash();
  const tab = useOffTab((s) => s.tab);
  const setTab = useOffTab((s) => s.setTab);
  const scrollRef = useRef<ScrollView>(null);
  const serverUrl = useBootstrap((s) => s.serverUrl);
  const defaultPreset = usePrefs((s) => s.defaultPreset);
  const prefsHydrated = usePrefs((s) => s.hydrated);
  const [preset, setPreset] = useState<DatePresetId>('today');
  const [range, setRange] = useState<DateRange>(() => getDatePreset('today'));
  const [chartId, setChartId] = useState('invoiceTrend');
  const [customerSearchVisible, setCustomerSearchVisible] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const appliedDefaultRef = useRef(false);
  const dash = useOffDashboard(range);
  const listsState = useOffLists(range, tab, reloadToken);
  const detail = useOffDetail(range);
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
  const dl = (key: string): string => t(`dashboardOff.${key}`);
  const convLabel = (type: number): string =>
  {
    if(type === 20)
    {
      return dl('invoice');
    }
    if(type === 40)
    {
      return dl('shipment');
    }
    if(type === 61)
    {
      return dl('offer');
    }
    return dl('order');
  };
  const renderKpis = (defs: OffKpiDef[], handlers?: Partial<Record<string, () => void>>) => (
    <View style={styles.kpiList}>
      {defs.map((def, i) =>
      {
        const formatFn = def.format === 'currency' ? formatCurrency : (def.format === 'percent' ? formatPercent : formatNumber);
        const onPress = handlers?.[def.key];
        return (
          <ModernKpiCard
            key={`${def.key}-${i}`}
            row
            index={i}
            label={dl(def.labelKey)}
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
  );
  const overviewKpiHandlers: Partial<Record<string, () => void>> = {
    encaissement: () => void detail.openEncaissement(),
    openSalesRemaining: () => void detail.openOpenSalesInvoices(),
    incompleteOrdersQty: () => void detail.openIncompleteOrders(),
    openPurchaseRemaining: () => void detail.openOpenPurchaseInvoices()
  };
  const renderDocSection = (title: string, accent: string, rows: OffDocRow[] | undefined, emptyKey: string, docType: number) => (
    <SectionBlock card title={title} count={rows?.length ?? 0} pending={listsState.pending && !rows} accent={accent} defaultExpanded={false}>
      {rows && rows.length === 0 ?
        <Text style={styles.empty}>{dl(emptyKey)}</Text> : null}
      {(rows ?? []).map((row, index) =>
      (
        <MetricRow
          key={`${row.guid}-${index}`}
          label={row.customer || row.ref}
          value={formatCurrency(row.total)}
          sub={`${row.ref} · ${row.date}`}
          last={index === (rows?.length ?? 0) - 1}
          onPress={() => void detail.openDocLines(docType, row.guid, row.ref, row.customer, row.code)}
        />
      ))}
    </SectionBlock>
  );
  const renderConvSection = (title: string, accent: string, rows: OffConvRow[] | undefined, emptyKey: string, docType: number) => (
    <SectionBlock card title={title} count={rows?.length ?? 0} pending={listsState.pending && !rows} accent={accent} defaultExpanded={false}>
      {rows && rows.length === 0 ?
        <Text style={styles.empty}>{dl(emptyKey)}</Text> : null}
      {(rows ?? []).map((row, index) =>
      (
        <MetricRow
          key={`${row.ref}-${index}`}
          label={row.customer || row.ref}
          value={formatCurrency(row.total)}
          sub={`${row.ref} · ${row.date} → ${row.convertedRef} (${convLabel(row.convertedType)})`}
          accent={accent}
          last={index === (rows?.length ?? 0) - 1}
          onPress={() => void detail.openDocLines(docType, row.guid, row.ref, row.customer, '')}
        />
      ))}
    </SectionBlock>
  );
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
  const tabKpis = OFF_TAB_KPIS[tab];
  const orders = listsState.lists.orders;
  const shipments = listsState.lists.shipments;
  const customers = listsState.lists.customers;
  const margin = listsState.lists.margin;
  const charts = listsState.lists.charts;
  // Ust global gosterge sadece kritik fazi yansitir (KPI'lar veya ilk liste verisi gelene kadar).
  // Agir listeler gelmeye devam ederken her bolumun kendi pending spinner'i var; ust spinner takili kalmaz.
  const anyListLoaded = !!(orders || shipments || customers || margin || charts);
  const headerBusy = dash.pending || (listsState.pending && !anyListLoaded);
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
          {tab === 'overview' ? renderKpis(OFF_OVERVIEW_KPIS, overviewKpiHandlers) : null}
          {tabKpis ? renderKpis(tabKpis) : null}
          {tab === 'orders' ?
            (
              <>
                {renderDocSection(dl('pendingOrders'), '#007bff', orders?.pendingOrders, 'noPendingOrdersFound', 60)}
                {renderConvSection(dl('convertedOrders'), '#28a745', orders?.ordersConverted, 'noConvertedOrdersFound', 60)}
                {renderDocSection(dl('pendingOffers'), '#6f42c1', orders?.pendingOffers, 'noPendingOffersFound', 61)}
                {renderConvSection(dl('convertedOffers'), '#17a2b8', orders?.offersConverted, 'noConvertedOffersFound', 61)}
              </>
            ) : null}
          {tab === 'shipments' ?
            (
              <>
                {renderDocSection(dl('pendingShipments'), '#fd7e14', shipments?.pendingShipments, 'noPendingShipmentsFound', 40)}
                {renderConvSection(dl('convertedShipments'), '#28a745', shipments?.shipmentsConverted, 'noConvertedShipmentsFound', 40)}
              </>
            ) : null}
          {tab === 'customers' ?
            (
              <>
                <Pressable style={styles.searchTrigger} onPress={() => setCustomerSearchVisible(true)}>
                  <Ionicons name="search" size={18} color={theme.color.textMuted} />
                  <Text style={styles.searchTriggerText}>{dl('customerSearch')}</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.color.textMuted} />
                </Pressable>
                <SectionBlock card title={dl('debts')} count={customers?.debtCustomers.length ?? 0} pending={listsState.pending && !customers} accent={theme.color.danger}>
                  {customers && customers.debtCustomers.length === 0 ?
                    <Text style={styles.empty}>{dl('noDebtCustomersFound')}</Text> : null}
                  {(customers?.debtCustomers ?? []).map((row, index) =>
                  (
                    <MetricRow
                      key={`${row.code}-${index}`}
                      label={row.name || row.code}
                      value={formatCurrency(row.balance)}
                      sub={`${dl('debt')}: ${formatCurrency(row.debt)} · ${dl('totalCollection')}: ${formatCurrency(row.paid)}`}
                      accent={row.balance > 0 ? theme.color.danger : theme.color.success}
                      last={index === (customers?.debtCustomers.length ?? 0) - 1}
                      onPress={() => void detail.openCustomerExtre(row.code, row.name)}
                    />
                  ))}
                </SectionBlock>
                <SectionBlock card title={dl('topCustomersSalesTitle')} count={customers?.salesCustomers.length ?? 0} pending={listsState.pending && !customers} accent={theme.color.success} defaultExpanded={false}>
                  {customers && customers.salesCustomers.length === 0 ?
                    <Text style={styles.empty}>{dl('noSalesDataFound')}</Text> : null}
                  {(customers?.salesCustomers ?? []).map((row, index) =>
                  (
                    <MetricRow
                      key={`${row.code}-${index}`}
                      label={row.name || row.code}
                      value={formatCurrency(row.total)}
                      sub={`${dl('invoice')}: ${formatNumber(row.count)}`}
                      last={index === (customers?.salesCustomers.length ?? 0) - 1}
                      onPress={() => void detail.openCustomerExtre(row.code, row.name)}
                    />
                  ))}
                </SectionBlock>
                <SectionBlock card title={dl('totalCollection')} count={customers?.paymentCustomers.length ?? 0} pending={listsState.pending && !customers} accent={theme.color.chart2} defaultExpanded={false}>
                  {customers && customers.paymentCustomers.length === 0 ?
                    <Text style={styles.empty}>{dl('noPaymentDataFound')}</Text> : null}
                  {(customers?.paymentCustomers ?? []).map((row, index) =>
                  (
                    <MetricRow
                      key={`${row.name}-${index}`}
                      label={row.name}
                      value={formatCurrency(row.total)}
                      sub={`${row.payType} · ${formatNumber(row.count)}`}
                      last={index === (customers?.paymentCustomers.length ?? 0) - 1}
                    />
                  ))}
                </SectionBlock>
              </>
            ) : null}
          {tab === 'margin' ?
            (
              <>
                <SectionBlock card title={dl('marginCards')} count={margin?.marginGroups.length ?? 0} pending={listsState.pending && !margin} accent={theme.color.success}>
                  {margin && margin.marginGroups.length === 0 ?
                    <Text style={styles.empty}>{dl('noMarginDataFound')}</Text> : null}
                  {(margin?.marginGroups ?? []).map((row, index) =>
                  (
                    <MetricRow
                      key={`${row.name}-${index}`}
                      label={row.name}
                      value={formatCurrency(row.marginHt)}
                      sub={`${dl('marginPercent')}: ${formatPercent(row.marginPct)} · ${dl('sales')}: ${formatCurrency(row.totalHt)}`}
                      accent={row.marginHt < 0 ? theme.color.danger : theme.color.success}
                      last={index === (margin?.marginGroups.length ?? 0) - 1}
                      onPress={() => void detail.openMarginGroup(row.name)}
                    />
                  ))}
                </SectionBlock>
                <SectionBlock title={dl('allLossItems')} count={margin?.lossItems.length ?? 0} pending={listsState.pending && !margin} accent={theme.color.danger} defaultExpanded={false}>
                  {margin && margin.lossItems.length === 0 ?
                    <Text style={styles.empty}>{dl('noLossItems')}</Text> : null}
                  {(margin?.lossItems ?? []).map((row, index) =>
                  (
                    <MetricRow
                      key={`${row.code}-${index}`}
                      label={row.name}
                      value={formatCurrency(row.marginHt)}
                      sub={`${row.group} · ${row.code}`}
                      accent={theme.color.danger}
                      last={index === (margin?.lossItems.length ?? 0) - 1}
                    />
                  ))}
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
                    { id: 'invoiceTrend', label: dl('invoiceTrend') },
                    { id: 'marginTrend', label: dl('marginTrend') },
                    { id: 'topGroups', label: dl('topSellingGroups') },
                    { id: 'topProducts', label: dl('topSellingProducts') },
                    { id: 'paymentTypes', label: dl('paymentTypesTitle') }
                  ]}
                />
                {chartId === 'invoiceTrend' ?
                  (
                    <SectionBlock title={dl('invoiceTrend')} count={charts?.invoiceTrend.length ?? 0} pending={listsState.pending && !charts}>
                      <ColumnChart
                        items={(charts?.invoiceTrend ?? []).map((r) => ({ label: r.date.slice(5), value: r.value, display: formatCurrency(r.value) }))}
                        colors={theme.gradient.royal}
                        emptyText={tDash('noData')}
                      />
                    </SectionBlock>
                  ) : null}
                {chartId === 'marginTrend' ?
                  (
                    <SectionBlock title={dl('marginTrend')} count={charts?.marginTrend.length ?? 0} pending={listsState.pending && !charts} accent={theme.color.success}>
                      <ColumnChart
                        items={(charts?.marginTrend ?? []).map((r) => ({ label: r.date.slice(5), value: r.value, display: formatCurrency(r.value) }))}
                        colors={theme.gradient.emerald}
                        emptyText={tDash('noData')}
                      />
                    </SectionBlock>
                  ) : null}
                {chartId === 'topGroups' ?
                  (
                    <SectionBlock title={dl('topSellingGroups')} count={charts?.topGroups.length ?? 0} pending={listsState.pending && !charts} accent={theme.color.accent}>
                      <BarChartList
                        rank
                        colors={theme.gradient.gold}
                        emptyText={tDash('noData')}
                        items={(charts?.topGroups ?? []).map((r) => ({ label: r.name, value: r.total, display: formatCurrency(r.total) }))}
                      />
                    </SectionBlock>
                  ) : null}
                {chartId === 'topProducts' ?
                  (
                    <SectionBlock title={dl('topSellingProducts')} count={charts?.topProducts.length ?? 0} pending={listsState.pending && !charts}>
                      <BarChartList
                        rank
                        colors={theme.gradient.royal}
                        emptyText={tDash('noData')}
                        items={(charts?.topProducts ?? []).map((r) => ({
                          label: r.name,
                          value: r.total,
                          display: formatCurrency(r.total),
                          sub: `${r.group} · ${formatNumber(r.qty)}`
                        }))}
                      />
                    </SectionBlock>
                  ) : null}
                {chartId === 'paymentTypes' ?
                  (
                    <SectionBlock title={dl('paymentTypesTitle')} count={charts?.paymentTypes.length ?? 0} pending={listsState.pending && !charts} accent={theme.color.chart2}>
                      <ShareBar
                        items={(charts?.paymentTypes ?? []).map((r) => ({ label: r.name, value: r.total, display: formatCurrency(r.total) }))}
                        emptyText={tDash('noData')}
                      />
                    </SectionBlock>
                  ) : null}
              </>
            ) : null}
        </ScrollView>
        <OffTabBar active={tab} onChange={onTabPress} />
      </View>
      <DashboardDetailSheet
        visible={detail.visible}
        loading={detail.loading}
        content={detail.content}
        onClose={detail.close}
        onExportPdf={() => void detail.exportPdf()}
        onShareWhatsApp={() => void detail.shareWhatsApp()}
      />
      <CustomerSearchSheet
        visible={customerSearchVisible}
        serverUrl={serverUrl}
        onClose={() => setCustomerSearchVisible(false)}
        onSelect={(item) =>
        {
          setCustomerSearchVisible(false);
          void detail.openCustomerExtre(item.code, item.name);
        }}
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
  searchTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    marginHorizontal: theme.space.lg,
    marginTop: theme.space.sm,
    marginBottom: theme.space.xs,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.md,
    backgroundColor: theme.color.surfaceMuted,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border
  },
  searchTriggerText: {
    flex: 1,
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
