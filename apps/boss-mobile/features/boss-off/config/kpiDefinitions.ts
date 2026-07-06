import type { OffDashboardSnapshot } from '@piqboss/shared';
import type { OffTabId } from '@/lib/offTabStore';

export type OffKpiFormat = 'currency' | 'number' | 'percent';

export type OffKpiDef = {
  key: keyof OffDashboardSnapshot;
  labelKey: string;
  format: OffKpiFormat;
  icon: string;
  accent: string;
  wide?: boolean;
};

export const OFF_OVERVIEW_KPIS: OffKpiDef[] = [
  { key: 'orderTotal', labelKey: 'orderAmount', format: 'currency', icon: '🛒', accent: '#007bff' },
  { key: 'salesTotal', labelKey: 'invoiceAmount', format: 'currency', icon: '🧾', accent: '#28a745' },
  { key: 'totalDebt', labelKey: 'totalReceivable', format: 'currency', icon: '💳', accent: '#dc3545' },
  { key: 'encaissement', labelKey: 'encaissement', format: 'currency', icon: '💰', accent: '#17a2b8' },
  { key: 'openSalesRemaining', labelKey: 'openSalesInvoices', format: 'currency', icon: '📄', accent: '#6f42c1' },
  { key: 'incompleteOrdersQty', labelKey: 'incompleteShipments', format: 'number', icon: '📦', accent: '#fd7e14' },
  { key: 'purchaseTotal', labelKey: 'purchaseTotal', format: 'currency', icon: '📥', accent: '#224379' },
  { key: 'openPurchaseRemaining', labelKey: 'openPurchaseInvoices', format: 'currency', icon: '🗂️', accent: '#20c997' }
];

const OFF_ORDERS_KPIS: OffKpiDef[] = [
  { key: 'pendingOrderTotal', labelKey: 'pendingOrders', format: 'currency', icon: '🛒', accent: '#007bff' },
  { key: 'pendingOrderCount', labelKey: 'count', format: 'number', icon: '🔢', accent: '#6c757d' },
  { key: 'activeOfferTotal', labelKey: 'pendingOffers', format: 'currency', icon: '📝', accent: '#6f42c1' },
  { key: 'activeOfferCount', labelKey: 'count', format: 'number', icon: '🔢', accent: '#6c757d' }
];

const OFF_SHIPMENTS_KPIS: OffKpiDef[] = [
  { key: 'pendingShipmentTotal', labelKey: 'pendingShipments', format: 'currency', icon: '📦', accent: '#fd7e14' },
  { key: 'pendingShipmentCount', labelKey: 'count', format: 'number', icon: '🔢', accent: '#6c757d' },
  { key: 'salesTotal', labelKey: 'invoiceAmount', format: 'currency', icon: '🧾', accent: '#28a745' },
  { key: 'openSalesRemaining', labelKey: 'openSalesInvoices', format: 'currency', icon: '📄', accent: '#6f42c1' }
];

const OFF_CUSTOMERS_KPIS: OffKpiDef[] = [
  { key: 'totalDebt', labelKey: 'totalReceivable', format: 'currency', icon: '💳', accent: '#dc3545' },
  { key: 'totalPaid', labelKey: 'totalCollection', format: 'currency', icon: '💰', accent: '#17a2b8' },
  { key: 'netBalance', labelKey: 'netBalance', format: 'currency', icon: '⚖️', accent: '#224379' },
  { key: 'encaissement', labelKey: 'encaissement', format: 'currency', icon: '🧾', accent: '#28a745' }
];

const OFF_MARGIN_KPIS: OffKpiDef[] = [
  { key: 'marginSales', labelKey: 'sales', format: 'currency', icon: '🧾', accent: '#28a745' },
  { key: 'marginCost', labelKey: 'cost', format: 'currency', icon: '🏷️', accent: '#dc3545' },
  { key: 'marginProfit', labelKey: 'margin', format: 'currency', icon: '📈', accent: '#007bff' },
  { key: 'marginPercent', labelKey: 'marginPercent', format: 'percent', icon: '％', accent: '#6f42c1' }
];

export const OFF_TAB_KPIS: Partial<Record<OffTabId, OffKpiDef[]>> = {
  orders: OFF_ORDERS_KPIS,
  shipments: OFF_SHIPMENTS_KPIS,
  customers: OFF_CUSTOMERS_KPIS,
  margin: OFF_MARGIN_KPIS
};
