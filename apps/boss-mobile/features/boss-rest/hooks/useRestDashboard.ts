import { useCallback, useEffect, useRef, useState } from 'react';
import type { RestDashboardSnapshot } from '@piqboss/shared';
import { useAuth } from '@/lib/auth';
import { useBootstrap } from '@/lib/bootstrap';
import type { DateRange } from '@/lib/dateRange';
import { loadRestDashboardKpis } from '../fetchRestDashboard';
import { REST_DASHBOARD_QUERIES } from '../queries';

const EMPTY: RestDashboardSnapshot = {
  orderTotal: 0,
  orderCount: 0,
  avgOrder: 0,
  waitingOrders: 0,
  completedOrders: 0,
  occupancyRate: 0,
  occupiedTables: 0,
  totalTables: 0,
  unprintedOrders: 0,
  dailyDiscount: 0,
  avgPerPerson: 0,
  avgPerTable: 0,
  openTables: 0,
  totalGuests: 0,
  avgServiceTime: 0
};

export function useRestDashboard(range: DateRange)
{
  const authStatus = useAuth((s) => s.status);
  const serverUrl = useBootstrap((s) => s.serverUrl);
  const [data, setData] = useState<RestDashboardSnapshot>(EMPTY);
  const [loadedCount, setLoadedCount] = useState(0);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadedKeyRef = useRef('');
  const patch = useCallback((partial: Partial<RestDashboardSnapshot>) =>
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
      await loadRestDashboardKpis(serverUrl, range, patch, signal);
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
    totalCount: REST_DASHBOARD_QUERIES.length,
    error,
    reload
  };
}
