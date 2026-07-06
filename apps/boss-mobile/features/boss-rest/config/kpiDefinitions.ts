import type { RestDashboardSnapshot } from '@piqboss/shared';

export type RestKpiFormat = 'currency' | 'number' | 'percent' | 'minutes';

export type RestKpiDef = {
  key: keyof RestDashboardSnapshot;
  labelKey: string;
  format: RestKpiFormat;
  icon: string;
  accent: string;
};

export const REST_OVERVIEW_KPIS: RestKpiDef[] = [
  { key: 'orderTotal', labelKey: 'dailyOrderTotal', format: 'currency', icon: '🧾', accent: '#28a745' },
  { key: 'orderCount', labelKey: 'dailyOrderCount', format: 'number', icon: '🔢', accent: '#007bff' },
  { key: 'avgOrder', labelKey: 'avgOrderAmount', format: 'currency', icon: '📊', accent: '#17a2b8' },
  { key: 'occupancyRate', labelKey: 'tableOccupancy', format: 'percent', icon: '🪑', accent: '#6f42c1' },
  { key: 'waitingOrders', labelKey: 'waitingOrders', format: 'number', icon: '⏳', accent: '#fd7e14' },
  { key: 'completedOrders', labelKey: 'completedOrders', format: 'number', icon: '✅', accent: '#20c997' },
  { key: 'unprintedOrders', labelKey: 'unprintedOrders', format: 'number', icon: '🖨️', accent: '#dc3545' },
  { key: 'totalGuests', labelKey: 'totalGuests', format: 'number', icon: '👥', accent: '#224379' },
  { key: 'avgPerPerson', labelKey: 'avgPerPerson', format: 'currency', icon: '🍽️', accent: '#e83e8c' },
  { key: 'avgPerTable', labelKey: 'avgPerTable', format: 'currency', icon: '🪑', accent: '#795548' },
  { key: 'dailyDiscount', labelKey: 'dailyDiscount', format: 'currency', icon: '🏷️', accent: '#ffc107' },
  { key: 'avgServiceTime', labelKey: 'avgServiceTime', format: 'minutes', icon: '⏱️', accent: '#6c757d' }
];
