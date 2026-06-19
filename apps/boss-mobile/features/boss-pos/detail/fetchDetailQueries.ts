import { DetailQueryIds, QueryIds } from '@piqboss/shared';
import type { DateRange } from '@/lib/dateRange';
import i18n, { tDash } from '@/lib/i18n';
import { sqlSafe } from '@/lib/sql';
import { emptyLabel } from '@/lib/uiText';

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

function dateValues(range: DateRange): string[]
{
  return [range.from, range.to];
}

async function fetchRows(serverUrl: string, queryId: string, range: DateRange): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, { queryId, param: [], value: dateValues(range) });
}

export async function fetchPosDevices(serverUrl: string, range: DateRange): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_POSDEVICES,
    param: [],
    value: [range.from.replace(/-/g, ''), range.to.replace(/-/g, '')]
  });
}

export async function fetchPromoMarginDetail(serverUrl: string, range: DateRange): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_PROMOMARGINDETAIL,
    param: [],
    value: [range.from, range.to]
  });
}

export async function fetchMarginDetailByGroup(serverUrl: string, range: DateRange, groupName: string): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_MARGINDETAILBYGROUP,
    param: [],
    value: [range.from, range.to, groupName]
  });
}

export async function fetchButcherChanges(serverUrl: string, range: DateRange, weigherName: string): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_BUTCHERCHANGES,
    param: [],
    value: [range.from, range.to, weigherName]
  });
}

export async function fetchPromoLoyaltyInfo(serverUrl: string, range: DateRange): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_PROMOLOYALTYINFO,
    param: [],
    value: [range.from, range.to]
  });
}

export async function fetchPosUsersBySafe(serverUrl: string, range: DateRange, safeCode: string): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_POSUSERSBYSAFE,
    param: [],
    value: [safeCode, range.from.replace(/-/g, ''), range.to.replace(/-/g, '')]
  });
}

export async function fetchGlobalLossItems(serverUrl: string, range: DateRange): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_GLOBALLOSSITEMS,
    param: [],
    value: [range.from, range.to]
  });
}
export async function fetchGroupLossItems(serverUrl: string, range: DateRange, groupName: string): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_GROUPLOSSITEMS,
    param: [],
    value: [range.from, range.to, groupName]
  });
}
export async function fetchDiscountDetail(serverUrl: string, range: DateRange, itemCode: string): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_DISCOUNTDETAIL,
    param: [],
    value: [range.from, range.to, itemCode]
  });
}
export async function fetchItemSearch(serverUrl: string, text: string): Promise<Row[]>
{
  const formatted = text.replace(/\*/g, '%');
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_ITEMSEARCH,
    param: [],
    value: [`%${formatted}%`]
  });
}
export async function fetchItemMarginDetail(serverUrl: string, range: DateRange, itemGuid: string): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_ITEMMARGINDETAIL,
    param: [],
    value: [range.from, range.to, itemGuid]
  });
}
export async function fetchItemPurchaseHistory(serverUrl: string, itemCode: string): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_ITEMPURCHASEHISTORY,
    param: [],
    value: [itemCode]
  });
}
export async function fetchItemSalesHistory(serverUrl: string, itemCode: string): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_ITEMSALESHISTORY,
    param: [],
    value: [itemCode]
  });
}
export async function fetchItemSalesChart(serverUrl: string, itemCode: string): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_ITEMSALESCHART,
    param: [],
    value: [itemCode]
  });
}
export async function fetchItemBarcodes(serverUrl: string, itemCode: string): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_ITEMBARCODES,
    param: [],
    value: [itemCode]
  });
}
export async function fetchPosUserDetails(serverUrl: string, range: DateRange, safeCode: string, cuserName: string): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_POSUSERDETAILS,
    param: [],
    value: [safeCode, cuserName, range.from.replace(/-/g, ''), range.to.replace(/-/g, '')]
  });
}
export async function fetchPopSalesTotalBundle(serverUrl: string, range: DateRange)
{
  const [payments, vat, rebateTickets, refundPay, netTtc] = await Promise.all([
    fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPSALESPAYMENTAMOUNT, range),
    fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPSALESVATDETAIL, range),
    fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPREBATETICKETLIST, range),
    fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPREFUNDPAYMENTTOTAL, range),
    fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPPOSNETTTC, range)
  ]);
  return {
    payments,
    vat,
    rebateTickets,
    refundPaymentTotal: Math.abs(num(refundPay[0]?.AMOUNT)),
    posNetTtc: num(netTtc[0]?.NET_TTC)
  };
}

export async function fetchPopPriceDescList(serverUrl: string, range: DateRange): Promise<Row[]>
{
  return fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPPRICEDESCLIST, range);
}

export async function fetchPopRowDeleteList(serverUrl: string, range: DateRange): Promise<Row[]>
{
  return fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPROWDELETELIST, range);
}

export async function fetchPopFullDeleteList(serverUrl: string, range: DateRange): Promise<Row[]>
{
  return fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPFULLDELETELIST, range);
}

export async function fetchPopRebateTicketList(serverUrl: string, range: DateRange): Promise<Row[]>
{
  return fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPREBATETICKETLIST, range);
}

export async function fetchPopRebateTotalPayment(serverUrl: string, range: DateRange): Promise<Row[]>
{
  return fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPREBATETOTALPAYMENT, range);
}

export async function fetchPopAllItemGroupsList(serverUrl: string, range: DateRange): Promise<Row[]>
{
  return fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPALLITEMGROUPSLIST, range);
}

export async function fetchPopUnsoldGroupsList(serverUrl: string, range: DateRange): Promise<Row[]>
{
  return fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPUNSOLDGROUPSLIST, range);
}

export async function fetchPopBalanceTicketBundle(serverUrl: string, range: DateRange)
{
  const [summary, amounts] = await Promise.all([
    fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPBALANCETICKETSUMMARY, range),
    fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPBALANCETICKETAMOUNTS, range)
  ]);
  return { summary: summary[0] ?? {}, amounts: amounts[0] ?? {} };
}

export async function fetchPopUncheckedUsers(serverUrl: string, range: DateRange)
{
  const [supprime, nonTraite] = await Promise.all([
    fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPSUPPRIMEUSERS, range),
    fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPNONTRAITEUSERS, range)
  ]);
  return { supprime, nonTraite };
}

export async function fetchPopConfirmeUsers(serverUrl: string, range: DateRange): Promise<Row[]>
{
  return fetchRows(serverUrl, QueryIds.BOSS_POS_POPUPCONFIRMEUSERS, range);
}
export async function fetchPopSupprimeDetail(serverUrl: string, range: DateRange, weigher: string): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_POPUPSUPPRIMEDETAIL,
    param: [],
    value: [range.from, range.to, weigher]
  });
}
export async function fetchPopNonTraiteDetail(serverUrl: string, range: DateRange, weigher: string): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_POPUPNONTRAITEDETAIL,
    param: [],
    value: [range.from, range.to, weigher]
  });
}
export async function fetchPopConfirmeDetail(serverUrl: string, range: DateRange, validateur: string): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, {
    queryId: QueryIds.BOSS_POS_POPUPCONFIRMEDETAIL,
    param: [],
    value: [range.from, range.to, `%${validateur.trim()}%`]
  });
}
export async function fetchPopPurcPriceDownList(serverUrl: string, range: DateRange): Promise<Row[]>
{
  return fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPPURCPRICEDOWNLIST, range);
}

export async function fetchPopSalePriceDownList(serverUrl: string, range: DateRange): Promise<Row[]>
{
  return fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPSALEPRICEDOWNLIST, range);
}

export async function fetchPopPurcPriceUpList(serverUrl: string, range: DateRange): Promise<Row[]>
{
  return fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPPURCPRICEUPLIST, range);
}

export async function fetchPopSalePriceUpList(serverUrl: string, range: DateRange): Promise<Row[]>
{
  return fetchRows(serverUrl, DetailQueryIds.BOSS_POS_POPUPSALEPRICEUPLIST, range);
}

export function mapPromoDetailRows(rows: Row[]): { label: string; value: string; sub?: string }[]
{
  return rows.slice(0, 40).map((r) => ({
    label: String(r.ITEM_NAME ?? r.ITEM_CODE ?? emptyLabel()),
    value: `${num(r.MARGIN_HT).toFixed(2)} €`,
    sub: `${String(r.ITEM_GRP_NAME ?? '')} · ${num(r.TOTAL_QUANTITY)} ${i18n.t('dashboardOff.piecesLabel')}`
  }));
}

export function mapMarginDetailRows(rows: Row[]): { label: string; value: string; sub?: string }[]
{
  return rows.slice(0, 50).map((r) => ({
    label: String(r.ITEM_NAME ?? r.ITEM_CODE ?? emptyLabel()),
    value: `${num(r.MARGIN_HT).toFixed(2)} € (${num(r.MARGIN_PERCENT).toFixed(1)}%)`,
    sub: `${num(r.TOTAL_QUANTITY)} ${String(r.UNIT_SHORT ?? i18n.t('dashboardOff.piecesLabel'))}`
  }));
}

export function mapButcherChangeRows(rows: Row[]): { label: string; value: string; sub?: string; note?: string }[]
{
  return rows.slice(0, 40).map((r) =>
  {
    const parts: string[] = [];
    const date = String(r.DOC_DATE ?? '').slice(0, 10);
    if(date)
    {
      parts.push(date);
    }
    const discount = num(r.DISCOUNT);
    if(discount > 0)
    {
      parts.push(`${tDash('useDiscount')}: ${discount.toFixed(2)} €`);
    }
    const noteParts: string[] = [];
    if(num(r.IS_FREE) === 1 || num(r.FREE) === 1)
    {
      noteParts.push(`🎁 ${tDash('freeItems')}`);
    }
    const reason = String(r.PRICE_CHANGE_DESC ?? '').trim();
    if(reason)
    {
      noteParts.push(`✏️ ${reason}`);
    }
    return {
      label: String(r.ITEM_NAME ?? r.REF ?? emptyLabel()),
      value: `${num(r.TOTAL).toFixed(2)} €`,
      sub: parts.join(' · '),
      note: noteParts.length ? noteParts.join('    ') : undefined
    };
  });
}

export function mapPriceHistoryRows(rows: Row[]): { label: string; value: string; sub?: string }[]
{
  return rows.slice(0, 50).map((r) => ({
    label: String(r.ITEM_NAME ?? r.ITEM_CODE ?? r.ITEM ?? emptyLabel()),
    value: `${num(r.FISRT_PRICE).toFixed(2)} → ${num(r.LAST_PRICE).toFixed(2)}`,
    sub: String(r.CDATE ?? '').slice(0, 10)
  }));
}

export function mapExtraRows(rows: Row[], nameField = 'NAME'): { label: string; value: string; sub?: string }[]
{
  return rows.slice(0, 50).map((r) => ({
    label: String(r[nameField] ?? r.ITEM ?? r.CUSER ?? emptyLabel()),
    value: formatRowAmount(r),
    sub: String(r.CDATE ?? r.DOC_DATE ?? '').slice(0, 16)
  }));
}

function formatRowAmount(r: Row): string
{
  const total = num(r.TOTAL ?? r.LAST_PRICE ?? r.AMOUNT ?? r.QUANTITY);
  return total.toFixed(2);
}

export function mapRebateTicketRows(rows: Row[]): { label: string; value: string; sub?: string }[]
{
  return rows.slice(0, 40).map((r) => ({
    label: String(r.ITEM_NAME ?? r.GUID ?? emptyLabel()),
    value: `${num(r.TOTAL).toFixed(2)} €`,
    sub: `${String(r.DOC_DATE ?? '').slice(0, 10)} · ${String(r.DEVICE ?? '')}`
  }));
}

export function mapGroupQtyRows(rows: Row[]): { label: string; value: string; sub?: string }[]
{
  return rows.slice(0, 50).map((r) => ({
    label: String(r.ITEM_GRP_NAME ?? r.NAME ?? emptyLabel()),
    value: formatNumber(num(r.QUANTITY)),
    sub: r.CODE ? String(r.CODE) : undefined
  }));
}

function formatNumber(n: number): string
{
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

export function mapSupprimeRows(rows: Row[]): { label: string; value: string; sub?: string }[]
{
  return rows.map((r) => ({
    label: String(r.WEIGHER_NAME ?? r.WEIGHER ?? emptyLabel()),
    value: formatNumber(num(r.SUPPRIME_COUNT)),
    sub: String(r.WEIGHER ?? '')
  }));
}

export function mapNonTraiteRows(rows: Row[]): { label: string; value: string; sub?: string }[]
{
  return rows.map((r) => ({
    label: String(r.WEIGHER_NAME ?? r.WEIGHER ?? emptyLabel()),
    value: formatNumber(num(r.NON_TRAITE_COUNT)),
    sub: `${formatNumber(num(r.NON_TRAITE_AMOUNT))} €`
  }));
}
