import type { PosDashboardSnapshot } from '@piqboss/shared';
import type { PosTabId } from '../hooks/usePosDashboard';

export type KpiFormat = 'currency' | 'number';

export type KpiDetailKind =
  | 'popSalesTotal'
  | 'popPriceDesc'
  | 'popRowDelete'
  | 'popFullDelete'
  | 'popRebateTicket'
  | 'popRebateTotal'
  | 'popAllItemGroups'
  | 'popUnsoldGroups'
  | 'popBalanceTicket'
  | 'popUncheckedUsers'
  | 'popPurcPriceDown'
  | 'popSalePriceDown'
  | 'popPurcPriceUp'
  | 'popSalePriceUp'
  | 'posDevices'
  | 'trend'
  | 'groups'
  | 'butcher'
  | 'loss'
  | 'promo'
  | 'loyalty'
  | 'promoDetail';

export type KpiComposite = 'allItemGroups' | 'balanceCreated' | 'balanceUnchecked';

export type KpiDef = {
  key: keyof PosDashboardSnapshot;
  labelKey: string;
  labelScope?: 'root' | 'dashboard';
  tab: PosTabId | PosTabId[];
  prmId?: string;
  format: KpiFormat;
  icon: string;
  accent: string;
  wide?: boolean;
  detail?: KpiDetailKind;
  compare?: boolean;
  leftBadge?: 'posDevices';
  infoAction?: 'unsoldGroups';
  composite?: KpiComposite;
};

/** Legacy dashboard.js — Vue d'ensemble / Sales / Operations KPI seti birebir */
export const KPI_DEFINITIONS: KpiDef[] = [
  { key: 'dailySalesTotal', labelKey: 'dailySalesTotal', tab: 'overview', prmId: 'dashKpiDailySalesTotal', format: 'currency', icon: '💰', accent: '#007bff', detail: 'popSalesTotal', leftBadge: 'posDevices' },
  { key: 'dailySalesCount', labelKey: 'dailySalesCount', tab: 'overview', prmId: 'dashKpiDailySalesCount', format: 'number', icon: '🧾', accent: '#28a745', compare: true },
  { key: 'salesAvg', labelKey: 'salesAvg', tab: 'overview', prmId: 'dashKpiSalesAvg', format: 'currency', icon: '📈', accent: '#17a2b8', compare: true },
  { key: 'dailyPriceChange', labelKey: 'dailyPriceChange', tab: 'overview', prmId: 'dashKpiDailyPriceChange', format: 'number', icon: '💱', accent: '#ffc107', detail: 'popPriceDesc' },
  { key: 'dailyRowDelete', labelKey: 'dailyRowDelete', tab: 'overview', prmId: 'dashKpiDailyRowDelete', format: 'number', icon: '❌', accent: '#6c3483', detail: 'popRowDelete' },
  { key: 'dailyFullDelete', labelKey: 'dailyFullDelete', tab: 'overview', prmId: 'dashKpiDailyFullDelete', format: 'number', icon: '🗑️', accent: '#34495e', detail: 'popFullDelete' },
  { key: 'dailyRebateTicket', labelKey: 'dailyRebateTicket', tab: 'overview', prmId: 'dashKpiDailyRebateTicket', format: 'number', icon: '🎫', accent: '#1f6f50', detail: 'popRebateTicket' },
  { key: 'useDiscountTicket', labelKey: 'useDiscountTicket', tab: 'overview', prmId: 'dashKpiUseDiscountTicket', format: 'number', icon: '🏷️', accent: '#667eea' },
  { key: 'dailyRebateTotal', labelKey: 'dailyRebateTotal', tab: 'sales', prmId: 'dashKpiDailyRebateTotal', format: 'currency', icon: '💰', accent: '#6f42c1', detail: 'popRebateTotal' },
  { key: 'dailyCustomerTicket', labelKey: 'dailyCustomerTicket', tab: 'sales', prmId: 'dashKpiDailyCustomerTicket', format: 'number', icon: '👥', accent: '#20c997' },
  { key: 'dailyUseLoyalty', labelKey: 'dailyUseLoyalty', tab: 'sales', prmId: 'dashKpiDailyUseLoyalty', format: 'number', icon: '💳', accent: '#fd7e14' },
  { key: 'allItemGroups', labelKey: 'AllItemGroups', labelScope: 'root', tab: 'sales', prmId: 'dashKpiAllItemGroups', format: 'number', icon: '📦', accent: '#224379', detail: 'popAllItemGroups', composite: 'allItemGroups', infoAction: 'unsoldGroups' },
  { key: 'balanceTicketCreated', labelKey: 'balanceTicketCreated', tab: 'sales', prmId: 'dashKpiBalanceTicketCreated', format: 'number', icon: '🔄', accent: '#0d6efd', detail: 'popBalanceTicket', composite: 'balanceCreated' },
  { key: 'balanceTicketUnchecked', labelKey: 'balanceTicketUnchecked', tab: 'sales', prmId: 'dashKpiBalanceTicketUnchecked', format: 'number', icon: '⚠️', accent: '#ff6b6b', detail: 'popUncheckedUsers', composite: 'balanceUnchecked' },
  { key: 'purchaseTotal', labelKey: 'purchaseTotal', tab: 'operations', prmId: 'dashKpiPurchaseTotal', format: 'currency', icon: '📥', accent: '#224379', wide: true },
  { key: 'purchasePrice', labelKey: 'purchasePrice', tab: 'operations', prmId: 'dashKpiPurchasePrice', format: 'number', icon: '📉', accent: '#1f6f50' },
  { key: 'salePrice', labelKey: 'salePrice', tab: 'operations', prmId: 'dashKpiSalePrice', format: 'number', icon: '📈', accent: '#2b9788' },
  { key: 'purchasePriceDown', labelKey: 'purchasePriceDown', tab: 'operations', prmId: 'dashKpiPurchasePriceDown', format: 'number', icon: '⬇️', accent: '#2d8659', detail: 'popPurcPriceDown' },
  { key: 'salePriceDown', labelKey: 'salePriceDown', tab: 'operations', prmId: 'dashKpiSalePriceDown', format: 'number', icon: '🔻', accent: '#6c3483', detail: 'popSalePriceDown' },
  { key: 'purchasePriceUp', labelKey: 'purchasePriceUp', tab: 'operations', prmId: 'dashKpiPurchasePriceUp', format: 'number', icon: '⬆️', accent: '#2d8659', detail: 'popPurcPriceUp' },
  { key: 'salePriceUp', labelKey: 'salePriceUp', tab: 'operations', prmId: 'dashKpiSalePriceUp', format: 'number', icon: '🔺', accent: '#8e44ad', detail: 'popSalePriceUp' }
];

export function kpisForTab(tab: PosTabId): KpiDef[]
{
  return KPI_DEFINITIONS.filter((k) =>
  {
    return Array.isArray(k.tab) ? k.tab.includes(tab) : k.tab === tab;
  });
}

export function getKpiDetailKind(key: keyof PosDashboardSnapshot): KpiDetailKind | undefined
{
  return KPI_DEFINITIONS.find((k) => k.key === key)?.detail;
}
