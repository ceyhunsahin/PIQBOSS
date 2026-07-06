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

export type OffDocRow = { guid: string; ref: string; date: string; customer: string; code: string; ht: number; total: number };
export type OffConvRow = { guid: string; ref: string; date: string; customer: string; total: number; convertedRef: string; convertedType: number };
export type OffDocLineRow = { code: string; name: string; qty: number; pend: number; price: number; ht: number; total: number; unit: string };
export type OffDebtRow = { code: string; name: string; debt: number; paid: number; balance: number };
export type OffCustomerSalesRow = { code: string; name: string; count: number; total: number };
export type OffPaymentCustRow = { name: string; payType: string; count: number; total: number };
export type OffMarginGroupRow = { name: string; marginHt: number; marginPct: number; totalHt: number; qty: number };
export type OffLossRow = { group: string; code: string; name: string; marginHt: number; qty: number };
export type OffTrendRow = { date: string; value: number };
export type OffGroupRow = { name: string; total: number; qty: number };
export type OffProductRow = { code: string; name: string; group: string; total: number; qty: number };
export type OffPaymentTypeRow = { name: string; count: number; total: number };

export type OffOrdersBundle = {
  pendingOrders: OffDocRow[];
  ordersConverted: OffConvRow[];
  pendingOffers: OffDocRow[];
  offersConverted: OffConvRow[];
};
export type OffShipmentsBundle = {
  pendingShipments: OffDocRow[];
  shipmentsConverted: OffConvRow[];
};
export type OffCustomersBundle = {
  debtCustomers: OffDebtRow[];
  salesCustomers: OffCustomerSalesRow[];
  paymentCustomers: OffPaymentCustRow[];
};
export type OffMarginBundle = {
  marginGroups: OffMarginGroupRow[];
  lossItems: OffLossRow[];
};
export type OffChartsBundle = {
  invoiceTrend: OffTrendRow[];
  marginTrend: OffTrendRow[];
  topGroups: OffGroupRow[];
  topProducts: OffProductRow[];
  paymentTypes: OffPaymentTypeRow[];
};

async function rows(serverUrl: string, queryId: string, value: string[]): Promise<Row[]>
{
  return sqlSafe<Row>(serverUrl, { queryId, param: [], value });
}

function mapDoc(r: Row): OffDocRow
{
  return {
    guid: str(r.GUID),
    ref: `${str(r.REF)}-${str(r.REF_NO)}`,
    date: dt(r.DOC_DATE),
    customer: str(r.CUSTOMER_NAME),
    code: str(r.CUSTOMER_CODE),
    ht: num(r.TOTALHT),
    total: num(r.TOTAL)
  };
}
function mapConv(r: Row): OffConvRow
{
  return {
    guid: str(r.GUID),
    ref: `${str(r.REF)}-${str(r.REF_NO)}`,
    date: dt(r.DOC_DATE),
    customer: str(r.CUSTOMER_NAME),
    total: num(r.TOTAL),
    convertedRef: str(r.CONVERTED_REF ?? r.INVOICE_REF),
    convertedType: num(r.CONVERTED_TYPE)
  };
}

export async function loadOffOrders(serverUrl: string, range: DateRange): Promise<OffOrdersBundle>
{
  const v = [range.from, range.to];
  const [pendingOrders, ordersConverted, pendingOffers, offersConverted] = await Promise.all([
    rows(serverUrl, QueryIds.BOSS_OFF_PENDINGORDERS, v).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_OFF_ORDERSCONVERTED, v).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_OFF_PENDINGOFFERS, v).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_OFF_OFFERSCONVERTED, v).catch(() => [])
  ]);
  return {
    pendingOrders: pendingOrders.map(mapDoc),
    ordersConverted: ordersConverted.map(mapConv),
    pendingOffers: pendingOffers.map(mapDoc),
    offersConverted: offersConverted.map(mapConv)
  };
}

export async function loadOffShipments(serverUrl: string, range: DateRange): Promise<OffShipmentsBundle>
{
  const v = [range.from, range.to];
  const [pendingShipments, shipmentsConverted] = await Promise.all([
    rows(serverUrl, QueryIds.BOSS_OFF_PENDINGSHIPMENTS, v).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_OFF_SHIPMENTSCONVERTED, v).catch(() => [])
  ]);
  return {
    pendingShipments: pendingShipments.map(mapDoc),
    shipmentsConverted: shipmentsConverted.map(mapConv)
  };
}

export async function loadOffCustomers(serverUrl: string, range: DateRange): Promise<OffCustomersBundle>
{
  const v = [range.from, range.to];
  const [debt, sales, payment] = await Promise.all([
    rows(serverUrl, QueryIds.BOSS_OFF_TOPDEBTCUSTOMERS, []).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_OFF_CUSTOMERSALESSUMMARY, v).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_OFF_CUSTOMERPAYMENTSUMMARY, v).catch(() => [])
  ]);
  return {
    debtCustomers: debt.map((r) => ({
      code: str(r.CUSTOMER_CODE),
      name: str(r.CUSTOMER_NAME),
      debt: num(r.DEBT),
      paid: num(r.PAID),
      balance: num(r.BALANCE)
    })),
    salesCustomers: sales.map((r) => ({
      code: str(r.CUSTOMER_CODE),
      name: str(r.CUSTOMER_NAME),
      count: num(r.INVOICE_COUNT),
      total: num(r.TOTAL_SALES)
    })),
    paymentCustomers: payment.map((r) => ({
      name: str(r.CUSTOMER_NAME),
      payType: str(r.PAY_TYPE_NAME),
      count: num(r.PAYMENT_COUNT),
      total: num(r.TOTAL_PAID)
    }))
  };
}

export async function loadOffMargin(serverUrl: string, range: DateRange): Promise<OffMarginBundle>
{
  const v = [range.from, range.to];
  const [groups, loss] = await Promise.all([
    rows(serverUrl, QueryIds.BOSS_OFF_MARGINSTATSBYGROUP, v).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_OFF_GLOBALLOSSITEMS, v).catch(() => [])
  ]);
  return {
    marginGroups: groups.map((r) => ({
      name: str(r.ITEM_GRP_NAME),
      marginHt: num(r.MARGIN_HT),
      marginPct: num(r.MARGIN_PERCENT),
      totalHt: num(r.TOTAL_HT),
      qty: num(r.TOTAL_QUANTITY)
    })),
    lossItems: loss.map((r) => ({
      group: str(r.ITEM_GRP_NAME),
      code: str(r.ITEM_CODE),
      name: str(r.ITEM_NAME),
      marginHt: num(r.MARGIN_HT),
      qty: num(r.TOTAL_QUANTITY)
    }))
  };
}

export type OffExtreRow = { date: string; monthKey: string; ref: string; tag: string; typeName: string; debit: number; receive: number; balance: number };
export type OffInvoiceRow = { party: string; ref: string; date: string; total: number; remainder: number };
export type OffEncaissementRow = { ref: string; date: string; amount: number; linked: string };
export type OffIncompleteRow = { ref: string; item: string; supplier: string; date: string; qty: number; pend: number };

export async function loadOffEncaissementList(serverUrl: string, range: DateRange): Promise<OffEncaissementRow[]>
{
  const result = await rows(serverUrl, QueryIds.BOSS_OFF_ENCAISSEMENTLIST, [range.from, range.to]);
  return result.map((r) => ({
    ref: `${str(r.REF)}-${str(r.REF_NO)}`,
    date: dt(r.DOC_DATE),
    amount: num(r.AMOUNT),
    linked: str(r.LINKED_INV)
  }));
}
export async function loadOffOpenSalesInvoices(serverUrl: string, range: DateRange): Promise<OffInvoiceRow[]>
{
  const result = await rows(serverUrl, QueryIds.BOSS_OFF_OPENSALESINVOICESLIST, [range.from, range.to]);
  return result.map((r) => ({
    party: str(r.INPUT_NAME),
    ref: `${str(r.DOC_REF)}-${str(r.DOC_REF_NO)}`,
    date: dt(r.DOC_DATE),
    total: num(r.DOC_TOTAL),
    remainder: num(r.REMAINDER)
  }));
}
export async function loadOffOpenPurchaseInvoices(serverUrl: string, range: DateRange): Promise<OffInvoiceRow[]>
{
  const result = await rows(serverUrl, QueryIds.BOSS_OFF_OPENPURCHASEINVOICESLIST, [range.from, range.to]);
  return result.map((r) => ({
    party: str(r.OUTPUT_NAME),
    ref: `${str(r.DOC_REF)}-${str(r.DOC_REF_NO)}`,
    date: dt(r.DOC_DATE),
    total: num(r.DOC_TOTAL),
    remainder: num(r.REMAINDER)
  }));
}
export async function loadOffIncompleteOrders(serverUrl: string, range: DateRange): Promise<OffIncompleteRow[]>
{
  const result = await rows(serverUrl, QueryIds.BOSS_OFF_INCOMPLETESHIPPEDORDERSLIST, [range.from, range.to]);
  return result.map((r) => ({
    ref: `${str(r.REF)}-${str(r.REF_NO)}`,
    item: str(r.ITEM_NAME),
    supplier: str(r.INPUT_NAME),
    date: dt(r.DOC_DATE),
    qty: num(r.QUANTITY),
    pend: num(r.PEND_QUANTITY)
  }));
}

export async function loadOffDocLines(serverUrl: string, docType: number, guid: string): Promise<OffDocLineRow[]>
{
  if(!guid)
  {
    return [];
  }
  const queryId = docType === 61 ?
    QueryIds.BOSS_OFF_DOCLINESOFFER :
    (docType === 40 ? QueryIds.BOSS_OFF_DOCLINESSHIPMENT : QueryIds.BOSS_OFF_DOCLINESORDER);
  const result = await rows(serverUrl, queryId, [guid]);
  return result.map((r) => ({
    code: str(r.ITEM_CODE),
    name: str(r.ITEM_NAME),
    qty: num(r.QUANTITY),
    pend: num(r.PEND_QUANTITY),
    price: num(r.PRICE),
    ht: num(r.TOTALHT),
    total: num(r.TOTAL),
    unit: str(r.UNIT_NAME)
  }));
}
export async function loadOffCustomerPhone(serverUrl: string, code: string): Promise<string>
{
  if(!code)
  {
    return '';
  }
  const result = await rows(serverUrl, QueryIds.BOSS_OFF_CUSTOMERPHONE, [code]).catch(() => []);
  return str(result[0]?.GSM_PHONE);
}
export type OffCustomerSearchRow = { code: string; name: string; phone: string };
export async function loadOffCustomerSearch(serverUrl: string, term: string): Promise<OffCustomerSearchRow[]>
{
  const t = term.trim();
  if(!serverUrl || t.length === 0)
  {
    return [];
  }
  const result = await rows(serverUrl, QueryIds.BOSS_OFF_CUSTOMERSEARCH, [t]).catch(() => []);
  return result.map((r) => ({
    code: str(r.CODE),
    name: str(r.CUSTOMER_NAME),
    phone: str(r.GSM_PHONE)
  }));
}
export type OffCustomerSummary = { guid: string; code: string; title: string; phone: string; balance: number };
export async function loadOffCustomerSummary(serverUrl: string, code: string): Promise<OffCustomerSummary | null>
{
  if(!serverUrl || !code)
  {
    return null;
  }
  const result = await rows(serverUrl, QueryIds.BOSS_OFF_CUSTOMERSUMMARY, [code]).catch(() => []);
  const r = result[0];
  if(!r)
  {
    return null;
  }
  return {
    guid: str(r.GUID),
    code: str(r.CODE),
    title: str(r.TITLE),
    phone: str(r.GSM_PHONE),
    balance: num(r.BALANCE)
  };
}
export type OffOpenDocRow = { ref: string; date: string; balance: number };
export async function loadOffCustomerOpenDocs(serverUrl: string, code: string): Promise<OffOpenDocRow[]>
{
  if(!serverUrl || !code)
  {
    return [];
  }
  const result = await rows(serverUrl, QueryIds.BOSS_OFF_CUSTOMEROPENDOCS, [code]).catch(() => []);
  return result.map((r) => ({
    ref: `${str(r.REF)}-${str(r.REF_NO)}`,
    date: dt(r.DOC_DATE),
    balance: num(r.BALANCE)
  }));
}
export async function loadOffCustomerExtre(serverUrl: string, range: DateRange, customerCode: string, lang: string): Promise<OffExtreRow[]>
{
  void range;
  const result = await rows(serverUrl, QueryIds.BOSS_OFF_CUSTOMEREXTRE, [customerCode, lang]);
  return result.map((r) => ({
    date: dt(r.DOC_DATE),
    monthKey: str(r.MONTH_KEY) || dt(r.DOC_DATE).slice(0, 7),
    ref: `${str(r.REF)}-${str(r.REF_NO)}`,
    tag: str(r.TYPE_TAG),
    typeName: str(r.TYPE_NAME),
    debit: num(r.DEBIT),
    receive: num(r.RECEIVE),
    balance: num(r.BALANCE)
  }));
}

export async function loadOffMarginGroupDetail(serverUrl: string, range: DateRange, groupName: string): Promise<OffProductRow[]>
{
  const result = await rows(serverUrl, QueryIds.BOSS_OFF_MARGINDETAILBYGROUP, [range.from, range.to, groupName]);
  return result.map((r) => ({
    code: str(r.ITEM_CODE),
    name: str(r.ITEM_NAME),
    group: groupName,
    total: num(r.MARGIN_HT),
    qty: num(r.TOTAL_QTY)
  }));
}

export async function loadOffCharts(serverUrl: string, range: DateRange): Promise<OffChartsBundle>
{
  const v = [range.from, range.to];
  const [invoiceTrend, marginTrend, topGroups, topProducts, paymentTypes] = await Promise.all([
    rows(serverUrl, QueryIds.BOSS_OFF_INVOICETREND, [range.to]).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_OFF_MARGINTREND, [range.to]).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_OFF_TOPSELLINGGROUPS, v).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_OFF_TOPSELLINGPRODUCTS, v).catch(() => []),
    rows(serverUrl, QueryIds.BOSS_OFF_PAYMENTTYPES, v).catch(() => [])
  ]);
  return {
    invoiceTrend: invoiceTrend.map((r) => ({ date: dt(r.DATE), value: num(r.TOTAL) })),
    marginTrend: marginTrend.map((r) => ({ date: dt(r.DATE), value: num(r.MARGIN) })),
    topGroups: topGroups.map((r) => ({ name: str(r.ITEM_GRP_NAME), total: num(r.TOTAL_SALES), qty: num(r.TOTAL_QTY) })),
    topProducts: topProducts.map((r) => ({
      code: str(r.ITEM_CODE),
      name: str(r.ITEM_NAME),
      group: str(r.ITEM_GRP_NAME),
      total: num(r.TOTAL_SALES),
      qty: num(r.TOTAL_QTY)
    })),
    paymentTypes: paymentTypes.map((r) => ({ name: str(r.PAY_TYPE_NAME), count: num(r.CNT), total: num(r.TOTAL) }))
  };
}
