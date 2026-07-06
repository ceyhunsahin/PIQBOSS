import {
  QueryIds,
  type ButcherRow,
  type ComparisonResult,
  type DevicePaymentRow,
  type LossItemRow,
  type MarginGroupRow,
  type MonthlyGroupRow,
  type PaymentTypeRow,
  type PromoMargin,
  type SalesTrendRow,
  type TopGroupRow,
  type TopProductRow,
  type VatRateRow
} from '@piqboss/shared';
import { emptyLabel } from '@/lib/uiText';
import type { DateRange } from '@/lib/dateRange';
import { mapPool } from '@/lib/concurrency';
import { sqlSafe } from '@/lib/sql';
import { fetchHourlySales, type HourlySalesRow } from './detail/fetchExtraDashboard';

type Row = Record<string, unknown>;

function num(v: unknown): number
{
  if(v == null || v === '')
  {
    return 0;
  }
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function rangeValues(range: DateRange): string[]
{
  return [range.from, range.to];
}

export async function loadSalesTrend(serverUrl: string, range: DateRange): Promise<SalesTrendRow[]>
{
  const rows = await sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_SALESTREND,
    param: [],
    value: rangeValues(range)
  });
  return rows.map((r) => ({
    date: String(r.date ?? ''),
    amount: num(r.totalSales)
  }));
}

export async function loadTopGroups(serverUrl: string, range: DateRange, limit = 10): Promise<TopGroupRow[]>
{
  const rows = await sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_TOPSELLINGPRODUCTGROUPS,
    param: [],
    value: rangeValues(range)
  });
  return rows.slice(0, limit).map((r) => ({
    name: String(r.GROUP_NAME ?? r.ITEM_GRP_NAME ?? emptyLabel()),
    amount: num(r.TOTAL_AMOUNT)
  }));
}

export async function loadTopProducts(serverUrl: string, range: DateRange, limit = 15): Promise<TopProductRow[]>
{
  const rows = await sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_TOPSELLINGPRODUCTS,
    param: [],
    value: rangeValues(range)
  });
  return rows.slice(0, limit).map((r) => ({
    name: String(r.ITEM_NAME ?? emptyLabel()),
    groupName: String(r.ITEM_GRP_NAME ?? ''),
    qty: num(r.TOTAL_QUANTITY),
    amount: num(r.TOTAL_AMOUNT)
  }));
}

export async function loadPaymentByType(serverUrl: string, range: DateRange): Promise<PaymentTypeRow[]>
{
  const rows = await sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_PAYMENTBYTYPE,
    param: [],
    value: rangeValues(range)
  });
  return rows.map((r) => ({
    name: String(r.PAY_TYPE_NAME ?? emptyLabel()),
    quantity: num(r.QUANTITY)
  }));
}

export async function loadDevicePayment(serverUrl: string, range: DateRange): Promise<DevicePaymentRow[]>
{
  const rows = await sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_DEVICEPAYMENT,
    param: [],
    value: rangeValues(range)
  });
  return rows.map((r) => ({
    device: String(r.device ?? r.DEVICE ?? emptyLabel()),
    amount: num(r.total ?? r.TOTAL)
  }));
}

export async function loadVatByRate(serverUrl: string, range: DateRange): Promise<VatRateRow[]>
{
  const rows = await sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_VATBYRATE,
    param: [],
    value: rangeValues(range)
  });
  return rows.map((r) => ({
    rate: num(r.VAT_RATE),
    vat: num(r.VAT),
    amount: num(r.AMOUNT),
    total: num(r.TOTAL)
  }));
}

export async function loadMarginByGroup(serverUrl: string, range: DateRange): Promise<MarginGroupRow[]>
{
  const rows = await sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_MARGINSTATSBYGROUP,
    param: [],
    value: rangeValues(range)
  });
  return rows.map((r) => ({
    name: String(r.ITEM_GRP_NAME ?? emptyLabel()),
    sales: num(r.TOTAL_HT),
    margin: num(r.MARGIN_HT),
    marginRate: num(r.MARGIN_PERCENT),
    cost: num(r.TOTAL_COST_HT),
    qty: num(r.TOTAL_QUANTITY)
  }));
}

export async function loadPromoMargin(serverUrl: string, range: DateRange): Promise<PromoMargin | null>
{
  const rows = await sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_PROMOMARGINSTATS,
    param: [],
    value: rangeValues(range)
  });
  const r = rows[0];
  if(!r)
  {
    return null;
  }
  return {
    sales: num(r.TOTAL_HT),
    margin: num(r.MARGIN_HT),
    marginRate: num(r.MARGIN_PERCENT),
    cost: num(r.TOTAL_COST_HT),
    qty: num(r.TOTAL_QUANTITY)
  };
}

export async function loadMonthlyGroups(serverUrl: string, year: number, month: number): Promise<MonthlyGroupRow[]>
{
  const rows = await sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_MONTHLYITEMGROUPS,
    param: [],
    value: [String(year), String(month)]
  });
  return rows.map((r) => ({
    code: String(r.ITEM_GRP_CODE ?? ''),
    name: String(r.GROUP_NAME ?? r.ITEM_GRP_NAME ?? emptyLabel()),
    amount: num(r.TOTAL_AMOUNT),
    qty: num(r.TOTAL_QUANTITY),
    itemCount: num(r.ITEM_COUNT)
  }));
}

export async function loadButcherList(serverUrl: string, range: DateRange): Promise<ButcherRow[]>
{
  const rows = await sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_BUTCHERLIST,
    param: [],
    value: rangeValues(range)
  });
  return rows.map((r) => ({
    name: String(r.WEIGHER_NAME ?? emptyLabel()),
    weigher: String(r.WEIGHER ?? ''),
    unchecked: num(r.UNCHECKED_COUNT),
    amount: num(r.TOTAL_AMOUNT),
    discount: num(r.TOTAL_DISCOUNT),
    deleted: num(r.DELETED_COUNT),
    changeCount: num(r.CHANGE_COUNT)
  }));
}

export type OpenTicketRow = {
  id: string;
  guid: string;
  date: string;
  total: number;
  device: string;
  customer: string;
  desc: string;
  status: number;
};

export async function loadOpenTickets(serverUrl: string, limit = 100): Promise<OpenTicketRow[]>
{
  const rows = await sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_OPENTICKETS,
    param: [],
    value: []
  });
  return rows.slice(0, limit).map((r) => ({
    id: String(r.TICKET_ID ?? r.REF_NO ?? '').trim(),
    guid: String(r.GUID ?? ''),
    date: String(r.TICKET_DATE ?? r.DOC_DATE ?? '').slice(0, 16),
    total: num(r.TOTAL),
    device: String(r.DEVICE ?? ''),
    customer: String(r.CUSTOMER_NAME ?? '').trim(),
    desc: String(r.PARK_DESC ?? '').trim(),
    status: num(r.STATUS)
  }));
}

export async function loadGlobalLossItems(serverUrl: string, range: DateRange, limit = 20): Promise<LossItemRow[]>
{
  const rows = await sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_GLOBALLOSSITEMS,
    param: [],
    value: rangeValues(range)
  });
  return rows.slice(0, limit).map((r) => ({
    code: String(r.ITEM_CODE ?? ''),
    name: String(r.ITEM_NAME ?? emptyLabel()),
    margin: num(r.MARGIN_HT),
    marginRate: num(r.MARGIN_PERCENT),
    sales: num(r.TOTAL_HT)
  }));
}

async function loadRangeTotals(serverUrl: string, range: DateRange): Promise<{ total: number; count: number; avg: number }>
{
  const [totalRows, countRows, avgRows] = await Promise.all([
    sqlSafe<Row>(serverUrl, { queryId: QueryIds.BOSS_POS_DAILYSALESTOTAL, param: [], value: rangeValues(range) }),
    sqlSafe<Row>(serverUrl, { queryId: QueryIds.BOSS_POS_DAILYSALESCOUNT, param: [], value: rangeValues(range) }),
    sqlSafe<Row>(serverUrl, { queryId: QueryIds.BOSS_POS_SALESAVG, param: [], value: rangeValues(range) })
  ]);
  return {
    total: num(totalRows[0]?.DAILY_SALES_TOTAL),
    count: num(countRows[0]?.DAILY_SALES_COUNT),
    avg: num(avgRows[0]?.AVGTOTAL)
  };
}

export async function loadComparison(
  serverUrl: string,
  rangeA: DateRange,
  rangeB: DateRange
): Promise<ComparisonResult>
{
  const [sideA, sideB] = await Promise.all([
    loadRangeTotals(serverUrl, rangeA),
    loadRangeTotals(serverUrl, rangeB)
  ]);
  return { rangeA, rangeB, sideA, sideB };
}

export type { HourlySalesRow };

export async function loadHourlySales(serverUrl: string, range: DateRange): Promise<HourlySalesRow[]>
{
  try
  {
    return await fetchHourlySales(serverUrl, range);
  }
  catch
  {
    return [];
  }
}

export type PosListsBundle = {
  trend: SalesTrendRow[];
  groups: TopGroupRow[];
  products: TopProductRow[];
  payments: PaymentTypeRow[];
  devices: DevicePaymentRow[];
  vat: VatRateRow[];
  margins: MarginGroupRow[];
  promo: PromoMargin | null;
  butchers: ButcherRow[];
  lossItems: LossItemRow[];
  openTickets: OpenTicketRow[];
};

export async function loadPosLists(serverUrl: string, range: DateRange): Promise<PosListsBundle>
{
  const loaders: (() => Promise<unknown>)[] = [
    () => loadSalesTrend(serverUrl, range),
    () => loadTopGroups(serverUrl, range),
    () => loadTopProducts(serverUrl, range),
    () => loadPaymentByType(serverUrl, range),
    () => loadDevicePayment(serverUrl, range),
    () => loadVatByRate(serverUrl, range),
    () => loadMarginByGroup(serverUrl, range),
    () => loadPromoMargin(serverUrl, range),
    () => loadButcherList(serverUrl, range),
    () => loadGlobalLossItems(serverUrl, range),
    () => loadOpenTickets(serverUrl)
  ];
  const results: unknown[] = new Array(loaders.length).fill(undefined);
  await mapPool(loaders, 3, async (loader, index) =>
  {
    try
    {
      results[index] = await loader();
    }
    catch
    {
      results[index] = undefined;
    }
  });
  return {
    trend: (results[0] as SalesTrendRow[] | undefined) ?? [],
    groups: (results[1] as TopGroupRow[] | undefined) ?? [],
    products: (results[2] as TopProductRow[] | undefined) ?? [],
    payments: (results[3] as PaymentTypeRow[] | undefined) ?? [],
    devices: (results[4] as DevicePaymentRow[] | undefined) ?? [],
    vat: (results[5] as VatRateRow[] | undefined) ?? [],
    margins: (results[6] as MarginGroupRow[] | undefined) ?? [],
    promo: (results[7] as PromoMargin | null | undefined) ?? null,
    butchers: (results[8] as ButcherRow[] | undefined) ?? [],
    lossItems: (results[9] as LossItemRow[] | undefined) ?? [],
    openTickets: (results[10] as OpenTicketRow[] | undefined) ?? []
  };
}
