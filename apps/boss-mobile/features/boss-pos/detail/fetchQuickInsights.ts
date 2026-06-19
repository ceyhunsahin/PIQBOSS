import { ExtraQueryIds } from '@piqboss/shared';
import type { DateRange } from '@/lib/dateRange';
import { toIsoDate } from '@/lib/dateRange';
import { formatCurrency, formatNumber } from '@/lib/format';
import { tDash } from '@/lib/i18n';
import { mapPool } from '@/lib/concurrency';
import { sqlSafe } from '@/lib/sql';

type Row = Record<string, unknown>;

export type QuickRow = { value: string; sub: string };
export type QuickCard = {
  id: string;
  title: string;
  description: string;
  criterion: string;
  accent: string;
  icon: string;
  rows: QuickRow[];
};

const QUICK_ICONS: Record<string, string> = {
  monthFavorite: 'trophy',
  weekFavorite: 'star',
  rangePromoTopProduct: 'pricetags',
  rangeBestGroup: 'grid',
  discountMonth: 'pricetag',
  loyaltyMonth: 'gift',
  monthCa: 'cash',
  lastYearMonthCa: 'time',
  bestMonthCa: 'trending-up',
  bestWeekCa: 'calendar-number',
  bestMonthMargin: 'analytics',
  bestDayMonthCa: 'sunny',
  bestDayWeekCa: 'today',
  bestMonthBasket: 'cart'
};

function num(v: unknown): number
{
  if(v == null || v === '')
  {
    return 0;
  }
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}
function pad2(n: number): string
{
  return String(n).padStart(2, '0');
}
function monthName(m: number): string
{
  return tDash(`quickMonth${pad2(m)}`);
}
function dayName(weekday: number): string
{
  return tDash(`quickDay${weekday}`);
}
function monthYear(year: unknown, month: unknown): string
{
  const y = num(year);
  const m = num(month);
  return y && m ? `${monthName(m)} ${y}` : '-';
}
function dayDate(value: unknown): string
{
  const d = new Date(String(value));
  if(Number.isNaN(d.getTime()))
  {
    return '-';
  }
  const wd = d.getDay() || 7;
  return `${dayName(wd)} ${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
}
function marginSub(r: Row): string
{
  return `${tDash('quickMargin')}: ${formatCurrency(num(r.MARGIN_HT))} / ${num(r.MARGIN_PERCENT).toFixed(1)}%`;
}

type CardDef = {
  id: string;
  queryId: string;
  titleKey: string;
  descKey: string;
  critKey: string;
  accent: string;
  value: [string, string];
  map: (r: Row) => QuickRow;
};

function buildDefs(range: DateRange): CardDef[]
{
  const today = new Date();
  const monthStart = toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1));
  const monthEnd = toIsoDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));
  const yearStart = toIsoDate(new Date(today.getFullYear(), 0, 1));
  const yearEnd = toIsoDate(new Date(today.getFullYear(), 11, 31));
  const lyStart = toIsoDate(new Date(today.getFullYear() - 1, today.getMonth(), 1));
  const lyEnd = toIsoDate(new Date(today.getFullYear() - 1, today.getMonth() + 1, 0));
  const day = today.getDay() || 7;
  const ws = new Date(today);
  ws.setDate(today.getDate() - day + 1);
  const we = new Date(ws);
  we.setDate(ws.getDate() + 6);
  const weekStart = toIsoDate(ws);
  const weekEnd = toIsoDate(we);
  const sel: [string, string] = [range.from, range.to];
  const tickets = tDash('quickTickets');
  return [
    {
      id: 'monthFavorite', queryId: ExtraQueryIds.BOSS_POS_QUICKMONTHFAVORITE,
      titleKey: 'quickMonthFavorite', descKey: 'quickDescMonthFavorite', critKey: 'quickCritMarginPct',
      accent: '#ca8a04', value: [monthStart, monthEnd],
      map: (r) => ({ value: String(r.ITEM_NAME ?? '-'), sub: `${marginSub(r)} / ${formatNumber(num(r.QTY))} ${tDash('quickUnitSold')}` })
    },
    {
      id: 'weekFavorite', queryId: ExtraQueryIds.BOSS_POS_QUICKWEEKFAVORITE,
      titleKey: 'quickWeekFavorite', descKey: 'quickDescWeekFavorite', critKey: 'quickCritMarginPct',
      accent: '#f59e0b', value: [weekStart, weekEnd],
      map: (r) => ({ value: String(r.ITEM_NAME ?? '-'), sub: `${marginSub(r)} / ${formatNumber(num(r.QTY))} ${tDash('quickUnitSold')}` })
    },
    {
      id: 'rangePromoTopProduct', queryId: ExtraQueryIds.BOSS_POS_QUICKRANGEPROMOTOPPRODUCT,
      titleKey: 'quickRangePromoTopProduct', descKey: 'quickDescPromoTop', critKey: 'quickCritPromoCount',
      accent: '#ea580c', value: sel,
      map: (r) => ({ value: String(r.ITEM_NAME ?? '-'), sub: `${formatNumber(num(r.CNT))} ${tDash('quickPromoCount')}` })
    },
    {
      id: 'rangeBestGroup', queryId: ExtraQueryIds.BOSS_POS_QUICKRANGEBESTGROUP,
      titleKey: 'quickRangeBestGroup', descKey: 'quickDescBestGroup', critKey: 'quickCritTotalCa',
      accent: '#4f46e5', value: sel,
      map: (r) => ({ value: String(r.ITEM_GRP_NAME ?? '-'), sub: formatCurrency(num(r.TOTAL_CA)) })
    },
    {
      id: 'discountMonth', queryId: ExtraQueryIds.BOSS_POS_QUICKDISCOUNTMONTH,
      titleKey: 'quickDiscountMonth', descKey: 'quickDescDiscount', critKey: 'quickCritDiscountTotal',
      accent: '#dc2626', value: [monthStart, monthEnd],
      map: (r) => ({ value: formatCurrency(num(r.DISCOUNT_TOTAL)), sub: `${formatNumber(num(r.TICKET_COUNT))} ${tickets}` })
    },
    {
      id: 'loyaltyMonth', queryId: ExtraQueryIds.BOSS_POS_QUICKLOYALTYMONTH,
      titleKey: 'quickLoyaltyMonth', descKey: 'quickDescLoyalty', critKey: 'quickCritLoyaltyTotal',
      accent: '#be185d', value: [monthStart, monthEnd],
      map: (r) => ({ value: formatCurrency(num(r.LOYALTY_TOTAL)), sub: `${formatNumber(num(r.TICKET_COUNT))} ${tickets}` })
    },
    {
      id: 'monthCa', queryId: ExtraQueryIds.BOSS_POS_QUICKMONTHCA,
      titleKey: 'quickMonthRevenue', descKey: 'quickDescMonthCa', critKey: 'quickCritMonthCa',
      accent: '#16a34a', value: [monthStart, monthEnd],
      map: (r) => ({ value: formatCurrency(num(r.TOTAL_CA)), sub: marginSub(r) })
    },
    {
      id: 'lastYearMonthCa', queryId: ExtraQueryIds.BOSS_POS_QUICKLASTYEARMONTHCA,
      titleKey: 'quickLastYearThisMonth', descKey: 'quickDescLastYearMonth', critKey: 'quickCritLastMonthCa',
      accent: '#7c3aed', value: [lyStart, lyEnd],
      map: (r) => ({ value: formatCurrency(num(r.TOTAL_CA)), sub: marginSub(r) })
    },
    {
      id: 'bestMonthCa', queryId: ExtraQueryIds.BOSS_POS_QUICKBESTMONTHCA,
      titleKey: 'quickBestMonthRevenue', descKey: 'quickDescBestMonthCa', critKey: 'quickCritBestMonthCa',
      accent: '#16a34a', value: [yearStart, yearEnd],
      map: (r) => ({ value: monthYear(r.SALE_YEAR, r.SALE_MONTH), sub: formatCurrency(num(r.TOTAL_CA)) })
    },
    {
      id: 'bestWeekCa', queryId: ExtraQueryIds.BOSS_POS_QUICKBESTWEEKCA,
      titleKey: 'quickBestWeekRevenue', descKey: 'quickDescBestWeekCa', critKey: 'quickCritBestWeekCa',
      accent: '#2563eb', value: [yearStart, yearEnd],
      map: (r) =>
      {
        const start = r.WEEK_START ? new Date(String(r.WEEK_START)) : null;
        let rangeLabel = '';
        if(start && !Number.isNaN(start.getTime()))
        {
          const sd = start.getDay() || 7;
          const ms = new Date(start);
          ms.setDate(start.getDate() - sd + 1);
          const me = new Date(ms);
          me.setDate(ms.getDate() + 6);
          rangeLabel = ` | ${pad2(ms.getDate())}.${pad2(ms.getMonth() + 1)} - ${pad2(me.getDate())}.${pad2(me.getMonth() + 1)}`;
        }
        return { value: r.SALE_WEEK ? `${tDash('quickWeekShort')} ${num(r.SALE_WEEK)}` : '-', sub: `${formatCurrency(num(r.TOTAL_CA))}${rangeLabel}` };
      }
    },
    {
      id: 'bestDayMonthCa', queryId: ExtraQueryIds.BOSS_POS_QUICKBESTDAYMONTHCA,
      titleKey: 'quickBestDayMonth', descKey: 'quickDescBestDayMonth', critKey: 'quickCritBestDayCa',
      accent: '#0f766e', value: [monthStart, monthEnd],
      map: (r) => ({ value: dayDate(r.DOC_DATE), sub: formatCurrency(num(r.TOTAL_CA)) })
    },
    {
      id: 'bestDayWeekCa', queryId: ExtraQueryIds.BOSS_POS_QUICKBESTDAYWEEKCA,
      titleKey: 'quickBestDayWeek', descKey: 'quickDescBestDayWeek', critKey: 'quickCritBestDayCa',
      accent: '#0891b2', value: [weekStart, weekEnd],
      map: (r) => ({ value: dayDate(r.DOC_DATE), sub: formatCurrency(num(r.TOTAL_CA)) })
    },
    {
      id: 'bestMonthMargin', queryId: ExtraQueryIds.BOSS_POS_QUICKBESTMONTHMARGIN,
      titleKey: 'quickBestMonthMargin', descKey: 'quickDescBestMonthMargin', critKey: 'quickCritBestMonthMargin',
      accent: '#15803d', value: [yearStart, yearEnd],
      map: (r) => ({ value: monthYear(r.SALE_YEAR, r.SALE_MONTH), sub: `${formatCurrency(num(r.MARGIN_HT))} / ${num(r.MARGIN_PERCENT).toFixed(1)}%` })
    },
    {
      id: 'bestMonthBasket', queryId: ExtraQueryIds.BOSS_POS_QUICKBESTMONTHBASKET,
      titleKey: 'quickBestMonthBasket', descKey: 'quickDescBestMonthBasket', critKey: 'quickCritBestMonthBasket',
      accent: '#0d9488', value: [yearStart, yearEnd],
      map: (r) => ({ value: monthYear(r.SALE_YEAR, r.SALE_MONTH), sub: `${formatCurrency(num(r.AVG_BASKET))} · ${formatNumber(num(r.TICKET_COUNT))} ${tickets}` })
    }
  ];
}

export async function loadQuickInsights(serverUrl: string, range: DateRange): Promise<QuickCard[]>
{
  const defs = buildDefs(range);
  const cards: QuickCard[] = new Array(defs.length);
  await mapPool(defs, 3, async (def, index) =>
  {
    let rows: QuickRow[] = [];
    try
    {
      const raw = await sqlSafe<Row>(serverUrl, { queryId: def.queryId, param: [], value: def.value });
      rows = raw.map(def.map).filter((r) => r.value && r.value !== '-');
    }
    catch
    {
      rows = [];
    }
    cards[index] = {
      id: def.id,
      title: tDash(def.titleKey),
      description: tDash(def.descKey),
      criterion: tDash(def.critKey),
      accent: def.accent,
      icon: QUICK_ICONS[def.id] ?? 'sparkles',
      rows
    };
  });
  return cards;
}
