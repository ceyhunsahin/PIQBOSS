import type { PosDashboardSnapshot } from '@piqboss/shared';
import type { DateRange } from '@/lib/dateRange';
import { formatRangeLabel } from '@/lib/dateRange';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import { tDash } from '@/lib/i18n';
import { emptyLabel } from '@/lib/uiText';
import type { PosListsBundle } from '../fetchPosLists';
import type { KpiDetailKind } from '../config/kpiDefinitions';
import type { DetailContent, DetailSection } from './types';
import {
  fetchPopAllItemGroupsList,
  fetchPopBalanceTicketBundle,
  fetchPopFullDeleteList,
  fetchPopPriceDescList,
  fetchPopPurcPriceDownList,
  fetchPopPurcPriceUpList,
  fetchPopRebateTicketList,
  fetchPopRebateTotalPayment,
  fetchPopRowDeleteList,
  fetchPopSalePriceDownList,
  fetchPopSalePriceUpList,
  fetchPopSalesTotalBundle,
  fetchPopUncheckedUsers,
  fetchPopUnsoldGroupsList,
  fetchPosDevices,
  fetchPromoLoyaltyInfo,
  fetchPromoMarginDetail,
  mapExtraRows,
  mapGroupQtyRows,
  mapNonTraiteRows,
  mapPriceHistoryRows,
  mapPromoDetailRows,
  mapRebateTicketRows,
  mapSupprimeRows
} from './fetchDetailQueries';

type DashContext = {
  data: PosDashboardSnapshot;
  lists: Pick<PosListsBundle, 'payments' | 'vat' | 'devices' | 'trend' | 'groups' | 'products' | 'butchers' | 'lossItems' | 'margins' | 'promo'>;
};

function section(title: string, rows: DetailSection['rows'], emptyText?: string): DetailSection
{
  return { title, rows, emptyText: emptyText ?? tDash('noData') };
}

export async function buildKpiDetailContent(
  kind: KpiDetailKind,
  serverUrl: string,
  range: DateRange,
  ctx: DashContext,
  title: string
): Promise<DetailContent>
{
  const subtitle = formatRangeLabel(range);
  if(kind === 'popSalesTotal')
  {
    const bundle = await fetchPopSalesTotalBundle(serverUrl, range);
    return {
      title,
      subtitle,
      sections: [
        section(tDash('salesTotalPaymentTypes'), bundle.payments.map((r) => ({
          label: String(r.PAY_TYPE_NAME ?? emptyLabel()),
          value: formatCurrency(Number(r.AMOUNT ?? 0))
        }))),
        section(tDash('salesTotalVatBreakdown'), bundle.vat.map((r) => ({
          label: `${formatPercent(Number(r.VAT_RATE ?? 0))} ${tDash('grdSalesVatRate.vatRate')}`,
          value: formatCurrency(Number(r.TOTAL ?? 0)),
          sub: `${tDash('grdSalesVatRate.amount')} ${formatCurrency(Number(r.AMOUNT ?? 0))} · ${tDash('grdSalesVatRate.vat')} ${formatCurrency(Number(r.VAT ?? 0))}`
        }))),
        section(tDash('detail'), [
          { label: tDash('salesTotalPosNetTtc'), value: formatCurrency(bundle.posNetTtc) },
          { label: tDash('salesTotalPayRefundTotal'), value: formatCurrency(bundle.refundPaymentTotal) },
          { label: tDash('dailyRebateTicket'), value: formatNumber(bundle.rebateTickets.length) }
        ])
      ]
    };
  }
  if(kind === 'popPriceDesc')
  {
    const rows = await fetchPopPriceDescList(serverUrl, range);
    return { title, subtitle, sections: [section(tDash('dailyPriceChange'), mapExtraRows(rows))] };
  }
  if(kind === 'popRowDelete')
  {
    const rows = await fetchPopRowDeleteList(serverUrl, range);
    return { title, subtitle, sections: [section(tDash('dailyRowDelete'), mapExtraRows(rows))] };
  }
  if(kind === 'popFullDelete')
  {
    const rows = await fetchPopFullDeleteList(serverUrl, range);
    return { title, subtitle, sections: [section(tDash('dailyFullDelete'), mapExtraRows(rows, 'ITEM'))] };
  }
  if(kind === 'popRebateTicket')
  {
    const rows = await fetchPopRebateTicketList(serverUrl, range);
    return { title, subtitle, sections: [section(tDash('dailyRebateTicket'), mapRebateTicketRows(rows))] };
  }
  if(kind === 'popRebateTotal')
  {
    const rows = await fetchPopRebateTotalPayment(serverUrl, range);
    return {
      title,
      subtitle,
      sections: [section(tDash('salesTotalPaymentTypes'), rows.map((r) => ({
        label: String(r.PAY_TYPE_NAME ?? emptyLabel()),
        value: formatCurrency(Number(r.AMOUNT ?? 0))
      })))]
    };
  }
  if(kind === 'popAllItemGroups')
  {
    const rows = await fetchPopAllItemGroupsList(serverUrl, range);
    return { title, subtitle, sections: [section(tDash('soldGroups'), mapGroupQtyRows(rows))] };
  }
  if(kind === 'popUnsoldGroups')
  {
    const rows = await fetchPopUnsoldGroupsList(serverUrl, range);
    return {
      title,
      subtitle,
      sections: [section(tDash('unsoldItemGroups'), rows.map((r) => ({
        label: String(r.NAME ?? emptyLabel()),
        value: String(r.CODE ?? '')
      })), tDash('allGroupsSold'))]
    };
  }
  if(kind === 'popBalanceTicket')
  {
    const bundle = await fetchPopBalanceTicketBundle(serverUrl, range);
    return {
      title,
      subtitle,
      sections: [
        section(tDash('balanceTicketCreated'), [
          { label: tDash('balanceTicketCreated'), value: formatNumber(Number(bundle.summary.BALANCE_TICKET_CREATED ?? 0)) },
          { label: tDash('balanceTicketChecked'), value: formatNumber(Number(bundle.summary.BALANCE_TICKET_CHECKED ?? 0)) },
          { label: tDash('ticketCreatedAmount'), value: formatCurrency(Number(bundle.amounts.CREATED_AMOUNT ?? 0)) },
          { label: tDash('ticketCheckedAmount'), value: formatCurrency(Number(bundle.amounts.CHECKED_AMOUNT ?? 0)) }
        ])
      ]
    };
  }
  if(kind === 'popUncheckedUsers')
  {
    const bundle = await fetchPopUncheckedUsers(serverUrl, range);
    return {
      title,
      subtitle,
      sections: [
        section(tDash('supprimeTickets'), mapSupprimeRows(bundle.supprime)),
        section(tDash('nonTraiteTickets'), mapNonTraiteRows(bundle.nonTraite))
      ]
    };
  }
  if(kind === 'popPurcPriceDown')
  {
    const rows = await fetchPopPurcPriceDownList(serverUrl, range);
    return { title, subtitle, sections: [section(tDash('purchasePriceDown'), mapPriceHistoryRows(rows))] };
  }
  if(kind === 'popSalePriceDown')
  {
    const rows = await fetchPopSalePriceDownList(serverUrl, range);
    return { title, subtitle, sections: [section(tDash('salePriceDown'), mapPriceHistoryRows(rows))] };
  }
  if(kind === 'popPurcPriceUp')
  {
    const rows = await fetchPopPurcPriceUpList(serverUrl, range);
    return { title, subtitle, sections: [section(tDash('purchasePriceUp'), mapPriceHistoryRows(rows))] };
  }
  if(kind === 'popSalePriceUp')
  {
    const rows = await fetchPopSalePriceUpList(serverUrl, range);
    return { title, subtitle, sections: [section(tDash('salePriceUp'), mapPriceHistoryRows(rows))] };
  }
  if(kind === 'posDevices')
  {
    const rows = await fetchPosDevices(serverUrl, range);
    return {
      title,
      subtitle,
      sections: [section(tDash('posDevicesTitle'), rows.map((r) => ({
        label: String(r.SAFE_NAME ?? r.SAFE_CODE ?? emptyLabel()),
        value: String(r.SAFE_CODE ?? '')
      })), tDash('noDevices'))]
    };
  }
  if(kind === 'trend')
  {
    return {
      title,
      subtitle,
      sections: [section(tDash('salesTrendsTitle'), ctx.lists.trend.slice(0, 14).map((r) => ({
        label: r.date,
        value: formatCurrency(r.amount)
      })), tDash('noSalesData'))]
    };
  }
  if(kind === 'groups')
  {
    return {
      title,
      subtitle,
      sections: [
        section(tDash('detail'), [
          { label: tDash('soldGroups'), value: formatNumber(ctx.data.allItemGroups) },
          { label: tDash('unsoldGroups'), value: formatNumber(ctx.data.unsoldItemGroups) }
        ]),
        section(tDash('topSellingGroups'), ctx.lists.groups.slice(0, 20).map((r) => ({
          label: r.name,
          value: formatCurrency(r.amount)
        })))
      ]
    };
  }
  if(kind === 'butcher')
  {
    return {
      title,
      subtitle,
      sections: [section(tDash('butcherChanges'), ctx.lists.butchers.map((r) => ({
        label: r.name,
        value: `${formatNumber(r.unchecked)} ${tDash('uncheckedCount')}`,
        sub: formatCurrency(r.amount)
      })), tDash('noButchers'))]
    };
  }
  if(kind === 'loss')
  {
    return {
      title,
      subtitle,
      sections: [section(tDash('lossItemsPopupTitle'), ctx.lists.lossItems.slice(0, 30).map((r) => ({
        label: r.name,
        value: formatCurrency(r.margin),
        sub: r.code,
        accent: '#DC2626'
      })))]
    };
  }
  if(kind === 'promo')
  {
    const p = ctx.lists.promo;
    if(!p)
    {
      return { title, subtitle, sections: [section(tDash('marginStats'), [], tDash('quickNoData'))] };
    }
    return {
      title,
      subtitle,
      sections: [section(tDash('marginStats'), [
        { label: tDash('margin'), value: formatCurrency(p.margin) },
        { label: tDash('marginPercentShort'), value: formatPercent(p.marginRate) },
        { label: tDash('lowMarginHT'), value: formatCurrency(p.sales) }
      ])]
    };
  }
  if(kind === 'loyalty')
  {
    const rows = await fetchPromoLoyaltyInfo(serverUrl, range);
    const row = rows[0];
    return {
      title,
      subtitle,
      sections: [section(tDash('dailyUseLoyalty'), [
        { label: tDash('dailyUseLoyalty'), value: formatCurrency(Number(row?.TOTAL_LOYALTY ?? 0)) },
        { label: tDash('dailySalesCount'), value: formatNumber(Number(row?.TICKET_COUNT ?? 0)) },
        { label: tDash('discountPercent'), value: formatPercent(Number(row?.LOYALTY_PERCENT ?? 0)) }
      ])]
    };
  }
  if(kind === 'promoDetail')
  {
    const rows = await fetchPromoMarginDetail(serverUrl, range);
    return { title, subtitle, sections: [section(tDash('promotionProducts'), mapPromoDetailRows(rows), tDash('noData'))] };
  }
  return { title, subtitle, sections: [section(tDash('detail'), [{ label: title, value: emptyLabel() }])] };
}
