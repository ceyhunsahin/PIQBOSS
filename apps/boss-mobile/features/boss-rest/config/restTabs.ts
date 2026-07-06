import type { RestTabId } from '@/lib/restTabStore';

export type RestTabDef = {
  id: RestTabId;
  labelKey: string;
  iconOutline: string;
  iconFilled: string;
};

export const REST_TABS: RestTabDef[] = [
  { id: 'overview', labelKey: 'overview', iconOutline: 'speedometer-outline', iconFilled: 'speedometer' },
  { id: 'charts', labelKey: 'charts', iconOutline: 'bar-chart-outline', iconFilled: 'bar-chart' },
  { id: 'operations', labelKey: 'operations', iconOutline: 'restaurant-outline', iconFilled: 'restaurant' }
];
