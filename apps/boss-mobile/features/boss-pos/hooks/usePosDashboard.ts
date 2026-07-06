import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ButcherRow,
  ComparisonResult,
  DevicePaymentRow,
  LossItemRow,
  MarginGroupRow,
  MonthlyGroupRow,
  PaymentTypeRow,
  PosDashboardSnapshot,
  PromoMargin,
  SalesTrendRow,
  TopGroupRow,
  TopProductRow,
  VatRateRow
} from '@piqboss/shared';
import { useAuth } from '@/lib/auth';
import { useBootstrap } from '@/lib/bootstrap';
import type { DateRange } from '@/lib/dateRange';
import { loadPosDashboardKpis } from '../fetchPosDashboard';
import { loadComparison, loadHourlySales, loadMonthlyGroups, loadPosLists } from '../fetchPosLists';
import type { HourlySalesRow, OpenTicketRow } from '../fetchPosLists';
import { POS_DASHBOARD_QUERIES } from '../queries';

export type PosTabId = 'overview' | 'sales' | 'charts' | 'operations' | 'margin' | 'comparison';
export type ChartDatasetId = 'trend' | 'payments' | 'devices' | 'groups' | 'products' | 'vat' | 'monthly' | 'hourly';

const EMPTY: PosDashboardSnapshot = {
  dailySalesTotal: 0,
  dailySalesCount: 0,
  salesAvg: 0,
  dailyRebateTicket: 0,
  dailyRebateTotal: 0,
  dailyCustomerTicket: 0,
  dailyUseLoyalty: 0,
  useDiscount: 0,
  useDiscountTicket: 0,
  dailyPriceChange: 0,
  dailyRowDelete: 0,
  dailyFullDelete: 0,
  purchaseTotal: 0,
  purchasePrice: 0,
  salePrice: 0,
  purchasePriceDown: 0,
  purchasePriceUp: 0,
  salePriceDown: 0,
  salePriceUp: 0,
  balanceTicketCreated: 0,
  balanceTicketUnchecked: 0,
  balanceTicketNonTraite: 0,
  balanceTicketSupprime: 0,
  balanceTicketConfirme: 0,
  allItemGroups: 0,
  unsoldItemGroups: 0,
  totalItemGroups: 0
};

type LoadGroup = 'kpis' | 'lists' | 'monthly' | 'hourly';

/** Hangi tab hangi veri grubunu ister — sadece girilen tab'in sorgusu cekilir. */
function groupsForTab(tab: PosTabId): LoadGroup[]
{
  if(tab === 'charts')
  {
    return ['lists', 'monthly', 'hourly'];
  }
  if(tab === 'margin')
  {
    return ['lists'];
  }
  if(tab === 'comparison')
  {
    return [];
  }
  if(tab === 'overview')
  {
    return ['kpis', 'lists'];
  }
  return ['kpis'];
}

export function usePosDashboard(range: DateRange, tab: PosTabId)
{
  const authStatus = useAuth((s) => s.status);
  const serverUrl = useBootstrap((s) => s.serverUrl);
  const [data, setData] = useState<PosDashboardSnapshot>(EMPTY);
  const [trend, setTrend] = useState<SalesTrendRow[]>([]);
  const [groups, setGroups] = useState<TopGroupRow[]>([]);
  const [products, setProducts] = useState<TopProductRow[]>([]);
  const [payments, setPayments] = useState<PaymentTypeRow[]>([]);
  const [devices, setDevices] = useState<DevicePaymentRow[]>([]);
  const [vat, setVat] = useState<VatRateRow[]>([]);
  const [margins, setMargins] = useState<MarginGroupRow[]>([]);
  const [promo, setPromo] = useState<PromoMargin | null>(null);
  const [butchers, setButchers] = useState<ButcherRow[]>([]);
  const [lossItems, setLossItems] = useState<LossItemRow[]>([]);
  const [openTickets, setOpenTickets] = useState<OpenTicketRow[]>([]);
  const [monthlyGroups, setMonthlyGroups] = useState<MonthlyGroupRow[]>([]);
  const [monthlyPending, setMonthlyPending] = useState(false);
  const [hourly, setHourly] = useState<HourlySalesRow[]>([]);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [kpiPending, setKpiPending] = useState(() => groupsForTab(tab).includes('kpis'));
  const [listPending, setListPending] = useState(false);
  const [comparePending, setComparePending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const monthlyAbortRef = useRef<AbortController | null>(null);
  const monthSelRef = useRef<{ year: number; month: number }>({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  const tabRef = useRef(tab);
  tabRef.current = tab;
  const loadedRef = useRef<{ key: string; kpis: boolean; lists: boolean; monthly: boolean; hourly: boolean }>(
    { key: '', kpis: false, lists: false, monthly: false, hourly: false }
  );
  const patch = useCallback((partial: Partial<PosDashboardSnapshot>) =>
  {
    setData((prev) => ({ ...prev, ...partial }));
    setLoadedCount((c) => c + 1);
  }, []);
  const loadMonthly = useCallback(async (year: number, month: number) =>
  {
    if(!serverUrl)
    {
      return;
    }
    // Ay gercekten degistiyse onceki ayin verisini hemen temizle; yoksa yeni veri gelene
    // kadar (~birkac sn) eski ay verisi yeni baslikla durur.
    const prev = monthSelRef.current;
    const monthChanged = prev.year !== year || prev.month !== month;
    monthSelRef.current = { year, month };
    monthlyAbortRef.current?.abort();
    const ac = new AbortController();
    monthlyAbortRef.current = ac;
    if(monthChanged)
    {
      setMonthlyGroups([]);
    }
    setMonthlyPending(true);
    try
    {
      const rows = await loadMonthlyGroups(serverUrl, year, month);
      if(!ac.signal.aborted)
      {
        setMonthlyGroups(rows);
      }
    }
    catch
    {
      if(!ac.signal.aborted)
      {
        setMonthlyGroups([]);
      }
    }
    finally
    {
      if(!ac.signal.aborted)
      {
        setMonthlyPending(false);
      }
    }
  }, [serverUrl]);
  const runLoad = useCallback(async (force: boolean) =>
  {
    if(authStatus !== 'authed' || !serverUrl || !range.from || !range.to)
    {
      return;
    }
    const key = `${serverUrl}|${range.from}|${range.to}`;
    if(force || loadedRef.current.key !== key)
    {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      loadedRef.current = { key, kpis: false, lists: false, monthly: false, hourly: false };
      setData(EMPTY);
      setTrend([]);
      setGroups([]);
      setProducts([]);
      setPayments([]);
      setDevices([]);
      setVat([]);
      setMargins([]);
      setPromo(null);
      setButchers([]);
      setLossItems([]);
      setOpenTickets([]);
      setMonthlyGroups([]);
      setHourly([]);
      setLoadedCount(0);
      setError(null);
    }
    if(!abortRef.current)
    {
      abortRef.current = new AbortController();
    }
    const signal = abortRef.current.signal;
    const need = groupsForTab(tabRef.current).filter((g) => !loadedRef.current[g]);
    if(need.length === 0)
    {
      return;
    }
    need.forEach((g) => { loadedRef.current[g] = true; });
    // Once hafif KPI kumesi (sargable, ~1 dalga) cekilir; agir listeler havuzu (max 10) mesgul
    // etmeden KPI kartlari aninda dolar. Listeler KPI bittikten sonra baslar (algilanan hiz artar).
    if(need.includes('kpis'))
    {
      setKpiPending(true);
      setLoadedCount(0);
      try
      {
        await loadPosDashboardKpis(serverUrl, range, patch, signal);
      }
      catch(e)
      {
        if(!signal.aborted)
        {
          setError(e as Error);
        }
      }
      finally
      {
        if(!signal.aborted)
        {
          setKpiPending(false);
        }
      }
    }
    if(signal.aborted)
    {
      return;
    }
    const listGroups = need.filter((g) => g !== 'kpis');
    if(listGroups.length > 0)
    {
      setListPending(true);
      const subtasks: Promise<unknown>[] = [];
      if(listGroups.includes('lists'))
      {
        subtasks.push(loadPosLists(serverUrl, range)
          .then((res) =>
          {
            if(signal.aborted)
            {
              return;
            }
            setTrend(res.trend);
            setGroups(res.groups);
            setProducts(res.products);
            setPayments(res.payments);
            setDevices(res.devices);
            setVat(res.vat);
            setMargins(res.margins);
            setPromo(res.promo);
            setButchers(res.butchers);
            setLossItems(res.lossItems);
            setOpenTickets(res.openTickets);
          })
          .catch((e) =>
          {
            if(!signal.aborted)
            {
              setError(e as Error);
            }
          }));
      }
      if(listGroups.includes('monthly'))
      {
        const sel = monthSelRef.current;
        subtasks.push(loadMonthly(sel.year, sel.month));
      }
      if(listGroups.includes('hourly'))
      {
        subtasks.push(loadHourlySales(serverUrl, range)
          .then((rows) => { if(!signal.aborted) { setHourly(rows); } })
          .catch(() => { if(!signal.aborted) { setHourly([]); } }));
      }
      await Promise.allSettled(subtasks);
      if(!signal.aborted)
      {
        setListPending(false);
      }
    }
  }, [authStatus, serverUrl, range.from, range.to, patch, loadMonthly]);
  const reload = useCallback(async () =>
  {
    await runLoad(true);
  }, [runLoad]);
  const runComparison = useCallback(async (rangeA: DateRange, rangeB: DateRange) =>
  {
    if(!serverUrl || !rangeA.from || !rangeA.to || !rangeB.from || !rangeB.to)
    {
      return;
    }
    setComparePending(true);
    try
    {
      const res = await loadComparison(serverUrl, rangeA, rangeB);
      setComparison(res);
    }
    catch(e)
    {
      setError(e as Error);
    }
    finally
    {
      setComparePending(false);
    }
  }, [serverUrl]);
  useEffect(() =>
  {
    const timer = setTimeout(() =>
    {
      void runLoad(false);
    }, 150);
    return () =>
    {
      clearTimeout(timer);
    };
  }, [runLoad, tab]);
  useEffect(() => () =>
  {
    abortRef.current?.abort();
    monthlyAbortRef.current?.abort();
  }, []);
  // Yukleme gostergesi sadece aktif tab'in ihtiyac duydugu veri icin gecerli olmali;
  // aksi halde KPI cekmeyen tab'larda (margin/charts/comparison) kpiPending takili kalip
  // sayfayi surekli "loading" gosterir.
  const activeGroups = groupsForTab(tab);
  const busy =
    (activeGroups.includes('kpis') && kpiPending) ||
    (activeGroups.some((g) => g !== 'kpis') && listPending) ||
    (tab === 'comparison' && comparePending);
  // Ust global gosterge (donen icon + progress bar) sadece KRITIK fazi yansitmali:
  // overview'da KPI yuklenirken; liste-bazli tab'larda ilk veri gelene kadar. Agir listeler
  // gelmeye devam ederken ust spinner takili kalmamali (her bolumun kendi pending spinner'i var).
  const hasListData =
    trend.length > 0 || groups.length > 0 || products.length > 0 || payments.length > 0 ||
    devices.length > 0 || vat.length > 0 || margins.length > 0 || butchers.length > 0 ||
    lossItems.length > 0 || openTickets.length > 0 || hourly.length > 0 ||
    monthlyGroups.length > 0 || promo != null;
  const headerBusy =
    (activeGroups.includes('kpis') && kpiPending) ||
    (!activeGroups.includes('kpis') && activeGroups.some((g) => g !== 'kpis') && listPending && !hasListData) ||
    (tab === 'comparison' && comparePending);
  return {
    busy,
    headerBusy,
    data,
    trend,
    groups,
    products,
    payments,
    devices,
    vat,
    margins,
    promo,
    butchers,
    lossItems,
    openTickets,
    monthlyGroups,
    monthlyPending,
    loadMonthly,
    hourly,
    comparison,
    kpiPending,
    listPending,
    comparePending,
    loadedCount,
    totalCount: POS_DASHBOARD_QUERIES.length,
    error,
    reload,
    runComparison
  };
}
