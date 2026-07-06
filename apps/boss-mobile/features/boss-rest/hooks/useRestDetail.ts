import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBootstrap } from '@/lib/bootstrap';
import type { DateRange } from '@/lib/dateRange';
import { formatCurrency, formatNumber } from '@/lib/format';
import {
  loadRestWaiterDetail,
  loadRestZoneDetail,
  loadRestPropertyDetail,
  loadRestOrderDetails,
  loadRestWaitingDetails,
  loadRestCompletedDetails,
  loadRestUnprintedDetails,
  loadRestAvgOrderDetails,
  loadRestTableList,
  loadRestProductGroupItems,
  type RestDetailRow
} from '../fetchRestLists';
import type { DetailContent } from '@/features/boss-pos/detail/types';

export function useRestDetail(range: DateRange)
{
  const { t } = useTranslation();
  const serverUrl = useBootstrap((s) => s.serverUrl);
  const dr = (key: string): string => t(`dashboardRest.${key}`);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<DetailContent | null>(null);
  const close = useCallback(() =>
  {
    setVisible(false);
  }, []);
  const buildRows = useCallback((items: RestDetailRow[]) =>
  {
    return items.map((it) => ({
      label: it.item ? it.item : `${dr('orderRef')} ${it.ref}`,
      value: formatCurrency(it.total),
      sub: [it.date, it.zone, it.person, it.qty != null ? `${dr('quantity')}: ${formatNumber(it.qty)}` : '']
        .filter(Boolean)
        .join(' · ')
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);
  const open = useCallback(async (title: string, subtitle: string, loader: () => Promise<RestDetailRow[]>) =>
  {
    if(!serverUrl)
    {
      return;
    }
    setVisible(true);
    setLoading(true);
    setContent({ title, subtitle, sections: [] });
    try
    {
      const items = await loader();
      setContent({
        title,
        subtitle,
        sections: [{ title: dr('details'), emptyText: dr('loading'), rows: buildRows(items) }]
      });
    }
    catch
    {
      setContent({ title, subtitle, sections: [{ title: dr('details'), rows: [] }] });
    }
    finally
    {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUrl, buildRows]);
  const openWaiter = useCallback((name: string) =>
    open(name, dr('waiterPerformance'), () => loadRestWaiterDetail(serverUrl ?? '', range, name)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [open, serverUrl, range]);
  const openZone = useCallback((name: string) =>
    open(name, dr('zoneSales'), () => loadRestZoneDetail(serverUrl ?? '', range, name)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [open, serverUrl, range]);
  const openProperty = useCallback((name: string) =>
    open(name, dr('popularProperties'), () => loadRestPropertyDetail(serverUrl ?? '', range, name)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [open, serverUrl, range]);
  const openOrders = useCallback(() =>
    open(dr('dailyOrderCount'), dr('details'), () => loadRestOrderDetails(serverUrl ?? '', range)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [open, serverUrl, range]);
  const openWaiting = useCallback(() =>
    open(dr('waitingOrders'), dr('details'), () => loadRestWaitingDetails(serverUrl ?? '', range)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [open, serverUrl, range]);
  const openCompleted = useCallback(() =>
    open(dr('completedOrders'), dr('details'), () => loadRestCompletedDetails(serverUrl ?? '', range)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [open, serverUrl, range]);
  const openUnprinted = useCallback(() =>
    open(dr('unprintedOrders'), dr('details'), () => loadRestUnprintedDetails(serverUrl ?? '', range)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [open, serverUrl, range]);
  const openAvgOrders = useCallback((avg: number) =>
    open(dr('avgOrderAmount'), dr('details'), () => loadRestAvgOrderDetails(serverUrl ?? '', range, avg)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [open, serverUrl, range]);
  const openTables = useCallback(async () =>
  {
    if(!serverUrl)
    {
      return;
    }
    setVisible(true);
    setLoading(true);
    setContent({ title: dr('tableOccupancy'), subtitle: dr('tables'), sections: [] });
    try
    {
      const items = await loadRestTableList(serverUrl, range);
      setContent({
        title: dr('tableOccupancy'),
        subtitle: dr('tables'),
        sections: [{
          title: dr('tables'),
          emptyText: dr('loading'),
          rows: items.map((it) => ({
            label: it.name || it.code,
            value: it.occupied ? dr('completed') : '—',
            sub: `${formatNumber(it.orderCount)} ${dr('orders')}`,
            accent: it.occupied ? '#20c997' : undefined
          }))
        }]
      });
    }
    catch
    {
      setContent({ title: dr('tableOccupancy'), subtitle: dr('tables'), sections: [{ title: dr('tables'), rows: [] }] });
    }
    finally
    {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUrl, range]);
  const openProductGroup = useCallback(async (groupName: string) =>
  {
    if(!serverUrl)
    {
      return;
    }
    setVisible(true);
    setLoading(true);
    setContent({ title: groupName, subtitle: dr('details'), sections: [] });
    try
    {
      const items = await loadRestProductGroupItems(serverUrl, range, groupName);
      setContent({
        title: groupName,
        subtitle: dr('details'),
        sections: [{
          title: dr('details'),
          emptyText: dr('loading'),
          rows: items.map((it) => ({
            label: it.name,
            value: formatCurrency(it.amount),
            sub: `${it.code} · ${dr('quantity')}: ${formatNumber(it.qty)}`
          }))
        }]
      });
    }
    catch
    {
      setContent({ title: groupName, subtitle: dr('details'), sections: [{ title: dr('details'), rows: [] }] });
    }
    finally
    {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUrl, range]);
  return { visible, loading, content, openWaiter, openZone, openProperty, openOrders, openWaiting, openCompleted, openUnprinted, openAvgOrders, openTables, openProductGroup, close };
}
