import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { useBootstrap } from '@/lib/bootstrap';
import { formatRangeLabel, getDatePreset, normalizeRange, type DatePresetId, type DateRange } from '@/lib/dateRange';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import { useTDash } from '@/lib/i18n';
import { theme } from '@/lib/theme';
import { BarChartList } from '@/features/boss-pos/components/BarChartList';
import { ColumnChart } from '@/features/boss-pos/components/ColumnChart';
import { ShareBar } from '@/features/boss-pos/components/ShareBar';
import { ChartDatasetBar } from '@/features/boss-pos/components/ChartDatasetBar';
import { ComparePanel } from '@/features/boss-pos/components/ComparePanel';
import { DashboardDetailSheet } from '@/features/boss-pos/components/DashboardDetailSheet';
import { DateRangePicker } from '@/features/boss-pos/components/DateRangePicker';
import { HeroSummaryCard } from '@/features/boss-pos/components/HeroSummaryCard';
import { ItemSearchSheet } from '@/features/boss-pos/components/ItemSearchSheet';
import { MarginGroupCard, MARGIN_CARD_STRIDE } from '@/features/boss-pos/components/MarginGroupCard';
import { MarginToolsSection } from '@/features/boss-pos/components/MarginToolsSection';
import { KpiGrid, kpiLabel } from '@/features/boss-pos/components/KpiGrid';
import { MetricRow } from '@/features/boss-pos/components/MetricRow';
import { PosTabBar } from '@/features/boss-pos/components/PosTabBar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { usePosTab } from '@/lib/posTabStore';
import { usePrefs } from '@/lib/preferences';
import { PromoMarginCard } from '@/features/boss-pos/components/PromoMarginCard';
import { QuickInsightsSheet } from '@/features/boss-pos/components/QuickInsightsSheet';
import { SectionBlock } from '@/features/boss-pos/components/SectionBlock';
import { KPI_DEFINITIONS, type KpiDef } from '@/features/boss-pos/config/kpiDefinitions';
import { useDashboardDetail } from '@/features/boss-pos/hooks/useDashboardDetail';
import { usePosDashboard, type ChartDatasetId } from '@/features/boss-pos/hooks/usePosDashboard';

export default function PosDashboard()
{
  const { t, i18n } = useTranslation();
  const tDash = useTDash();
  const tab = usePosTab((s) => s.tab);
  const setTab = usePosTab((s) => s.setTab);
  const scrollRef = useRef<ScrollView>(null);
  const onTabPress = useCallback((id: typeof tab) =>
  {
    setTab(id);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [setTab]);
  const paramRows = useAuth((s) => s.paramRows);
  const serverUrl = useBootstrap((s) => s.serverUrl);
  const defaultPreset = usePrefs((s) => s.defaultPreset);
  const prefsHydrated = usePrefs((s) => s.hydrated);
  const [preset, setPreset] = useState<DatePresetId>('today');
  const [range, setRange] = useState<DateRange>(() => getDatePreset('today'));
  const [chartDataset, setChartDataset] = useState<ChartDatasetId>('trend');
  const [searchVisible, setSearchVisible] = useState(false);
  const [quickVisible, setQuickVisible] = useState(false);
  const reopenSearchRef = useRef(false);
  const appliedDefaultRef = useRef(false);
  const [monthSel, setMonthSel] = useState(() => ({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 }));
  const dash = usePosDashboard(range, tab);
  const detail = useDashboardDetail(serverUrl, range, dash.data, {
    payments: dash.payments,
    vat: dash.vat,
    devices: dash.devices,
    trend: dash.trend,
    groups: dash.groups,
    products: dash.products,
    butchers: dash.butchers,
    lossItems: dash.lossItems,
    margins: dash.margins,
    promo: dash.promo
  });
  const busy = dash.busy;
  const applyRange = (next: DateRange, nextPreset: DatePresetId) =>
  {
    setRange(normalizeRange(next));
    setPreset(nextPreset);
  };
  useEffect(() =>
  {
    if(prefsHydrated && !appliedDefaultRef.current)
    {
      appliedDefaultRef.current = true;
      setPreset(defaultPreset);
      setRange(getDatePreset(defaultPreset));
    }
  }, [prefsHydrated, defaultPreset]);
  const changeMonth = useCallback((delta: number) =>
  {
    setMonthSel((prev) =>
    {
      const d = new Date(prev.year, prev.month - 1 + delta, 1);
      const next = { year: d.getFullYear(), month: d.getMonth() + 1 };
      void dash.loadMonthly(next.year, next.month);
      return next;
    });
  }, [dash]);
  const monthLabel = useMemo(() =>
  {
    try
    {
      return new Date(monthSel.year, monthSel.month - 1, 1)
        .toLocaleDateString(i18n.language || 'fr', { month: 'long', year: 'numeric' });
    }
    catch
    {
      return `${monthSel.month}/${monthSel.year}`;
    }
  }, [monthSel, i18n.language]);
  const onKpiPress = useCallback((def: KpiDef) =>
  {
    if(def.detail === 'popUncheckedUsers')
    {
      void detail.openUncheckedHub(kpiLabel(def, t, tDash));
      return;
    }
    if(def.detail)
    {
      void detail.openKpiDetail(def, kpiLabel(def, t, tDash));
    }
  }, [detail, t, tDash]);
  const onComparePress = useCallback((def: KpiDef) =>
  {
    void detail.openKpiCompare(def);
  }, [detail]);
  const onInfoPress = useCallback((def: KpiDef) =>
  {
    void detail.openInfoDetail(def, tDash('unsoldItemGroups'));
  }, [detail, tDash]);
  const onLeftBadgePress = useCallback((def: KpiDef) =>
  {
    void detail.openLeftBadge(def);
  }, [detail]);
  const salesTotalDef = useMemo(() => KPI_DEFINITIONS.find((d) => d.key === 'dailySalesTotal'), []);
  const onHeroCashStatus = useCallback(() =>
  {
    if(salesTotalDef)
    {
      void detail.openLeftBadge(salesTotalDef);
    }
  }, [detail, salesTotalDef]);
  const onHeroDetail = useCallback(() =>
  {
    if(salesTotalDef)
    {
      void detail.openKpiDetail(salesTotalDef, kpiLabel(salesTotalDef, t, tDash));
    }
  }, [detail, salesTotalDef, t, tDash]);
  if(dash.error && dash.loadedCount === 0 && dash.trend.length === 0)
  {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>{tDash('noData')}</Text>
        <Text style={styles.errorBody}>{dash.error.message}</Text>
        <Text style={styles.errorHint}>{t('loadingData')}</Text>
        <Button label={t('btnUpdate')} onPress={dash.reload} />
      </View>
    );
  }
  return (
    <>
      <View style={styles.screen}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={busy} onRefresh={dash.reload} tintColor={theme.color.primary} />}
        >
          <DateRangePicker
            range={range}
            preset={preset}
            busy={busy}
            onApply={applyRange}
            onRefresh={dash.reload}
          />
          <ProgressBar
            visible={busy}
            progress={dash.kpiPending && dash.totalCount > 0 ? dash.loadedCount / dash.totalCount : (dash.listPending ? 0.9 : 1)}
          />
          <Pressable
            style={({ pressed }) => [styles.quickBtn, pressed && styles.quickBtnPressed]}
            onPress={() => setQuickVisible(true)}
          >
            <Ionicons name="flash" size={18} color={theme.color.textOnPrimary} />
            <Text style={styles.quickBtnText}>{tDash('quickPanelTitle')}</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.color.textOnPrimary} />
          </Pressable>
        {tab === 'overview' ?
          (
            <>
              <HeroSummaryCard
                total={dash.data.dailySalesTotal}
                count={dash.data.dailySalesCount}
                avg={dash.data.salesAvg}
                rangeLabel={formatRangeLabel(range)}
                pending={dash.kpiPending}
                onCashStatus={onHeroCashStatus}
                onDetail={onHeroDetail}
              />
              <KpiGrid
                tab="overview"
                rows
                exclude={['dailySalesTotal', 'dailySalesCount', 'salesAvg']}
                data={dash.data}
                paramRows={paramRows}
                pending={dash.kpiPending}
                t={t}
                onKpiPress={onKpiPress}
                onComparePress={onComparePress}
                onLeftBadgePress={onLeftBadgePress}
              />
              <SectionBlock card title={tDash('openTickets')} count={dash.openTickets.length} pending={dash.listPending && dash.openTickets.length === 0} accent={theme.color.warning} defaultExpanded={false}>
                {dash.openTickets.length === 0 && !dash.listPending ?
                  <Text style={styles.empty}>{tDash('noOpenTickets')}</Text> : null}
                {dash.openTickets.map((row, index) =>
                (
                  <MetricRow
                    key={`${row.guid}-${index}`}
                    label={row.customer || `#${row.id}`}
                    value={formatCurrency(row.total)}
                    sub={[row.date, row.device, row.desc].filter(Boolean).join(' · ')}
                    last={index === dash.openTickets.length - 1}
                  />
                ))}
              </SectionBlock>
              <SectionBlock card title={tDash('topSellingGroups')} count={dash.groups.length} pending={dash.listPending && dash.groups.length === 0} accent={theme.color.accent} defaultExpanded={false}>
                <BarChartList
                  rank
                  colors={theme.gradient.gold}
                  emptyText={tDash('noData')}
                  items={dash.groups.map((r) => ({ label: r.name, value: r.amount, display: formatCurrency(r.amount) }))}
                />
              </SectionBlock>
              <SectionBlock title={tDash('lossItemsPopupTitle')} count={dash.lossItems.length} pending={dash.listPending && dash.lossItems.length === 0} accent={theme.color.danger}>
                <MetricRow
                  label={tDash('allLossItems')}
                  value=""
                  onPress={() => void detail.openAllLossItems()}
                />
                {dash.lossItems.length === 0 && !dash.listPending ?
                  <Text style={styles.empty}>{tDash('noData')}</Text> : null}
                {dash.lossItems.map((row, index) =>
                (
                  <MetricRow
                    key={`${row.code}-${index}`}
                    label={row.name}
                    value={formatCurrency(row.margin)}
                    sub={row.code}
                    last={index === dash.lossItems.length - 1}
                    onPress={() => void detail.openDiscountDetail(row.code, row.name)}
                  />
                ))}
              </SectionBlock>
              <MarginToolsSection
                serverUrl={serverUrl}
                range={range}
                groupNames={dash.margins.map((x) => x.name)}
                rangeLabel={formatRangeLabel(range)}
                onSearch={() => setSearchVisible(true)}
                onLowMarginSold={(threshold, groupName) => void detail.openLowMargin(false, threshold, groupName)}
                onLowMarginUnsold={(groupName) => void detail.openLowMargin(true, 15, groupName)}
                onZeroCost={() => void detail.openZeroCostItems()}
                onRedTag={() => void detail.openRedTagItems()}
              />
            </>
          ) : null}
        {tab === 'sales' ?
          (
            <KpiGrid
              tab="sales"
              rows
              data={dash.data}
              paramRows={paramRows}
              pending={dash.kpiPending}
              t={t}
              onKpiPress={onKpiPress}
              onInfoPress={onInfoPress}
            />
          ) : null}
        {tab === 'operations' ?
          (
            <KpiGrid
              tab="operations"
              rows
              data={dash.data}
              paramRows={paramRows}
              pending={dash.kpiPending}
              t={t}
              onKpiPress={onKpiPress}
            />
          ) : null}
        {tab === 'charts' ?
          (
            <>
              <ChartDatasetBar active={chartDataset} onChange={setChartDataset} />
              {chartDataset === 'trend' ?
                (
                  <SectionBlock title={tDash('salesTrendsTitle')} count={dash.trend.length} pending={dash.listPending}>
                    <ColumnChart
                      items={dash.trend.map((r) => ({ label: r.date.slice(5), value: r.amount, display: formatCurrency(r.amount) }))}
                      colors={theme.gradient.royal}
                      emptyText={tDash('noData')}
                    />
                  </SectionBlock>
                ) : null}
              {chartDataset === 'payments' ?
                (
                  <SectionBlock title={tDash('paymentTypesTitle')} count={dash.payments.length} pending={dash.listPending} accent={theme.color.success}>
                    <ShareBar
                      items={dash.payments.map((r) => ({ label: r.name, value: r.quantity, display: formatNumber(r.quantity) }))}
                      emptyText={tDash('noData')}
                    />
                  </SectionBlock>
                ) : null}
              {chartDataset === 'devices' ?
                (
                  <SectionBlock title={tDash('devicePaymentDistribution')} count={dash.devices.length} pending={dash.listPending} accent={theme.color.chart2}>
                    <ShareBar
                      items={dash.devices.map((r) => ({ label: r.device, value: r.amount, display: formatCurrency(r.amount) }))}
                      emptyText={tDash('noData')}
                    />
                  </SectionBlock>
                ) : null}
              {chartDataset === 'groups' ?
                (
                  <SectionBlock title={tDash('topSellingGroups')} count={dash.groups.length} pending={dash.listPending}>
                    <BarChartList
                      rank
                      items={dash.groups.map((r) => ({ label: r.name, value: r.amount, display: formatCurrency(r.amount) }))}
                      colors={theme.gradient.royal}
                      emptyText={tDash('noData')}
                    />
                  </SectionBlock>
                ) : null}
              {chartDataset === 'products' ?
                (
                  <SectionBlock title={tDash('topSellingProducts')} count={dash.products.length} pending={dash.listPending} accent={theme.color.accent}>
                    <BarChartList
                      rank
                      colors={theme.gradient.gold}
                      emptyText={tDash('noData')}
                      items={dash.products.map((r) => ({
                        label: r.name,
                        value: r.amount,
                        display: formatCurrency(r.amount),
                        sub: `${r.groupName} · ${formatNumber(r.qty)} ${tDash('quantity')}`,
                        onPress: detail.openProductList
                      }))}
                    />
                  </SectionBlock>
                ) : null}
              {chartDataset === 'vat' ?
                (
                  <SectionBlock title={tDash('salesTotalVatBreakdown')} count={dash.vat.length} pending={dash.listPending} accent={theme.color.chart4}>
                    <ShareBar
                      items={dash.vat.map((r) => ({ label: `${formatPercent(r.rate)} ${tDash('grdSalesVatRate.vatRate')}`, value: r.total, display: formatCurrency(r.total) }))}
                      emptyText={tDash('noData')}
                    />
                  </SectionBlock>
                ) : null}
              {chartDataset === 'hourly' ?
                (
                  <SectionBlock title={tDash('hourlyDistribution')} count={dash.hourly.length} pending={dash.listPending} accent={theme.color.chart3}>
                    <ColumnChart
                      items={dash.hourly.map((r) => ({ label: r.hour, value: r.amount, display: formatCurrency(r.amount) }))}
                      colors={theme.gradient.emerald}
                      emptyText={tDash('noData')}
                    />
                  </SectionBlock>
                ) : null}
              {chartDataset === 'monthly' ?
                (
                  <SectionBlock title={tDash('monthlyGroupAnalysis')} count={dash.monthlyGroups.length} pending={dash.listPending || dash.monthlyPending} accent={theme.color.success}>
                    <View style={styles.monthNav}>
                      <Pressable style={styles.monthNavBtn} onPress={() => changeMonth(-1)} hitSlop={8}>
                        <Ionicons name="chevron-back" size={18} color={theme.color.primary} />
                      </Pressable>
                      <Text style={styles.monthNavLabel}>{monthLabel}</Text>
                      <Pressable style={styles.monthNavBtn} onPress={() => changeMonth(1)} hitSlop={8}>
                        <Ionicons name="chevron-forward" size={18} color={theme.color.primary} />
                      </Pressable>
                    </View>
                    <BarChartList
                      rank
                      colors={theme.gradient.emerald}
                      emptyText={tDash('noData')}
                      items={dash.monthlyGroups.map((r) => ({ label: r.name, value: r.amount, display: formatCurrency(r.amount) }))}
                    />
                  </SectionBlock>
                ) : null}
            </>
          ) : null}
        {tab === 'margin' ?
          (
            <>
              {dash.promo ?
                <PromoMarginCard promo={dash.promo} onPress={() => void detail.openPromoDetail()} /> : null}
              <SectionBlock title={tDash('marginByProductGroups')} count={dash.margins.length} pending={dash.listPending && dash.margins.length === 0} accent={theme.color.success} plain>
                {dash.margins.length === 0 && !dash.listPending ?
                  <Text style={styles.empty}>{tDash('noData')}</Text> : null}
                {dash.margins.length > 0 ?
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.marginScroll}
                    snapToInterval={MARGIN_CARD_STRIDE}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    disableIntervalMomentum
                  >
                    {dash.margins.slice(0, 30).map((row, index) =>
                    (
                      <MarginGroupCard
                        key={`${row.name}-${index}`}
                        index={index}
                        name={row.name}
                        margin={row.margin}
                        marginRate={row.marginRate}
                        sales={row.sales}
                        subLabel={tDash('totalSales')}
                        onPress={() => void detail.openMarginGroup(row.name)}
                        onLossInfo={() => void detail.openGroupLoss(row.name)}
                        onMarginFilter={() => void detail.openLowMargin(false, 15, row.name)}
                      />
                    ))}
                  </ScrollView> : null}
              </SectionBlock>
            </>
          ) : null}
        {tab === 'comparison' ?
          (
            <ComparePanel
              result={dash.comparison}
              pending={dash.comparePending}
              onCompare={(a, b) => void dash.runComparison(a, b)}
            />
          ) : null}
        </ScrollView>
        <PosTabBar active={tab} onChange={onTabPress} />
      </View>
      <DashboardDetailSheet
        visible={detail.drawer.visible}
        loading={detail.drawer.loading}
        content={detail.drawer.content}
        onClose={() =>
        {
          detail.close();
          if(reopenSearchRef.current)
          {
            reopenSearchRef.current = false;
            setSearchVisible(true);
          }
        }}
        onExportPdf={() => void detail.exportPdf()}
        onShareWhatsApp={() => void detail.shareWhatsApp()}
      />
      <ItemSearchSheet
        visible={searchVisible}
        serverUrl={serverUrl}
        onClose={() => setSearchVisible(false)}
        onSelect={(item) =>
        {
          setSearchVisible(false);
          reopenSearchRef.current = true;
          void detail.openItemDetail(item);
        }}
      />
      <QuickInsightsSheet
        visible={quickVisible}
        serverUrl={serverUrl}
        range={range}
        onClose={() => setQuickVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.bg },
  scroll: { flex: 1 },
  content: { paddingBottom: theme.space.xl },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.space.xl,
    backgroundColor: theme.color.bg
  },
  empty: {
    padding: theme.space.lg,
    fontSize: theme.fontSize.body,
    color: theme.color.textMuted
  },
  marginScroll: {
    paddingRight: theme.space.lg,
    paddingTop: theme.space.sm,
    paddingBottom: theme.space.md
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    marginHorizontal: theme.space.lg,
    marginTop: theme.space.sm,
    marginBottom: theme.space.md,
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.color.primary,
    ...theme.shadow.soft
  },
  quickBtnPressed: {
    opacity: 0.85
  },
  quickBtnText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    color: theme.color.textOnPrimary,
    letterSpacing: 0.3
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.color.border
  },
  monthNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.surfaceMuted
  },
  monthNavLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    color: theme.color.text,
    textTransform: 'capitalize'
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
    marginBottom: theme.space.sm
  },
  errorHint: {
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted,
    textAlign: 'center',
    marginBottom: theme.space.lg
  }
});
