import type { PosTabId } from '@/lib/posTabStore';

export type PosTabDef = {
  id: PosTabId;
  labelKey: string;
  scope: 'root' | 'dashboard';
  iconOutline: string;
  iconFilled: string;
};

export const POS_TABS: PosTabDef[] = [
  { id: 'overview', labelKey: 'overview', scope: 'root', iconOutline: 'speedometer-outline', iconFilled: 'speedometer' },
  { id: 'sales', labelKey: 'sales', scope: 'root', iconOutline: 'cart-outline', iconFilled: 'cart' },
  { id: 'charts', labelKey: 'charts', scope: 'root', iconOutline: 'bar-chart-outline', iconFilled: 'bar-chart' },
  { id: 'operations', labelKey: 'operations', scope: 'root', iconOutline: 'repeat-outline', iconFilled: 'repeat' },
  { id: 'margin', labelKey: 'marginStats', scope: 'dashboard', iconOutline: 'trending-up-outline', iconFilled: 'trending-up' },
  { id: 'comparison', labelKey: 'comparison', scope: 'dashboard', iconOutline: 'swap-horizontal-outline', iconFilled: 'swap-horizontal' }
];

export function posTabLabel(tab: PosTabDef, t: (key: string) => string, dash: (key: string) => string): string
{
  if(tab.scope === 'dashboard')
  {
    return dash(tab.labelKey);
  }
  return t(tab.labelKey);
}
