import { QueryIds, type OffDashboardSnapshot } from '@piqboss/shared';

export type OffFieldMap = {
  col: string;
  key: keyof OffDashboardSnapshot;
};

export type OffQueryDef = {
  queryId: string;
  value: 'range' | 'none';
  fields: OffFieldMap[];
};

/** dashboardOff.js this.query — Vue d'ensemble KPI seti (registry BOSS_OFF_* ile birebir). */
export const OFF_DASHBOARD_QUERIES: OffQueryDef[] = [
  { queryId: QueryIds.BOSS_OFF_DAILYORDERTOTAL, value: 'range', fields: [{ col: 'VAL', key: 'orderTotal' }] },
  { queryId: QueryIds.BOSS_OFF_DAILYORDERCOUNT, value: 'range', fields: [{ col: 'VAL', key: 'orderCount' }] },
  { queryId: QueryIds.BOSS_OFF_ORDERAVG, value: 'range', fields: [{ col: 'VAL', key: 'orderAvg' }] },
  { queryId: QueryIds.BOSS_OFF_DAILYSALESTOTAL, value: 'range', fields: [{ col: 'VAL', key: 'salesTotal' }] },
  { queryId: QueryIds.BOSS_OFF_DAILYSALESCOUNT, value: 'range', fields: [{ col: 'VAL', key: 'salesCount' }] },
  { queryId: QueryIds.BOSS_OFF_SALESAVG, value: 'range', fields: [{ col: 'VAL', key: 'salesAvg' }] },
  { queryId: QueryIds.BOSS_OFF_PURCHASETOTAL, value: 'range', fields: [{ col: 'VAL', key: 'purchaseTotal' }] },
  { queryId: QueryIds.BOSS_OFF_PURCHASECOUNT, value: 'range', fields: [{ col: 'VAL', key: 'purchaseCount' }] },
  {
    queryId: QueryIds.BOSS_OFF_TOTALDEBTCREDIT,
    value: 'none',
    fields: [
      { col: 'TOTAL_DEBT', key: 'totalDebt' },
      { col: 'TOTAL_PAID', key: 'totalPaid' },
      { col: 'TOTAL_BALANCE', key: 'netBalance' }
    ]
  },
  { queryId: QueryIds.BOSS_OFF_TAHSILATTOTAL, value: 'range', fields: [{ col: 'TOTAL', key: 'encaissement' }] },
  {
    queryId: QueryIds.BOSS_OFF_OPENSALESINVOICESTATS,
    value: 'range',
    fields: [
      { col: 'CNT', key: 'openSalesCount' },
      { col: 'TOTAL', key: 'openSalesRemaining' }
    ]
  },
  {
    queryId: QueryIds.BOSS_OFF_OPENPURCHASEINVOICESTATS,
    value: 'range',
    fields: [
      { col: 'CNT', key: 'openPurchaseCount' },
      { col: 'TOTAL', key: 'openPurchaseRemaining' }
    ]
  },
  {
    queryId: QueryIds.BOSS_OFF_INCOMPLETESHIPPEDORDERSSTATS,
    value: 'range',
    fields: [
      { col: 'CNT', key: 'incompleteOrdersCount' },
      { col: 'TOTAL_QTY', key: 'incompleteOrdersQty' }
    ]
  },
  {
    queryId: QueryIds.BOSS_OFF_PENDINGORDERSTATS,
    value: 'range',
    fields: [
      { col: 'CNT', key: 'pendingOrderCount' },
      { col: 'TOTAL', key: 'pendingOrderTotal' }
    ]
  },
  {
    queryId: QueryIds.BOSS_OFF_ACTIVEOFFERSTATS,
    value: 'range',
    fields: [
      { col: 'CNT', key: 'activeOfferCount' },
      { col: 'TOTAL', key: 'activeOfferTotal' }
    ]
  },
  {
    queryId: QueryIds.BOSS_OFF_PENDINGSHIPMENTSTATS,
    value: 'range',
    fields: [
      { col: 'CNT', key: 'pendingShipmentCount' },
      { col: 'TOTAL', key: 'pendingShipmentTotal' }
    ]
  },
  {
    queryId: QueryIds.BOSS_OFF_MARGINTOTAL,
    value: 'range',
    fields: [
      { col: 'TOTAL_SALES', key: 'marginSales' },
      { col: 'TOTAL_COST', key: 'marginCost' },
      { col: 'TOTAL_MARGIN', key: 'marginProfit' },
      { col: 'MARGIN_PERCENT', key: 'marginPercent' }
    ]
  }
];
