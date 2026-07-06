import { QueryIds } from '@piqboss/shared';
import type { DateRange } from '@/lib/dateRange';
import { sqlSafe } from '@/lib/sql';

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
function str(v: unknown): string
{
  return v == null ? '' : String(v);
}
function dt(v: unknown): string
{
  return str(v).slice(0, 10);
}

export type RestItemRow = { name: string; qty: number; amount: number; orderCount: number };
export type RestWaiterRow = { name: string; orderCount: number; total: number; avg: number };
export type RestZoneRow = { name: string; orderCount: number; total: number };
export type RestPropertyRow = { name: string; orderCount: number; qty: number };
export type RestHourRow = { hour: string; orderCount: number; total: number };
export type RestTrendRow = { date: string; orderCount: number; total: number };
export type RestPaymentRow = { name: string; amount: number };
export type RestTableRow = { code: string; name: string; occupied: boolean; orderCount: number };
export type RestDetailRow = { ref: string; date: string; zone: string; person: string; total: number; item?: string; qty?: number };

export type RestOverviewBundle = {
  topItems: RestItemRow[];
  zoneSales: RestZoneRow[];
};
export type RestGroupRow = { code: string; name: string; total: number; qty: number; itemCount: number };
export type RestGroupItemRow = { code: string; name: string; amount: number; qty: number };
export type RestChartsBundle = {
  trend: RestTrendRow[];
  hourly: RestHourRow[];
  payments: RestPaymentRow[];
  topItems: RestItemRow[];
  productGroups: RestGroupRow[];
};
export type RestOperationsBundle = {
  waiters: RestWaiterRow[];
  zones: RestZoneRow[];
  properties: RestPropertyRow[];
  tables: RestTableRow[];
};

async function rows(serverUrl: string, queryId: string, value: string[]): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, { queryId, param: [], value });
}

function mapItem(r: Row): RestItemRow
{
  return { name: str(r.ITEM_NAME), qty: num(r.TOTAL_QTY), amount: num(r.TOTAL_AMOUNT), orderCount: num(r.ORDER_COUNT) };
}
function mapZone(r: Row): RestZoneRow
{
  return { name: str(r.ZONE_NAME), orderCount: num(r.ORDER_COUNT), total: num(r.TOTAL_SALES) };
}

export async function loadRestOverview(serverUrl: string, range: DateRange): Promise<RestOverviewBundle>
{
  const v = [range.from, range.to];
  const [topItems, zoneSales] = await Promise.all([
    rows(serverUrl, QueryIds.BOSS_REST_TOPSELLINGITEMS, v).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_REST_ZONESALES, v).catch(() => [])
  ]);
  return { topItems: topItems.map(mapItem), zoneSales: zoneSales.map(mapZone) };
}

export async function loadRestCharts(serverUrl: string, range: DateRange): Promise<RestChartsBundle>
{
  const v = [range.from, range.to];
  const [trend, hourly, payments, topItems, groups] = await Promise.all([
    rows(serverUrl, QueryIds.BOSS_REST_ORDERTREND30DAYS, []).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_REST_HOURLYORDERS, v).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_REST_PAYMENTBYTYPE, v).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_REST_TOPSELLINGITEMS, v).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_REST_PRODUCTGROUPS, v).catch(() => [])
  ]);
  return {
    trend: trend.map((r) => ({ date: dt(r.DATE), orderCount: num(r.ORDER_COUNT), total: num(r.TOTAL_SALES) })),
    hourly: hourly.map((r) => ({ hour: `${str(r.HOUR).padStart(2, '0')}h`, orderCount: num(r.ORDER_COUNT), total: num(r.TOTAL_SALES) })),
    payments: payments.map((r) => ({ name: str(r.PAY_TYPE_NAME), amount: num(r.AMOUNT) })),
    topItems: topItems.map(mapItem),
    productGroups: groups.map((r) => ({ code: str(r.ITEM_GRP_CODE), name: str(r.GROUP_NAME), total: num(r.TOTAL_AMOUNT), qty: num(r.TOTAL_QUANTITY), itemCount: num(r.ITEM_COUNT) }))
  };
}
export async function loadRestProductGroupItems(serverUrl: string, range: DateRange, groupName: string): Promise<RestGroupItemRow[]>
{
  const result = await rows(serverUrl, QueryIds.BOSS_REST_PRODUCTGROUPITEMS, [range.from, range.to, groupName]);
  return result.map((r) => ({ code: str(r.ITEM_CODE), name: str(r.ITEM_NAME), amount: num(r.TOTAL_AMOUNT), qty: num(r.TOTAL_QUANTITY) }));
}

export async function loadRestOperations(serverUrl: string, range: DateRange): Promise<RestOperationsBundle>
{
  const v = [range.from, range.to];
  const [waiters, zones, properties, tables] = await Promise.all([
    rows(serverUrl, QueryIds.BOSS_REST_WAITERPERFORMANCE, v).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_REST_ZONESALES, v).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_REST_POPULARPROPERTIES, v).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_REST_TABLEOCCUPANCYLIST, v).catch(() => [])
  ]);
  return {
    waiters: waiters.map((r) => ({ name: str(r.WAITER_NAME), orderCount: num(r.ORDER_COUNT), total: num(r.TOTAL_SALES), avg: num(r.AVG_ORDER) })),
    zones: zones.map(mapZone),
    properties: properties.map((r) => ({ name: str(r.PROPERTY), orderCount: num(r.ORDER_COUNT), qty: num(r.TOTAL_QTY) })),
    tables: tables.map((r) => ({ code: str(r.TABLE_CODE), name: str(r.TABLE_NAME), occupied: num(r.IS_OCCUPIED) > 0, orderCount: num(r.ORDER_COUNT) }))
  };
}

function mapDetail(r: Row): RestDetailRow
{
  return {
    ref: str(r.REF),
    date: str(r.DOC_DATE ?? r.CDATE).slice(0, 16).replace('T', ' '),
    zone: str(r.ZONE_NAME),
    person: str(r.PERSON ?? r.WAITER_NAME),
    total: num(r.TOTAL),
    item: r.ITEM_NAME != null ? str(r.ITEM_NAME) : undefined,
    qty: r.QUANTITY != null ? num(r.QUANTITY) : undefined
  };
}

export async function loadRestWaiterDetail(serverUrl: string, range: DateRange, waiterName: string): Promise<RestDetailRow[]>
{
  const result = await rows(serverUrl, QueryIds.BOSS_REST_WAITERDETAIL, [range.from, range.to, waiterName]);
  return result.map(mapDetail);
}
export async function loadRestOrderDetails(serverUrl: string, range: DateRange): Promise<RestDetailRow[]>
{
  const result = await rows(serverUrl, QueryIds.BOSS_REST_DAILYORDERDETAILS, [range.from, range.to]);
  return result.map(mapDetail);
}
export async function loadRestWaitingDetails(serverUrl: string, range: DateRange): Promise<RestDetailRow[]>
{
  const result = await rows(serverUrl, QueryIds.BOSS_REST_WAITINGORDERDETAILS, [range.from, range.to]);
  return result.map(mapDetail);
}
export async function loadRestCompletedDetails(serverUrl: string, range: DateRange): Promise<RestDetailRow[]>
{
  const result = await rows(serverUrl, QueryIds.BOSS_REST_COMPLETEDORDERDETAILS, [range.from, range.to]);
  return result.map(mapDetail);
}
export async function loadRestUnprintedDetails(serverUrl: string, range: DateRange): Promise<RestDetailRow[]>
{
  const result = await rows(serverUrl, QueryIds.BOSS_REST_UNPRINTEDORDERDETAILS, [range.from, range.to]);
  return result.map(mapDetail);
}
export async function loadRestAvgOrderDetails(serverUrl: string, range: DateRange, avg: number): Promise<RestDetailRow[]>
{
  const result = await rows(serverUrl, QueryIds.BOSS_REST_AVGORDERAMOUNTDETAILS, [range.from, range.to, String(avg)]);
  return result.map(mapDetail);
}
export async function loadRestTableList(serverUrl: string, range: DateRange): Promise<RestTableRow[]>
{
  const result = await rows(serverUrl, QueryIds.BOSS_REST_TABLEOCCUPANCYLIST, [range.from, range.to]);
  return result.map((r) => ({ code: str(r.TABLE_CODE), name: str(r.TABLE_NAME), occupied: num(r.IS_OCCUPIED) > 0, orderCount: num(r.ORDER_COUNT) }));
}
export async function loadRestZoneDetail(serverUrl: string, range: DateRange, zoneName: string): Promise<RestDetailRow[]>
{
  const result = await rows(serverUrl, QueryIds.BOSS_REST_ZONEDETAIL, [range.from, range.to, zoneName]);
  return result.map(mapDetail);
}
export async function loadRestPropertyDetail(serverUrl: string, range: DateRange, propertyName: string): Promise<RestDetailRow[]>
{
  const result = await rows(serverUrl, QueryIds.BOSS_REST_PROPERTYDETAIL, [range.from, range.to, propertyName]);
  return result.map(mapDetail);
}
