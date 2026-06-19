import { QueryIds, type PosDashboardSnapshot } from '@piqboss/shared';

export type PosQueryDef = {
  queryId: string;
  field: string;
  stateKey: keyof PosDashboardSnapshot;
  valueMode?: 'range' | 'none';
};

const DATE_PARAM = ['FISRT_DATE:date', 'LAST_DATE:date'] as const;

/** dashboard.js this.query — getSalesData + getExtra (legacy birebir). */
export const POS_DASHBOARD_QUERIES: PosQueryDef[] = [
  { queryId: QueryIds.BOSS_POS_DAILYSALESTOTAL, field: 'DAILY_SALES_TOTAL', stateKey: 'dailySalesTotal' },
  { queryId: QueryIds.BOSS_POS_DAILYSALESCOUNT, field: 'DAILY_SALES_COUNT', stateKey: 'dailySalesCount' },
  { queryId: QueryIds.BOSS_POS_SALESAVG, field: 'AVGTOTAL', stateKey: 'salesAvg' },
  { queryId: QueryIds.BOSS_POS_DAILYREBATETICKET, field: 'DAILY_REBATE_COUNT', stateKey: 'dailyRebateTicket' },
  { queryId: QueryIds.BOSS_POS_DAILYREBATETOTAL, field: 'DAILY_REBATE_TOTAL', stateKey: 'dailyRebateTotal' },
  { queryId: QueryIds.BOSS_POS_DAILYCUSTOMERTICKET, field: 'DAILY_CUSTOMER_COUNT', stateKey: 'dailyCustomerTicket' },
  { queryId: QueryIds.BOSS_POS_DAILYUSELOYALTY, field: 'DAILY_LOYALTY', stateKey: 'dailyUseLoyalty' },
  { queryId: QueryIds.BOSS_POS_USEDISCOUNT, field: 'USE_DISCOUNT', stateKey: 'useDiscount' },
  { queryId: QueryIds.BOSS_POS_USEDISCOUNTTICKET, field: 'USE_DISCOUNT_TICKET', stateKey: 'useDiscountTicket' },
  { queryId: QueryIds.BOSS_POS_DAILYPRICECHANGE, field: 'DAILY_PRICE_CHANGE', stateKey: 'dailyPriceChange' },
  { queryId: QueryIds.BOSS_POS_DAILYROWDELETE, field: 'DAILY_ROW_DELETE', stateKey: 'dailyRowDelete' },
  { queryId: QueryIds.BOSS_POS_DAILYFULLDELETE, field: 'DAILY_FULL_DELETE', stateKey: 'dailyFullDelete' },
  { queryId: QueryIds.BOSS_POS_PURCHASETOTAL, field: 'PURCHASE_TOTAL', stateKey: 'purchaseTotal' },
  { queryId: QueryIds.BOSS_POS_PURCHASEPRICE, field: 'PURCHASE_PRICE', stateKey: 'purchasePrice' },
  { queryId: QueryIds.BOSS_POS_SALEPRICE, field: 'SALE_PRICE', stateKey: 'salePrice' },
  { queryId: QueryIds.BOSS_POS_PURCHASEPRICEDOWN, field: 'PURCHASE_PRICE_DOWN', stateKey: 'purchasePriceDown' },
  { queryId: QueryIds.BOSS_POS_PURCHASEPRICEUP, field: 'PURCHASE_PRICE_UP', stateKey: 'purchasePriceUp' },
  { queryId: QueryIds.BOSS_POS_SALEPRICEDOWN, field: 'SALE_PRICE_DOWN', stateKey: 'salePriceDown' },
  { queryId: QueryIds.BOSS_POS_SALEPRICEUP, field: 'SALE_PRICE_UP', stateKey: 'salePriceUp' },
  { queryId: QueryIds.BOSS_POS_BALANCETICKETCREATED, field: 'BALANCE_TICKET_CREATED', stateKey: 'balanceTicketCreated' },
  { queryId: QueryIds.BOSS_POS_BALANCETICKETUNCHECKED, field: 'BALANCE_TICKET_UNCHECKED', stateKey: 'balanceTicketUnchecked' },
  { queryId: QueryIds.BOSS_POS_BALANCETICKETNONTRAITE, field: 'BALANCE_TICKET_NON_TRAITE', stateKey: 'balanceTicketNonTraite' },
  { queryId: QueryIds.BOSS_POS_BALANCETICKETSUPPRIME, field: 'BALANCE_TICKET_SUPPRIME', stateKey: 'balanceTicketSupprime' },
  { queryId: QueryIds.BOSS_POS_BALANCETICKETCONFIRME, field: 'BALANCE_TICKET_CONFIRME', stateKey: 'balanceTicketConfirme' },
  { queryId: QueryIds.BOSS_POS_ALLITEMGROUPS, field: 'TOTAL_ITEM_GROUPS', stateKey: 'allItemGroups' },
  { queryId: QueryIds.BOSS_POS_UNSOLDITEMGROUPS, field: 'UNSOLD_COUNT', stateKey: 'unsoldItemGroups' },
  { queryId: QueryIds.BOSS_POS_TOTALITEMGROUPS, field: 'TOTAL', stateKey: 'totalItemGroups', valueMode: 'none' }
];

export function dateParamValue(from: string, to: string): { param: string[]; value: string[] }
{
  return { param: [...DATE_PARAM], value: [from, to] };
}
