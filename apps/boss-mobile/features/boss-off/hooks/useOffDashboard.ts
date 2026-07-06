import { useCallback, useEffect, useRef, useState } from 'react';
import type { OffDashboardSnapshot } from '@piqboss/shared';
import { useAuth } from '@/lib/auth';
import { useBootstrap } from '@/lib/bootstrap';
import type { DateRange } from '@/lib/dateRange';
import { loadOffDashboardKpis } from '../fetchOffDashboard';
import { OFF_DASHBOARD_QUERIES } from '../queries';

const EMPTY: OffDashboardSnapshot = {
  orderTotal: 0,
  orderCount: 0,
  orderAvg: 0,
  salesTotal: 0,
  salesCount: 0,
  salesAvg: 0,
  purchaseTotal: 0,
  purchaseCount: 0,
  totalDebt: 0,
  totalPaid: 0,
  netBalance: 0,
  encaissement: 0,
  openSalesCount: 0,
  openSalesRemaining: 0,
  openPurchaseCount: 0,
  openPurchaseRemaining: 0,
  incompleteOrdersCount: 0,
  incompleteOrdersQty: 0,
  pendingOrderCount: 0,
  pendingOrderTotal: 0,
  activeOfferCount: 0,
  activeOfferTotal: 0,
  pendingShipmentCount: 0,
  pendingShipmentTotal: 0,
  marginSales: 0,
  marginCost: 0,
  marginProfit: 0,
  marginPercent: 0
};

export function useOffDashboard(range: DateRange)
{
  const authStatus = useAuth((s) => s.status);
  const serverUrl = useBootstrap((s) => s.serverUrl);
  const [data, setData] = useState<OffDashboardSnapshot>(EMPTY);
  const [loadedCount, setLoadedCount] = useState(0);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadedKeyRef = useRef('');
  const patch = useCallback((partial: Partial<OffDashboardSnapshot>) =>
  {
    setData((prev) => ({ ...prev, ...partial }));
    setLoadedCount((c) => c + 1);
  }, []);
  const runLoad = useCallback(async (force: boolean) =>
  {
    if(authStatus !== 'authed' || !serverUrl || !range.from || !range.to)
    {
      return;
    }
    const key = `${serverUrl}|${range.from}|${range.to}`;
    if(!force && loadedKeyRef.current === key)
    {
      return;
    }
    loadedKeyRef.current = key;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;
    setData(EMPTY);
    setLoadedCount(0);
    setError(null);
    setPending(true);
    try
    {
      await loadOffDashboardKpis(serverUrl, range, patch, signal);
    }
    catch(e)
    {
      if(!signal.aborted)
      {
        setError(e as Error);
      }
    }
    finally
    {
      if(!signal.aborted)
      {
        setPending(false);
      }
    }
  }, [authStatus, serverUrl, range.from, range.to, patch]);
  const reload = useCallback(async () =>
  {
    await runLoad(true);
  }, [runLoad]);
  useEffect(() =>
  {
    const timer = setTimeout(() =>
    {
      void runLoad(false);
    }, 150);
    return () =>
    {
      clearTimeout(timer);
    };
  }, [runLoad]);
  useEffect(() => () =>
  {
    abortRef.current?.abort();
  }, []);
  return {
    data,
    pending,
    loadedCount,
    totalCount: OFF_DASHBOARD_QUERIES.length,
    error,
    reload
  };
}
