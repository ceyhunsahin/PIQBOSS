import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useBootstrap } from '@/lib/bootstrap';
import type { DateRange } from '@/lib/dateRange';
import type { RestTabId } from '@/lib/restTabStore';
import {
  loadRestOverview,
  loadRestCharts,
  loadRestOperations,
  type RestOverviewBundle,
  type RestChartsBundle,
  type RestOperationsBundle
} from '../fetchRestLists';

export type RestListsState = {
  overview?: RestOverviewBundle;
  charts?: RestChartsBundle;
  operations?: RestOperationsBundle;
};

export function useRestLists(range: DateRange, tab: RestTabId, reloadToken: number)
{
  const authStatus = useAuth((s) => s.status);
  const serverUrl = useBootstrap((s) => s.serverUrl);
  const [lists, setLists] = useState<RestListsState>({});
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
        if(tab === 'overview')
        {
          const data = await loadRestOverview(serverUrl, range);
          if(!token.cancelled)
          {
            setLists((prev) => ({ ...prev, overview: data }));
          }
        }
        else if(tab === 'charts')
        {
          const data = await loadRestCharts(serverUrl, range);
          if(!token.cancelled)
          {
            setLists((prev) => ({ ...prev, charts: data }));
          }
        }
        else if(tab === 'operations')
        {
          const data = await loadRestOperations(serverUrl, range);
          if(!token.cancelled)
          {
            setLists((prev) => ({ ...prev, operations: data }));
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
