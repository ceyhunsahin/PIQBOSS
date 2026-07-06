import { useCallback, useState } from 'react';
import type { PosDashboardSnapshot } from '@piqboss/shared';
import type { DateRange } from '@/lib/dateRange';
import { formatRangeLabel, getDatePreset } from '@/lib/dateRange';
import { formatCurrency, formatNumber, formatQuantity } from '@/lib/format';
import { exportDetailPdf } from '@/lib/pdfExport';
import { shareToWhatsApp } from '@/lib/whatsapp';
import i18n, { tDash } from '@/lib/i18n';
import { emptyLabel } from '@/lib/uiText';
import type { PosListsBundle } from '../fetchPosLists';
import { buildKpiDetailContent } from '../detail/buildKpiDetail';
import type { KpiDef } from '../config/kpiDefinitions';
import { getKpiDetailKind } from '../config/kpiDefinitions';
import type { DetailContent } from '../detail/types';
import {
  buildKpiCompareContent,
  fetchKpiCompareValue,
  fetchLowMarginProducts,
  fetchRedTagItems,
  fetchUnsoldLossProducts,
  fetchZeroCostItems,
  mapLowMarginRows,
  mapRedTagRows,
  mapZeroCostRows
} from '../detail/fetchExtraDashboard';
import {
  fetchButcherChanges,
  fetchDiscountDetail,
  fetchGlobalLossItems,
  fetchGroupLossItems,
  fetchItemBarcodes,
  fetchItemMarginDetail,
  fetchItemPurchaseHistory,
  fetchItemSalesChart,
  fetchItemSalesHistory,
  fetchMarginDetailByGroup,
  fetchPopConfirmeDetail,
  fetchPopConfirmeUsers,
  fetchPopNonTraiteDetail,
  fetchPopSupprimeDetail,
  fetchPopUncheckedUsers,
  fetchPosDevices,
  fetchPosUserDetails,
  fetchPosUsersBySafe,
  fetchPromoMarginDetail,
  mapButcherChangeRows,
  mapMarginDetailRows,
  mapPromoDetailRows
} from '../detail/fetchDetailQueries';
import type { DetailBack } from '../detail/types';

type SearchItem = { GUID?: string; CODE?: string; NAME?: string; MAIN_GRP_NAME?: string };

function num(v: unknown): number
{
  const n = parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : 0;
}
function parseFrDate(s: string): number | null
{
  const m = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/.exec(String(s ?? '').trim());
  if(!m)
  {
    return null;
  }
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), Number(m[4]), Number(m[5]));
  const t = d.getTime();
  return Number.isFinite(t) ? t : null;
}
function elapsedLabel(from: string, to: string): string
{
  const a = parseFrDate(from);
  const b = parseFrDate(to);
  if(a == null || b == null || b < a)
  {
    return '';
  }
  let mins = Math.round((b - a) / 60000);
  const days = Math.floor(mins / 1440);
  mins -= days * 1440;
  const hours = Math.floor(mins / 60);
  mins -= hours * 60;
  const parts: string[] = [];
  if(days > 0)
  {
    parts.push(`${days}g`);
  }
  if(hours > 0)
  {
    parts.push(`${hours}s`);
  }
  parts.push(`${mins}dk`);
  return parts.join(' ');
}

type DashLists = Pick<PosListsBundle, 'payments' | 'vat' | 'devices' | 'trend' | 'groups' | 'products' | 'butchers' | 'lossItems' | 'margins' | 'promo'>;

type DrawerState = {
  visible: boolean;
  loading: boolean;
  content: DetailContent | null;
};

const CLOSED: DrawerState = { visible: false, loading: false, content: null };

export function useDashboardDetail(
  serverUrl: string | null,
  range: DateRange,
  data: PosDashboardSnapshot,
  lists: DashLists
)
{
  const [drawer, setDrawer] = useState<DrawerState>(CLOSED);
  const close = useCallback(() =>
  {
    setDrawer(CLOSED);
  }, []);
  const openContent = useCallback((content: DetailContent, loading = false) =>
  {
    setDrawer({ visible: true, loading, content });
  }, []);
  const showDetailError = useCallback((title: string, subtitle: string, err: unknown, back?: DetailBack) =>
  {
    const message = String((err as Error)?.message ?? tDash('noData'));
    setDrawer({
      visible: true,
      loading: false,
      content: {
        title,
        subtitle,
        back,
        sections: [{ title: i18n.t('msgWarning'), rows: [{ label: message, value: emptyLabel() }] }]
      }
    });
  }, []);
  const openKpiDetail = useCallback(async (def: KpiDef, title: string) =>
  {
    const kind = def.detail ?? getKpiDetailKind(def.key);
    if(!kind || !serverUrl)
    {
      return;
    }
    openContent({ title, subtitle: formatRangeLabel(range), sections: [] }, true);
    try
    {
      const content = await buildKpiDetailContent(kind, serverUrl, range, { data, lists }, title);
      setDrawer({ visible: true, loading: false, content });
    }
    catch
    {
      setDrawer({
        visible: true,
        loading: false,
        content: {
          title,
          subtitle: formatRangeLabel(range),
          sections: [{ title: i18n.t('msgWarning'), rows: [{ label: tDash('noData'), value: emptyLabel() }] }]
        }
      });
    }
  }, [data, lists, openContent, range, serverUrl]);
  const openInfoDetail = useCallback(async (def: KpiDef, title: string) =>
  {
    if(def.infoAction === 'unsoldGroups')
    {
      await openKpiDetail({ ...def, detail: 'popUnsoldGroups' }, title);
    }
  }, [openKpiDetail]);
  const openUserEndday = useCallback(async (safeCode: string, userName: string, back?: DetailBack) =>
  {
    if(!serverUrl)
    {
      return;
    }
    openContent({ title: userName, subtitle: tDash('posUsersTitle'), sections: [], back }, true);
    try
    {
      const rows = await fetchPosUserDetails(serverUrl, range, safeCode, userName);
      const payRow = (r: Record<string, unknown>, label: string, declaredField: string, posField: string, diffField: string) =>
      {
        const diff = num(r[diffField]);
        return {
          label,
          value: formatCurrency(diff),
          sub: `${tDash('details')}: ${formatCurrency(num(r[declaredField]))} · POS ${formatCurrency(num(r[posField]))}`,
          accent: Math.abs(diff) > 0.001 ? '#DC2626' : undefined
        };
      };
      const sections = rows.length === 0 ?
        [{ title: userName, emptyText: tDash('noData'), rows: [] }] :
        rows.map((r) => ({
          title: String(r.CDATE ?? '').slice(0, 10) || userName,
          rows: [
            payRow(r, tDash('cash'), 'CASH', 'POS_CASH', 'DIFF_CASH'),
            payRow(r, tDash('credit'), 'CREDIT', 'POS_CREDIT', 'DIFF_CREDIT'),
            payRow(r, tDash('check'), 'CHECK', 'POS_CHECK', 'DIFF_CHECK'),
            payRow(r, tDash('ticket'), 'TICKET', 'POS_TICKET', 'DIFF_TICKET'),
            { label: tDash('advance'), value: formatCurrency(num(r.ADVANCE)) }
          ]
        }));
      setDrawer({ visible: true, loading: false, content: { title: userName, subtitle: tDash('posUsersTitle'), back, sections } });
    }
    catch(e)
    {
      showDetailError(userName, tDash('posUsersTitle'), e, back);
    }
  }, [openContent, range, serverUrl, showDetailError]);
  const openSafeUsers = useCallback(async (safeCode: string, safeName: string, back?: DetailBack) =>
  {
    if(!serverUrl)
    {
      return;
    }
    openContent({ title: safeName, subtitle: tDash('posUsersTitle'), sections: [], back }, true);
    try
    {
      const rows = await fetchPosUsersBySafe(serverUrl, range, safeCode);
      const selfBack: DetailBack = { label: safeName, onPress: () => void openSafeUsers(safeCode, safeName, back) };
      setDrawer({ visible: true, loading: false, content: {
        title: safeName,
        subtitle: tDash('posUsersTitle'),
        back,
        sections: [{
          title: tDash('posUsersTitle'),
          emptyText: tDash('noUsers'),
          rows: rows.map((r) =>
          {
            const user = String(r.CUSER_NAME ?? emptyLabel());
            return { label: user, value: '', onPress: () => void openUserEndday(safeCode, user, selfBack) };
          })
        }]
      } });
    }
    catch(e)
    {
      showDetailError(safeName, tDash('posUsersTitle'), e, back);
    }
  }, [openContent, openUserEndday, range, serverUrl, showDetailError]);
  const openPosDevices = useCallback(async () =>
  {
    if(!serverUrl)
    {
      return;
    }
    const title = tDash('posDevicesTitle');
    openContent({ title, subtitle: formatRangeLabel(range), sections: [] }, true);
    try
    {
      const rows = await fetchPosDevices(serverUrl, range);
      const self: DetailBack = { label: title, onPress: () => void openPosDevices() };
      setDrawer({ visible: true, loading: false, content: {
        title,
        subtitle: formatRangeLabel(range),
        sections: [{
          title,
          emptyText: tDash('noDevices'),
          rows: rows.map((r) =>
          {
            const code = String(r.SAFE_CODE ?? '');
            const name = String(r.SAFE_NAME ?? (code || emptyLabel()));
            return { label: name, value: code, onPress: () => void openSafeUsers(code, name, self) };
          })
        }]
      } });
    }
    catch(e)
    {
      showDetailError(title, formatRangeLabel(range), e);
    }
  }, [openContent, openSafeUsers, range, serverUrl, showDetailError]);
  const openLeftBadge = useCallback(async (def: KpiDef) =>
  {
    if(def.leftBadge === 'posDevices' && serverUrl)
    {
      await openPosDevices();
    }
  }, [openPosDevices, serverUrl]);
  const exportPdf = useCallback(async () =>
  {
    if(!drawer.content)
    {
      return;
    }
    try
    {
      const c = drawer.content;
      const flat = c.tabs ? { ...c, sections: c.tabs.flatMap((t) => t.sections) } : c;
      await exportDetailPdf(flat);
    }
    catch
    {
      /* share cancelled */
    }
  }, [drawer.content]);
  const shareWhatsApp = useCallback(async () =>
  {
    const content = drawer.content;
    if(!content)
    {
      return;
    }
    const lines: string[] = [`*${content.title}*`];
    if(content.subtitle)
    {
      lines.push(content.subtitle);
    }
    const shareSections = content.tabs ? content.tabs.flatMap((t) => t.sections) : content.sections;
    shareSections.forEach((section) =>
    {
      lines.push('', section.title);
      if(section.rows.length === 0)
      {
        lines.push(section.emptyText ?? tDash('noData'));
        return;
      }
      section.rows.forEach((row) =>
      {
        const sub = row.sub ? ` (${row.sub})` : '';
        const val = row.value ? ` : ${row.value}` : '';
        lines.push(`• ${row.label}${val}${sub}`);
      });
    });
    await shareToWhatsApp(lines.join('\n'));
  }, [drawer.content]);
  const openGroupLoss = useCallback(async (groupName: string, back?: DetailBack) =>
  {
    if(!serverUrl)
    {
      return;
    }
    openContent({ title: groupName, subtitle: tDash('groupLossInfo'), sections: [], back }, true);
    try
    {
      const rows = await fetchGroupLossItems(serverUrl, range, groupName);
      setDrawer({
        visible: true,
        loading: false,
        content: {
          title: groupName,
          subtitle: tDash('groupLossInfo'),
          back,
          sections: [{
            title: tDash('groupLossItems'),
            emptyText: tDash('noData'),
            rows: rows.slice(0, 80).map((r) => ({
              label: String(r.ITEM_NAME ?? r.ITEM_CODE ?? emptyLabel()),
              value: formatCurrency(num(r.MARGIN_HT)),
              sub: `${String(r.ITEM_GRP_NAME ?? '')} · ${formatQuantity(num(r.TOTAL_QUANTITY))} ${String(r.UNIT_SHORT ?? '')}`.trim(),
              accent: '#DC2626'
            }))
          }]
        }
      });
    }
    catch(e)
    {
      showDetailError(groupName, tDash('groupLossInfo'), e, back);
    }
  }, [openContent, range, serverUrl, showDetailError]);
  const openMarginGroup = useCallback(async (groupName: string) =>
  {
    if(!serverUrl)
    {
      return;
    }
    openContent({ title: groupName, subtitle: formatRangeLabel(range), sections: [] }, true);
    try
    {
      const rows = await fetchMarginDetailByGroup(serverUrl, range, groupName);
      const self: DetailBack = { label: groupName, onPress: () => void openMarginGroup(groupName) };
      setDrawer({
        visible: true,
        loading: false,
        content: {
          title: groupName,
          subtitle: formatRangeLabel(range),
          sections: [
            { title: tDash('detail'), rows: [{ label: tDash('groupLossItems'), value: '', onPress: () => void openGroupLoss(groupName, self) }] },
            { title: tDash('marginByProductGroups'), rows: mapMarginDetailRows(rows), emptyText: tDash('noData') }
          ]
        }
      });
    }
    catch(e)
    {
      showDetailError(groupName, formatRangeLabel(range), e);
    }
  }, [openContent, openGroupLoss, range, serverUrl, showDetailError]);
  const openButcherDetail = useCallback(async (weigherName: string, back?: DetailBack) =>
  {
    if(!serverUrl)
    {
      return;
    }
    openContent({ title: weigherName, subtitle: formatRangeLabel(range), sections: [], back }, true);
    try
    {
      const rows = await fetchButcherChanges(serverUrl, range, weigherName);
      setDrawer({
        visible: true,
        loading: false,
        content: {
          title: weigherName,
          subtitle: formatRangeLabel(range),
          back,
          sections: [{ title: tDash('butcherChanges'), rows: mapButcherChangeRows(rows), emptyText: tDash('noChanges') }]
        }
      });
    }
    catch(e)
    {
      showDetailError(weigherName, formatRangeLabel(range), e, back);
    }
  }, [openContent, range, serverUrl, showDetailError]);
  const openPromoDetail = useCallback(async () =>
  {
    if(!serverUrl)
    {
      return;
    }
    openContent({ title: tDash('promotionProducts'), subtitle: formatRangeLabel(range), sections: [] }, true);
    try
    {
      const rows = await fetchPromoMarginDetail(serverUrl, range);
      setDrawer({
        visible: true,
        loading: false,
        content: {
          title: tDash('promotionProducts'),
          subtitle: formatRangeLabel(range),
          sections: [{ title: tDash('promotionProducts'), rows: mapPromoDetailRows(rows), emptyText: tDash('noData') }]
        }
      });
    }
    catch(e)
    {
      showDetailError(tDash('promotionProducts'), formatRangeLabel(range), e);
    }
  }, [openContent, range, serverUrl, showDetailError]);
  const openLossDetail = useCallback(() =>
  {
    setDrawer({
      visible: true,
      loading: false,
      content: {
        title: tDash('lossItemsPopupTitle'),
        subtitle: formatRangeLabel(range),
        sections: [{
          title: tDash('lossItemsPopupTitle'),
          rows: lists.lossItems.slice(0, 40).map((r) => ({
            label: r.name,
            value: formatCurrency(r.margin),
            sub: r.code,
            accent: '#DC2626'
          })),
          emptyText: tDash('noData')
        }]
      }
    });
  }, [lists.lossItems, range]);
  const openDiscountDetail = useCallback(async (itemCode: string, itemName: string, back?: { label: string; onPress: () => void }) =>
  {
    if(!serverUrl)
    {
      return;
    }
    openContent({ title: itemName, subtitle: formatRangeLabel(range), sections: [], back }, true);
    try
    {
      const rows = await fetchDiscountDetail(serverUrl, range, itemCode);
      const sum = (field: string) => rows.reduce((acc, r) => acc + num(r[field]), 0);
      const totalMargin = sum('MARGIN');
      const summary: DetailContent['sections'][number] = {
        title: tDash('discountDetails'),
        rows: [
          { label: tDash('totalSales'), value: formatCurrency(sum('FAMOUNT')) },
          { label: tDash('useDiscount'), value: formatCurrency(sum('DISCOUNT')) },
          { label: tDash('loyalty'), value: formatCurrency(sum('LOYALTY')) },
          { label: tDash('margin'), value: formatCurrency(totalMargin), accent: totalMargin < 0 ? '#DC2626' : undefined }
        ]
      };
      const lines: DetailContent['sections'][number] = {
        title: tDash('lossItemsPopupTitle'),
        emptyText: tDash('noData'),
        rows: rows.slice(0, 80).map((r) =>
        {
          const margin = num(r.MARGIN);
          return {
            label: `${String(r.DOC_DATE ?? '').slice(0, 10)} · ${String(r.LUSER ?? emptyLabel())}`.trim(),
            value: formatCurrency(margin),
            sub: `${formatQuantity(num(r.QUANTITY))} × ${formatCurrency(num(r.PRICE))} · ${tDash('useDiscount')} ${formatCurrency(num(r.DISCOUNT))}`,
            accent: margin < 0 ? '#DC2626' : undefined
          };
        })
      };
      setDrawer({ visible: true, loading: false, content: { title: itemName, subtitle: formatRangeLabel(range), back, sections: [summary, lines] } });
    }
    catch(e)
    {
      showDetailError(tDash('detail'), formatRangeLabel(range), e);
    }
  }, [ openContent, range, serverUrl]);
  const openAllLossItems = useCallback(async () =>
  {
    if(!serverUrl)
    {
      return;
    }
    const title = tDash('allLossItems');
    openContent({ title, subtitle: formatRangeLabel(range), sections: [] }, true);
    try
    {
      const rows = await fetchGlobalLossItems(serverUrl, range);
      const itemRows = rows.slice(0, 80).map((r) =>
      {
        const code = String(r.ITEM_CODE ?? '');
        const name = String(r.ITEM_NAME ?? emptyLabel());
        return {
          label: name,
          value: formatCurrency(num(r.MARGIN_HT)),
          sub: `${String(r.ITEM_GRP_NAME ?? '')} · ${formatQuantity(num(r.TOTAL_QUANTITY))} ${String(r.UNIT_SHORT ?? '')}`.trim(),
          accent: '#DC2626',
          onPress: () => void openDiscountDetail(code, name, { label: title, onPress: () => void openAllLossItems() })
        };
      });
      setDrawer({
        visible: true,
        loading: false,
        content: {
          title,
          subtitle: formatRangeLabel(range),
          sections: [{ title: tDash('allLossItemsDescription'), rows: itemRows, emptyText: tDash('noData') }]
        }
      });
    }
    catch(e)
    {
      showDetailError(tDash('detail'), formatRangeLabel(range), e);
    }
  }, [ openContent, openDiscountDetail, range, serverUrl]);
  const openItemPurchaseHistory = useCallback(async (code: string, name: string, back?: DetailBack) =>
  {
    if(!serverUrl)
    {
      return;
    }
    openContent({ title: name, subtitle: tDash('purchaseHistory'), sections: [], back }, true);
    try
    {
      const rows = await fetchItemPurchaseHistory(serverUrl, code);
      setDrawer({ visible: true, loading: false, content: {
        title: name,
        subtitle: tDash('purchaseHistory'),
        back,
        sections: [{
          title: tDash('purchaseHistory'),
          emptyText: tDash('noData'),
          rows: rows.map((r) => ({
            label: String(r.SUPPLIER_NAME ?? emptyLabel()),
            value: formatCurrency(num(r.PURCHASE_PRICE)),
            sub: String(r.DOC_DATE ?? '').slice(0, 10)
          }))
        }]
      } });
    }
    catch(e)
    {
      showDetailError(tDash('detail'), formatRangeLabel(range), e);
    }
  }, [ openContent, serverUrl]);
  const openItemSalesHistory = useCallback(async (code: string, name: string, back?: DetailBack) =>
  {
    if(!serverUrl)
    {
      return;
    }
    openContent({ title: name, subtitle: tDash('salesHistory'), sections: [], back }, true);
    try
    {
      const rows = await fetchItemSalesHistory(serverUrl, code);
      setDrawer({ visible: true, loading: false, content: {
        title: name,
        subtitle: tDash('salesHistory'),
        back,
        sections: [{
          title: tDash('salesHistory'),
          emptyText: tDash('noData'),
          rows: rows.map((r) => ({
            label: String(r.DATE ?? emptyLabel()),
            value: formatCurrency(num(r.FISRT_PRICE))
          }))
        }]
      } });
    }
    catch(e)
    {
      showDetailError(tDash('detail'), formatRangeLabel(range), e);
    }
  }, [ openContent, serverUrl]);
  const openItemSalesChart = useCallback(async (code: string, name: string, back?: DetailBack) =>
  {
    if(!serverUrl)
    {
      return;
    }
    openContent({ title: name, subtitle: tDash('salesChart'), sections: [], back }, true);
    try
    {
      const rows = await fetchItemSalesChart(serverUrl, code);
      setDrawer({ visible: true, loading: false, content: {
        title: name,
        subtitle: tDash('salesChart'),
        back,
        sections: [{
          title: tDash('salesChart'),
          emptyText: tDash('noData'),
          chart: rows.map((r) => ({
            label: String(r.DATE ?? '').slice(5),
            value: num(r.TOTAL_SALES),
            display: formatCurrency(num(r.TOTAL_SALES))
          })),
          rows: rows.map((r) => ({
            label: String(r.DATE ?? emptyLabel()),
            value: formatCurrency(num(r.TOTAL_SALES)),
            sub: `${formatQuantity(num(r.TOTAL_QUANTITY))} ${tDash('quantity')}`
          }))
        }]
      } });
    }
    catch(e)
    {
      showDetailError(tDash('detail'), formatRangeLabel(range), e);
    }
  }, [ openContent, serverUrl]);
  const openItemBarcodes = useCallback(async (code: string, name: string, back?: DetailBack) =>
  {
    if(!serverUrl)
    {
      return;
    }
    openContent({ title: name, subtitle: tDash('priceListByQuantity'), sections: [], back }, true);
    try
    {
      const rows = await fetchItemBarcodes(serverUrl, code);
      setDrawer({ visible: true, loading: false, content: {
        title: name,
        subtitle: tDash('priceListByQuantity'),
        back,
        sections: [{
          title: tDash('priceListByQuantity'),
          emptyText: tDash('noData'),
          rows: rows.map((r) => ({
            label: `${String(r.DEPOT_NAME ?? emptyLabel())} · ${formatQuantity(num(r.QUANTITY))}`,
            value: formatCurrency(num(r.PRICE_TTC)),
            sub: `${tDash('salePrice')} ${formatCurrency(num(r.PRICE_HT))} · ${tDash('costPrice')} ${formatCurrency(num(r.COST_PRICE))}`
          }))
        }]
      } });
    }
    catch(e)
    {
      showDetailError(tDash('detail'), formatRangeLabel(range), e);
    }
  }, [ openContent, serverUrl]);
  const openItemDetail = useCallback(async (item: SearchItem) =>
  {
    if(!serverUrl || !item.GUID)
    {
      return;
    }
    const fallbackName = String(item.NAME ?? emptyLabel());
    openContent({ title: fallbackName, subtitle: tDash('itemMarginDetail'), sections: [] }, true);
    try
    {
      const rows = await fetchItemMarginDetail(serverUrl, range, item.GUID);
      const d = rows[0] ?? {};
      const code = String(d.ITEM_CODE ?? item.CODE ?? '');
      const name = String(d.ITEM_NAME ?? item.NAME ?? emptyLabel());
      const margin = num(d.MARGIN_HT);
      const self = () => void openItemDetail(item);
      const back: DetailBack = { label: name, onPress: self };
      setDrawer({ visible: true, loading: false, content: {
        title: name,
        subtitle: `${String(d.MAIN_GRP_NAME ?? item.MAIN_GRP_NAME ?? '')} · ${formatRangeLabel(range)}`.trim(),
        sections: [
          {
            title: tDash('itemMarginDetail'),
            rows: [
              { label: tDash('margin'), value: formatCurrency(margin), accent: margin < 0 ? '#DC2626' : undefined },
              { label: tDash('marginPercent'), value: `${num(d.MARGIN_PERCENT).toFixed(1)}%` },
              { label: tDash('quantity'), value: `${formatQuantity(num(d.TOTAL_QUANTITY))} ${String(d.UNIT_SHORT ?? '')}`.trim() },
              { label: tDash('costPrice'), value: formatCurrency(num(d.COST_PRICE)) },
              { label: tDash('salePrice'), value: formatCurrency(num(d.PRICE)) }
            ]
          },
          {
            title: tDash('detail'),
            rows: [
              { label: tDash('purchaseHistory'), value: '', onPress: () => void openItemPurchaseHistory(code, name, back) },
              { label: tDash('salesHistory'), value: '', onPress: () => void openItemSalesHistory(code, name, back) },
              { label: tDash('salesChart'), value: '', onPress: () => void openItemSalesChart(code, name, back) },
              { label: tDash('priceListByQuantity'), value: '', onPress: () => void openItemBarcodes(code, name, back) }
            ]
          }
        ]
      } });
    }
    catch(e)
    {
      showDetailError(tDash('detail'), formatRangeLabel(range), e);
    }
  }, [ openContent, openItemBarcodes, openItemPurchaseHistory, openItemSalesChart, openItemSalesHistory, range, serverUrl]);
  const openBalanceSupprimeDetail = useCallback(async (weigher: string, name: string, back?: DetailBack) =>
  {
    if(!serverUrl)
    {
      return;
    }
    openContent({ title: name, subtitle: tDash('supprimeTickets'), sections: [], back }, true);
    try
    {
      const rows = await fetchPopSupprimeDetail(serverUrl, range, weigher);
      setDrawer({ visible: true, loading: false, content: {
        title: name,
        subtitle: tDash('supprimeTickets'),
        back,
        sections: [{
          title: tDash('supprimeTickets'),
          emptyText: tDash('noSupprimeTickets'),
          rows: rows.map((r) =>
          {
            const created = String(r.TIME ?? '');
            const deleted = String(r.DELETE_TIME ?? '');
            const noteParts: string[] = [];
            if(deleted)
            {
              noteParts.push(`🗑 ${tDash('deletedAt')}: ${deleted}`);
              const diff = elapsedLabel(created, deleted);
              if(diff)
              {
                noteParts.push(`⏱ ${tDash('diffTime')}: ${diff}`);
              }
            }
            return {
              label: String(r.ITEM_NAME ?? r.ITEM_CODE ?? emptyLabel()),
              value: formatCurrency(num(r.AMOUNT)),
              sub: `#${String(r.TICKET_NO ?? '')} · 🕒 ${created} · ${formatQuantity(num(r.QUANTITY))} × ${formatCurrency(num(r.PRICE))}`,
              note: noteParts.length ? noteParts.join('    ') : undefined,
              accent: '#DC2626'
            };
          })
        }]
      } });
    }
    catch(e)
    {
      showDetailError(tDash('detail'), formatRangeLabel(range), e);
    }
  }, [ openContent, range, serverUrl]);
  const openBalanceNonTraiteDetail = useCallback(async (weigher: string, name: string, back?: DetailBack) =>
  {
    if(!serverUrl)
    {
      return;
    }
    openContent({ title: name, subtitle: tDash('nonTraiteTickets'), sections: [], back }, true);
    try
    {
      const rows = await fetchPopNonTraiteDetail(serverUrl, range, weigher);
      setDrawer({ visible: true, loading: false, content: {
        title: name,
        subtitle: tDash('nonTraiteTickets'),
        back,
        sections: [{
          title: tDash('nonTraiteTickets'),
          emptyText: tDash('noNonTraiteTickets'),
          rows: rows.map((r) =>
          {
            const desc = String(r.VALIDATEUR_DESC ?? '').trim();
            return {
              label: String(r.ITEM_NAME ?? r.ITEM_CODE ?? emptyLabel()),
              value: formatCurrency(num(r.AMOUNT)),
              sub: `#${String(r.TICKET_NO ?? '')} · 🕒 ${String(r.TIME ?? '')} · ${formatQuantity(num(r.QUANTITY))} × ${formatCurrency(num(r.PRICE))}`,
              note: desc ? `👤 ${desc}` : undefined
            };
          })
        }]
      } });
    }
    catch(e)
    {
      showDetailError(tDash('detail'), formatRangeLabel(range), e);
    }
  }, [ openContent, range, serverUrl]);
  const openBalanceConfirmeDetail = useCallback(async (validateur: string, back?: DetailBack) =>
  {
    if(!serverUrl)
    {
      return;
    }
    const name = validateur || emptyLabel();
    openContent({ title: name, subtitle: tDash('confirmeTickets'), sections: [], back }, true);
    try
    {
      const rows = await fetchPopConfirmeDetail(serverUrl, range, validateur);
      setDrawer({ visible: true, loading: false, content: {
        title: name,
        subtitle: tDash('confirmeTickets'),
        back,
        sections: [{
          title: tDash('confirmeTickets'),
          emptyText: tDash('noConfirmeTickets'),
          rows: rows.map((r) =>
          {
            const weigherName = String(r.WEIGHER ?? '').trim();
            return {
              label: String(r.ITEM_NAME ?? r.ITEM_CODE ?? emptyLabel()),
              value: formatCurrency(num(r.AMOUNT)),
              sub: `#${String(r.TICKET_NO ?? '')} · 🕒 ${String(r.TIME ?? '')}`,
              note: weigherName ? `👤 ${weigherName}` : undefined,
              accent: '#16A34A'
            };
          })
        }]
      } });
    }
    catch(e)
    {
      showDetailError(tDash('detail'), formatRangeLabel(range), e);
    }
  }, [ openContent, range, serverUrl]);
  const openUncheckedHub = useCallback(async (title: string) =>
  {
    if(!serverUrl)
    {
      return;
    }
    openContent({ title, subtitle: formatRangeLabel(range), sections: [] }, true);
    try
    {
      const [bundle, confirme] = await Promise.all([
        fetchPopUncheckedUsers(serverUrl, range),
        fetchPopConfirmeUsers(serverUrl, range)
      ]);
      const self: DetailBack = { label: title, onPress: () => void openUncheckedHub(title) };
      const supprimeRows = bundle.supprime.map((r) =>
      {
        const w = String(r.WEIGHER ?? '');
        const name = String(r.WEIGHER_NAME ?? (w || emptyLabel()));
        return { label: name, value: formatNumber(num(r.SUPPRIME_COUNT)), accent: '#DC2626', onPress: () => void openBalanceSupprimeDetail(w, name, self) };
      });
      const nonTraiteRows = bundle.nonTraite.map((r) =>
      {
        const w = String(r.WEIGHER ?? '');
        const name = String(r.WEIGHER_NAME ?? (w || emptyLabel()));
        return { label: name, value: formatNumber(num(r.NON_TRAITE_COUNT)), sub: `${formatCurrency(num(r.NON_TRAITE_AMOUNT))}`, onPress: () => void openBalanceNonTraiteDetail(w, name, self) };
      });
      const confirmeRows = confirme.map((r) =>
      {
        const v = String(r.VALIDATEUR_NAME ?? '').trim();
        return { label: v || emptyLabel(), value: formatNumber(num(r.CONFIRME_COUNT)), accent: '#16A34A', onPress: () => void openBalanceConfirmeDetail(v, self) };
      });
      const butcherRows = lists.butchers.map((b) => ({
        label: b.name,
        value: formatNumber(b.changeCount),
        sub: `${formatCurrency(b.amount)} · ${tDash('useDiscount')} ${formatCurrency(b.discount)}`,
        accent: b.changeCount > 0 ? '#2196F3' : undefined,
        onPress: () => void openButcherDetail(b.name, self)
      }));
      setDrawer({ visible: true, loading: false, content: {
        title,
        subtitle: formatRangeLabel(range),
        sections: [],
        tabs: [
          {
            id: 'supprime',
            label: tDash('supprimeTickets'),
            accent: '#DC2626',
            badge: supprimeRows.length,
            sections: [{ title: tDash('supprimeTickets'), emptyText: tDash('noSupprimeTickets'), rows: supprimeRows }]
          },
          {
            id: 'nontraite',
            label: tDash('nonTraiteTickets'),
            badge: nonTraiteRows.length,
            sections: [{ title: tDash('nonTraiteTickets'), emptyText: tDash('noNonTraiteTickets'), rows: nonTraiteRows }]
          },
          {
            id: 'confirme',
            label: tDash('confirmeTickets'),
            accent: '#16A34A',
            badge: confirmeRows.length,
            sections: [{ title: tDash('confirmeTickets'), emptyText: tDash('noConfirmeTickets'), rows: confirmeRows }]
          },
          {
            id: 'butcher',
            label: tDash('butcherChanges'),
            badge: butcherRows.length,
            sections: [{ title: tDash('butcherChanges'), emptyText: tDash('noButchers'), rows: butcherRows }]
          }
        ]
      } });
    }
    catch(e)
    {
      showDetailError(title, formatRangeLabel(range), e);
    }
  }, [lists.butchers, openBalanceConfirmeDetail, openBalanceNonTraiteDetail, openBalanceSupprimeDetail, openButcherDetail, openContent, range, serverUrl, showDetailError]);
  const openZeroCostItems = useCallback(async () =>
  {
    if(!serverUrl)
    {
      return;
    }
    openContent({ title: tDash('zeroCostItems'), subtitle: formatRangeLabel(range), sections: [] }, true);
    try
    {
      const rows = await fetchZeroCostItems(serverUrl);
      setDrawer({ visible: true, loading: false, content: {
        title: tDash('zeroCostItems'),
        subtitle: formatRangeLabel(range),
        sections: [{ title: tDash('zeroCostItems'), rows: mapZeroCostRows(rows), emptyText: tDash('noData') }]
      } });
    }
    catch(e)
    {
      showDetailError(tDash('zeroCostItems'), formatRangeLabel(range), e);
    }
  }, [openContent, range, serverUrl, showDetailError]);
  const openRedTagItems = useCallback(async () =>
  {
    if(!serverUrl)
    {
      return;
    }
    openContent({ title: tDash('redTagItems'), subtitle: formatRangeLabel(range), sections: [] }, true);
    try
    {
      const rows = await fetchRedTagItems(serverUrl, range);
      setDrawer({ visible: true, loading: false, content: {
        title: tDash('redTagItems'),
        subtitle: formatRangeLabel(range),
        sections: [{ title: tDash('redTagItems'), rows: mapRedTagRows(rows), emptyText: tDash('noData') }]
      } });
    }
    catch(e)
    {
      showDetailError(tDash('redTagItems'), formatRangeLabel(range), e);
    }
  }, [openContent, range, serverUrl, showDetailError]);
  const openLowMargin = useCallback(async (unsold = false, threshold = 15, groupName = '') =>
  {
    if(!serverUrl)
    {
      return;
    }
    const title = unsold ? tDash('lowMarginUnsoldLoss') : tDash('lowMarginMiniTitle');
    openContent({ title, subtitle: formatRangeLabel(range), sections: [] }, true);
    try
    {
      const rows = unsold ?
        await fetchUnsoldLossProducts(serverUrl, range, groupName) :
        await fetchLowMarginProducts(serverUrl, range, threshold, groupName);
      setDrawer({ visible: true, loading: false, content: {
        title,
        subtitle: unsold ? tDash('lowMarginUnsoldLoss') : `${formatRangeLabel(range)} · < ${threshold}%`,
        sections: [{ title, rows: mapLowMarginRows(rows), emptyText: tDash('lowMarginNoData') }]
      } });
    }
    catch(e)
    {
      showDetailError(title, formatRangeLabel(range), e);
    }
  }, [openContent, range, serverUrl, showDetailError]);
  const openKpiCompare = useCallback(async (def: KpiDef) =>
  {
    if(!serverUrl || (def.key !== 'dailySalesCount' && def.key !== 'salesAvg'))
    {
      return;
    }
    const metric = def.key;
    const compareRange = getDatePreset('yesterday');
    openContent({ title: tDash('comparisonResult'), subtitle: formatRangeLabel(range), sections: [] }, true);
    try
    {
      const [currentValue, compareValue] = await Promise.all([
        fetchKpiCompareValue(serverUrl, metric, range),
        fetchKpiCompareValue(serverUrl, metric, compareRange)
      ]);
      setDrawer({ visible: true, loading: false, content: buildKpiCompareContent(metric, range, compareRange, currentValue, compareValue) });
    }
    catch(e)
    {
      showDetailError(tDash('detail'), formatRangeLabel(range), e);
    }
  }, [ openContent, range, serverUrl]);
  const openProductList = useCallback(() =>
  {
    setDrawer({
      visible: true,
      loading: false,
      content: {
        title: tDash('topSellingProducts'),
        subtitle: formatRangeLabel(range),
        sections: [{
          title: tDash('topSellingProducts'),
          rows: lists.products.slice(0, 30).map((r) => ({
            label: r.name,
            value: formatCurrency(r.amount),
            sub: `${r.groupName} · ${r.qty}`
          })),
          emptyText: tDash('noData')
        }]
      }
    });
  }, [lists.products, range]);
  return {
    drawer,
    close,
    exportPdf,
    shareWhatsApp,
    openKpiDetail,
    openInfoDetail,
    openLeftBadge,
    openMarginGroup,
    openGroupLoss,
    openButcherDetail,
    openPromoDetail,
    openLossDetail,
    openDiscountDetail,
    openAllLossItems,
    openItemDetail,
    openUncheckedHub,
    openZeroCostItems,
    openRedTagItems,
    openLowMargin,
    openKpiCompare,
    openProductList
  };
}
