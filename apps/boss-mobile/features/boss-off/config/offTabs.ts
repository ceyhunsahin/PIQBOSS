import type { OffTabId } from '@/lib/offTabStore';

export type OffTabDef = {
  id: OffTabId;
  labelKey: string;
  iconOutline: string;
  iconFilled: string;
};

export const OFF_TABS: OffTabDef[] = [
  { id: 'overview', labelKey: 'overview', iconOutline: 'speedometer-outline', iconFilled: 'speedometer' },
  { id: 'orders', labelKey: 'ordersOffers', iconOutline: 'document-text-outline', iconFilled: 'document-text' },
  { id: 'shipments', labelKey: 'shipmentsInvoices', iconOutline: 'cube-outline', iconFilled: 'cube' },
  { id: 'customers', labelKey: 'customers', iconOutline: 'people-outline', iconFilled: 'people' },
  { id: 'margin', labelKey: 'profitMargin', iconOutline: 'trending-up-outline', iconFilled: 'trending-up' },
  { id: 'charts', labelKey: 'charts', iconOutline: 'bar-chart-outline', iconFilled: 'bar-chart' }
];
