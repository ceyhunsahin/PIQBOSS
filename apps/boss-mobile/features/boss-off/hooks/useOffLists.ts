import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useBootstrap } from '@/lib/bootstrap';
import type { DateRange } from '@/lib/dateRange';
import type { OffTabId } from '@/lib/offTabStore';
import {
  loadOffOrders,
  loadOffShipments,
  loadOffCustomers,
  loadOffMargin,
  loadOffCharts,
  type OffOrdersBundle,
  type OffShipmentsBundle,
  type OffCustomersBundle,
  type OffMarginBundle,
  type OffChartsBundle
} from '../fetchOffLists';

export type OffListsState = {
  orders?: OffOrdersBundle;
  shipments?: OffShipmentsBundle;
  customers?: OffCustomersBundle;
  margin?: OffMarginBundle;
  charts?: OffChartsBundle;
};

const LIST_TABS: OffTabId[] = ['orders', 'shipments', 'customers', 'margin', 'charts'];

export function useOffLists(range: DateRange, tab: OffTabId, reloadToken: number)
{
  const authStatus = useAuth((s) => s.status);
  const serverUrl = useBootstrap((s) => s.serverUrl);
  const [lists, setLists] = useState<OffListsState>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Record<string, boolean>>({});
  const abortRef = useRef<{ cancelled: boolean } | null>(null);
  useEffect(() =>
  {
    if(authStatus !== 'authed' || !serverUrl || !range.from || !range.to)
    {
      return;
    }
    if(!LIST_TABS.includes(tab))
    {
      return;
    }
    const key = `${tab}|${serverUrl}|${range.from}|${range.to}|${reloadToken}`;
    if(cacheRef.current[key])
    {
      return;
    }
    cacheRef.current[key] = true;
    const token = { cancelled: false };
    abortRef.current = token;
    setPending(true);
    setError(null);
    (async () =>
    {
      try
      {
        if(tab === 'orders')
        {
          const data = await loadOffOrders(serverUrl, range);
          if(!token.cancelled)
          {
            setLists((prev) => ({ ...prev, orders: data }));
          }
        }
        else if(tab === 'shipments')
        {
          const data = await loadOffShipments(serverUrl, range);
          if(!token.cancelled)
          {
            setLists((prev) => ({ ...prev, shipments: data }));
          }
        }
        else if(tab === 'customers')
        {
          const data = await loadOffCustomers(serverUrl, range);
          if(!token.cancelled)
          {
            setLists((prev) => ({ ...prev, customers: data }));
          }
        }
        else if(tab === 'margin')
        {
          const data = await loadOffMargin(serverUrl, range);
          if(!token.cancelled)
          {
            setLists((prev) => ({ ...prev, margin: data }));
          }
        }
        else if(tab === 'charts')
        {
          const data = await loadOffCharts(serverUrl, range);
          if(!token.cancelled)
          {
            setLists((prev) => ({ ...prev, charts: data }));
          }
        }
      }
      catch(e)
      {
        if(!token.cancelled)
        {
          cacheRef.current[key] = false;
          setError(e as Error);
        }
      }
      finally
      {
        if(!token.cancelled)
        {
          setPending(false);
        }
      }
    })();
    return () =>
    {
      token.cancelled = true;
    };
  }, [authStatus, serverUrl, range.from, range.to, tab, reloadToken]);
  useEffect(() => () =>
  {
    if(abortRef.current)
    {
      abortRef.current.cancelled = true;
    }
  }, []);
  const invalidate = useCallback(() =>
  {
    cacheRef.current = {};
  }, []);
  return { lists, pending, error, invalidate };
}
