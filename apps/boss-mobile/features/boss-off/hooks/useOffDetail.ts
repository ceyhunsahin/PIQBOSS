import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBootstrap } from '@/lib/bootstrap';
import type { DateRange } from '@/lib/dateRange';
import { formatCurrency, formatNumber } from '@/lib/format';
import { useTDash } from '@/lib/i18n';
import { exportDetailPdf } from '@/lib/pdfExport';
import { shareToWhatsApp } from '@/lib/whatsapp';
import {
  loadOffMarginGroupDetail,
  loadOffCustomerExtre,
  loadOffEncaissementList,
  loadOffOpenSalesInvoices,
  loadOffOpenPurchaseInvoices,
  loadOffIncompleteOrders,
  loadOffDocLines,
  loadOffCustomerPhone,
  loadOffCustomerSummary,
  loadOffCustomerOpenDocs
} from '../fetchOffLists';
import type { DetailContent, DetailRow } from '@/features/boss-pos/detail/types';

export function useOffDetail(range: DateRange)
{
  const { t, i18n } = useTranslation();
  const serverUrl = useBootstrap((s) => s.serverUrl);
  const dash = useTDash();
  const dl = (key: string): string => t(`dashboardOff.${key}`);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContentState] = useState<DetailContent | null>(null);
  const phoneRef = useRef('');
  const contentRef = useRef<DetailContent | null>(null);
  const setDetail = useCallback((next: DetailContent | null) =>
  {
    contentRef.current = next;
    setContentState(next);
  }, []);
  const close = useCallback(() =>
  {
    setVisible(false);
  }, []);
  const exportPdf = useCallback(async () =>
  {
    const c = contentRef.current;
    if(!c)
    {
      return;
    }
    try
    {
      const flat = c.tabs ? { ...c, sections: c.tabs.flatMap((tb) => tb.sections) } : c;
      await exportDetailPdf(flat);
    }
    catch
    {
      /* cancelled */
    }
  }, []);
  const shareWhatsApp = useCallback(async () =>
  {
    const c = contentRef.current;
    if(!c)
    {
      return;
    }
    const lines: string[] = [`*${c.title}*`];
    if(c.subtitle)
    {
      lines.push(c.subtitle);
    }
    const shareSections = c.tabs ? c.tabs.flatMap((tb) => tb.sections) : c.sections;
    shareSections.forEach((section) =>
    {
      lines.push('', section.title);
      if(section.rows.length === 0)
      {
        lines.push(section.emptyText ?? dash('noData'));
        return;
      }
      section.rows.forEach((row) =>
      {
        const sub = row.sub ? ` (${row.sub})` : '';
        const val = row.value ? ` : ${row.value}` : '';
        lines.push(`• ${row.label}${val}${sub}`);
      });
    });
    await shareToWhatsApp(lines.join('\n'), phoneRef.current);
  }, [dash]);
  const openMarginGroup = useCallback(async (groupName: string) =>
  {
    if(!serverUrl)
    {
      return;
    }
    setVisible(true);
    setLoading(true);
    setDetail({ title: groupName, subtitle: dash('groupDetail'), sections: [] });
    try
    {
      const items = await loadOffMarginGroupDetail(serverUrl, range, groupName);
      setDetail({
        title: groupName,
        subtitle: dash('groupDetail'),
        sections: [
          {
            title: dash('items'),
            emptyText: dash('noGroupDetailFound'),
            rows: items.map((it) => ({
              label: it.name,
              value: formatCurrency(it.total),
              sub: `${it.code} · ${dash('quantity')}: ${formatNumber(it.qty)}`,
              accent: it.total < 0 ? '#dc3545' : undefined
            }))
          }
        ]
      });
    }
    catch
    {
      setDetail({
        title: groupName,
        subtitle: dash('groupDetail'),
        sections: [{ title: dash('items'), emptyText: dash('noGroupDetailFound'), rows: [] }]
      });
    }
    finally
    {
      setLoading(false);
    }
  }, [serverUrl, range, dash]);
  const openCustomerExtre = useCallback(async (code: string, name: string) =>
  {
    if(!serverUrl || !code)
    {
      return;
    }
    phoneRef.current = '';
    setVisible(true);
    setLoading(true);
    setDetail({ title: name || code, subtitle: dl('customerHistory'), sections: [] });
    try
    {
      const lang = (i18n.language || 'fr').slice(0, 2);
      const [items, summary, openDocs] = await Promise.all([
        loadOffCustomerExtre(serverUrl, range, code, lang),
        loadOffCustomerSummary(serverUrl, code),
        loadOffCustomerOpenDocs(serverUrl, code)
      ]);
      if(summary?.phone)
      {
        phoneRef.current = summary.phone;
      }
      const balance = summary?.balance ?? 0;
      const openTotal = openDocs.reduce((acc, d) => acc + d.balance, 0);
      const summarySection = {
        title: dl('summary'),
        rows: [
          {
            label: dl('currentBalance'),
            value: formatCurrency(balance),
            sub: balance >= 0 ? dl('receivable') : dl('payable'),
            accent: balance > 0 ? '#dc3545' : '#28a745'
          },
          {
            label: dl('openAmount'),
            value: formatCurrency(openTotal),
            sub: `${openDocs.length} ${dl('openDocuments')}`,
            accent: openTotal > 0 ? '#fd7e14' : undefined
          }
        ]
      };
      const openDocsSection = {
        title: dl('openDocuments'),
        collapsible: true,
        defaultCollapsed: openDocs.length === 0,
        headerValue: formatCurrency(openTotal),
        emptyText: dl('noOpenDocsFound'),
        rows: openDocs.map((d) => ({
          label: d.ref,
          value: formatCurrency(d.balance),
          sub: d.date,
          accent: '#fd7e14'
        }))
      };
      const typeLabel = (it: { tag: string; typeName: string; ref: string }): string =>
      {
        if(it.tag)
        {
          const key = `dashboardOff.docType.${it.tag}`;
          const tr = t(key);
          if(tr !== key)
          {
            return tr;
          }
        }
        return it.typeName || it.ref;
      };
      const monthLabel = (key: string): string =>
      {
        const [y, m] = key.split('-').map((n) => parseInt(n, 10));
        if(!y || !m)
        {
          return key;
        }
        try
        {
          return new Intl.DateTimeFormat(i18n.language || 'fr', { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1));
        }
        catch
        {
          return key;
        }
      };
      const order: string[] = [];
      const grouped = new Map<string, typeof items>();
      items.forEach((it) =>
      {
        const k = it.monthKey || it.date.slice(0, 7);
        if(!grouped.has(k))
        {
          grouped.set(k, []);
          order.push(k);
        }
        grouped.get(k)!.push(it);
      });
      const extreSections = order.length === 0 ?
        [{ title: dl('customerHistory'), emptyText: dash('noData'), rows: [] }] :
        order.map((k) =>
        {
          const monthRows = grouped.get(k)!;
          const net = monthRows.reduce((acc, it) => acc + it.balance, 0);
          return {
            title: `${dl('customerHistory')} · ${monthLabel(k)}`,
            collapsible: true,
            defaultCollapsed: true,
            headerValue: formatCurrency(net),
            emptyText: dash('noData'),
            rows: monthRows.map((it) => ({
              label: typeLabel(it),
              value: formatCurrency(it.balance),
              sub: `${it.date} · ${it.ref}`,
              accent: it.balance < 0 ? '#dc3545' : '#28a745'
            }))
          };
        });
      setDetail({
        title: name || code,
        subtitle: dl('customerHistory'),
        sections: [summarySection, openDocsSection, ...extreSections]
      });
    }
    catch
    {
      setDetail({
        title: name || code,
        subtitle: dl('customerHistory'),
        sections: [{ title: dl('customerHistory'), emptyText: dash('noData'), rows: [] }]
      });
    }
    finally
    {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUrl, range, dash, i18n.language]);
  const runDetail = useCallback(async (title: string, subtitle: string, loader: () => Promise<DetailRow[]>) =>
  {
    if(!serverUrl)
    {
      return;
    }
    setVisible(true);
    setLoading(true);
    setDetail({ title, subtitle, sections: [] });
    try
    {
      const rows = await loader();
      setDetail({ title, subtitle, sections: [{ title: subtitle, emptyText: dash('noData'), rows }] });
    }
    catch
    {
      setDetail({ title, subtitle, sections: [{ title: subtitle, emptyText: dash('noData'), rows: [] }] });
    }
    finally
    {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUrl]);
  const openEncaissement = useCallback(() =>
    runDetail(dl('encaissement'), dl('encaissement'), async () =>
      (await loadOffEncaissementList(serverUrl ?? '', range)).map((r) => ({
        label: r.ref,
        value: formatCurrency(r.amount),
        sub: r.linked ? `${r.date} · ${r.linked}` : r.date
      }))),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [runDetail, serverUrl, range]);
  const openOpenSalesInvoices = useCallback(() =>
    runDetail(dl('openSalesInvoices'), dl('openSalesInvoices'), async () =>
      (await loadOffOpenSalesInvoices(serverUrl ?? '', range)).map((r) => ({
        label: r.party || r.ref,
        value: formatCurrency(r.remainder),
        sub: `${r.ref} · ${r.date} · ${formatCurrency(r.total)}`,
        accent: '#6f42c1'
      }))),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [runDetail, serverUrl, range]);
  const openOpenPurchaseInvoices = useCallback(() =>
    runDetail(dl('openPurchaseInvoices'), dl('openPurchaseInvoices'), async () =>
      (await loadOffOpenPurchaseInvoices(serverUrl ?? '', range)).map((r) => ({
        label: r.party || r.ref,
        value: formatCurrency(r.remainder),
        sub: `${r.ref} · ${r.date} · ${formatCurrency(r.total)}`,
        accent: '#20c997'
      }))),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [runDetail, serverUrl, range]);
  const openIncompleteOrders = useCallback(() =>
    runDetail(dl('incompleteShipments'), dl('incompleteShipments'), async () =>
      (await loadOffIncompleteOrders(serverUrl ?? '', range)).map((r) => ({
        label: r.supplier || r.ref,
        value: `${formatNumber(r.pend)} / ${formatNumber(r.qty)}`,
        sub: `${r.ref} · ${r.date}`,
        accent: '#fd7e14'
      }))),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [runDetail, serverUrl, range]);
  const openDocLines = useCallback(async (docType: number, guid: string, ref: string, customer: string, code: string) =>
  {
    if(!serverUrl || !guid)
    {
      return;
    }
    const title = customer || ref;
    phoneRef.current = '';
    setVisible(true);
    setLoading(true);
    setDetail({ title, subtitle: ref, sections: [] });
    try
    {
      const [lines, phone] = await Promise.all([
        loadOffDocLines(serverUrl, docType, guid),
        code ? loadOffCustomerPhone(serverUrl, code) : Promise.resolve('')
      ]);
      phoneRef.current = phone;
      const totalTtc = lines.reduce((acc, l) => acc + l.total, 0);
      const hasPend = lines.some((l) => l.pend > 0);
      setDetail({
        title,
        subtitle: ref,
        sections: [
          {
            title: dl('detail'),
            rows: [
              { label: dl('reference'), value: ref },
              { label: dl('total'), value: formatCurrency(totalTtc), accent: '#6f42c1' }
            ]
          },
          {
            title: dl('items'),
            emptyText: dl('noItemsFound'),
            rows: lines.map((l) =>
            {
              const base = `${formatNumber(l.qty)} ${l.unit} × ${formatCurrency(l.price)}`;
              return {
                label: l.name || l.code,
                value: formatCurrency(l.total),
                sub: hasPend && l.pend > 0 ? `${base} · ${dl('incompleteShipments')}: ${formatNumber(l.pend)}` : base
              };
            })
          }
        ]
      });
    }
    catch
    {
      setDetail({
        title,
        subtitle: ref,
        sections: [{ title: dl('items'), emptyText: dl('noItemsFound'), rows: [] }]
      });
    }
    finally
    {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUrl, dash]);
  return { visible, loading, content, openMarginGroup, openCustomerExtre, openEncaissement, openOpenSalesInvoices, openOpenPurchaseInvoices, openIncompleteOrders, openDocLines, exportPdf, shareWhatsApp, close };
}
