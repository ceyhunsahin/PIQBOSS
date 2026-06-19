import { QueryIds } from '@piqboss/shared';
import type { DateRange } from '@/lib/dateRange';
import { formatCurrency, formatNumber } from '@/lib/format';
import { tDash } from '@/lib/i18n';
import { sqlSafe } from '@/lib/sql';
import { emptyLabel } from '@/lib/uiText';
import type { DetailContent } from './types';

type Row = Record<string, unknown>;

function num(v: unknown): number
{
  const n = parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : 0;
}

async function fetchRows(serverUrl: string, queryId: string, values: string[]): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, { queryId, param: [], value: values });
}

export type HourlySalesRow = {
  hour: string;
  amount: number;
  tickets: number;
  sales: number;
};

export async function fetchHourlySales(serverUrl: string, range: DateRange): Promise<HourlySalesRow[]>
{
  const rows = await fetchRows(serverUrl, QueryIds.BOSS_POS_HOURLYSALES, [range.from, range.to]);
  const out: HourlySalesRow[] = [];
  for(let hour = 7; hour <= 22; hour++)
  {
    const label = `${String(hour).padStart(2, '0')}:00`;
    const hit = rows.find((r) => num(r.HOUR) === hour);
    out.push({
      hour: label,
      amount: num(hit?.TOTAL_SALES),
      tickets: num(hit?.TICKET_COUNT),
      sales: num(hit?.SALE_COUNT)
    });
  }
  return out;
}

export async function fetchZeroCostItems(serverUrl: string): Promise<Row[]>
{
  return fetchRows(serverUrl, QueryIds.BOSS_POS_ZEROCOSTITEMS, []);
}

export async function fetchRedTagItems(serverUrl: string, range: DateRange): Promise<Row[]>
{
  return fetchRows(serverUrl, QueryIds.BOSS_POS_REDTAGITEMS, [range.from, range.to]);
}

export async function fetchLowMarginProducts(
  serverUrl: string,
  range: DateRange,
  threshold = 15,
  groupName = ''
): Promise<Row[]>
{
  return fetchRows(serverUrl, QueryIds.BOSS_POS_LOWMARGINPRODUCTS, [range.from, range.to, String(threshold), groupName]);
}

export async function fetchUnsoldLossProducts(serverUrl: string, range: DateRange, groupName = ''): Promise<Row[]>
{
  return fetchRows(serverUrl, QueryIds.BOSS_POS_UNSOLDLOSSPRODUCTS, [range.to, groupName, '00000000-0000-0000-0000-000000000000']);
}

export function mapZeroCostRows(rows: Row[]): DetailContent['sections'][number]['rows']
{
  return rows.map((r) => ({
    label: String(r.ITEM_NAME ?? emptyLabel()),
    value: formatCurrency(num(r.COST_PRICE)),
    sub: String(r.CODE ?? '')
  }));
}

export function mapRedTagRows(rows: Row[]): DetailContent['sections'][number]['rows']
{
  return rows.slice(0, 50).map((r) => ({
    label: String(r.ITEM_NAME ?? emptyLabel()),
    value: formatCurrency(num(r.TOTAL_AMOUNT)),
    sub: `${num(r.TOTAL_QUANTITY)} ${String(r.UNIT_SHORT ?? '')} · ${num(r.SALE_COUNT)} ${tDash('quickTickets')}`
  }));
}

export function mapLowMarginRows(rows: Row[]): DetailContent['sections'][number]['rows']
{
  return rows.slice(0, 60).map((r) => ({
    label: String(r.ITEM_NAME ?? emptyLabel()),
    value: `${num(r.MARGIN_PERCENT).toFixed(1)}%`,
    sub: `${String(r.ITEM_GRP_NAME ?? '')} · ${tDash('costPrice')} ${formatCurrency(num(r.COST_PRICE))}`,
    accent: num(r.MARGIN_PERCENT) < 0 ? '#DC2626' : undefined
  }));
}

export async function fetchKpiCompareValue(
  serverUrl: string,
  metric: 'dailySalesCount' | 'salesAvg',
  range: DateRange
): Promise<number>
{
  if(metric === 'dailySalesCount')
  {
    const rows = await fetchRows(serverUrl, QueryIds.BOSS_POS_DAILYSALESCOUNT, [range.from, range.to]);
    return num(rows[0]?.DAILY_SALES_COUNT);
  }
  const rows = await fetchRows(serverUrl, QueryIds.BOSS_POS_SALESAVG, [range.from, range.to]);
  return num(rows[0]?.AVGTOTAL);
}

export function deltaPercent(a: number, b: number): string
{
  if(b === 0)
  {
    return a === 0 ? '0%' : '+100%';
  }
  const d = ((a - b) / b) * 100;
  return `${d >= 0 ? '+' : ''}${d.toFixed(1)}%`;
}

export function buildKpiCompareContent(
  metric: 'dailySalesCount' | 'salesAvg',
  currentRange: DateRange,
  compareRange: DateRange,
  currentValue: number,
  compareValue: number
): DetailContent
{
  const title = metric === 'dailySalesCount' ? tDash('dailySalesCount') : tDash('salesAvg');
  const fmt = metric === 'salesAvg' ? formatCurrency : formatNumber;
  return {
    title: tDash('comparisonResult'),
    subtitle: title,
    sections: [{
      title,
      rows: [
        { label: `${tDash('firstDate')} (${currentRange.from})`, value: fmt(currentValue) },
        { label: `${tDash('secondDate')} (${compareRange.from})`, value: fmt(compareValue) },
        { label: tDash('difference'), value: deltaPercent(currentValue, compareValue), accent: compareValue > currentValue ? '#DC2626' : '#16A34A' }
      ]
    }]
  };
}
