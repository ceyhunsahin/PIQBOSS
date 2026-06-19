import i18n from './i18n';

export type DateRange = {
  from: string;
  to: string;
};

export type DatePresetId =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'lastYear'
  | 'custom';

export type DatePreset = {
  id: DatePresetId;
  range: DateRange;
};

function pad(n: number): string
{
  return String(n).padStart(2, '0');
}

export function toIsoDate(d: Date): string
{
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseIsoDate(value: string): Date
{
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function startOfDay(d: Date): Date
{
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfIsoWeek(d: Date): Date
{
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + 1);
  return startOfDay(monday);
}

function endOfIsoWeek(d: Date): Date
{
  const start = startOfIsoWeek(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return startOfDay(end);
}

export function buildDatePresets(now = new Date()): DatePreset[]
{
  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const lastWeekStart = startOfIsoWeek(new Date(today));
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
  const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
  return [
    { id: 'today', range: { from: toIsoDate(today), to: toIsoDate(today) } },
    { id: 'yesterday', range: { from: toIsoDate(yesterday), to: toIsoDate(yesterday) } },
    {
      id: 'thisWeek',
      range: { from: toIsoDate(startOfIsoWeek(today)), to: toIsoDate(endOfIsoWeek(today)) }
    },
    {
      id: 'lastWeek',
      range: { from: toIsoDate(lastWeekStart), to: toIsoDate(lastWeekEnd) }
    },
    {
      id: 'thisMonth',
      range: { from: toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)), to: toIsoDate(today) }
    },
    {
      id: 'lastMonth',
      range: { from: toIsoDate(lastMonthStart), to: toIsoDate(lastMonthEnd) }
    },
    {
      id: 'thisYear',
      range: { from: toIsoDate(new Date(today.getFullYear(), 0, 1)), to: toIsoDate(today) }
    },
    {
      id: 'lastYear',
      range: { from: toIsoDate(lastYearStart), to: toIsoDate(lastYearEnd) }
    }
  ];
}

export function getDatePreset(preset: DatePresetId, custom?: DateRange): DateRange
{
  if(preset === 'custom' && custom?.from && custom?.to)
  {
    return normalizeRange(custom);
  }
  const found = buildDatePresets().find((p) => p.id === preset);
  return found?.range ?? buildDatePresets()[0].range;
}

export function normalizeRange(range: DateRange): DateRange
{
  const from = range.from;
  let to = range.to;
  if(parseIsoDate(from) > parseIsoDate(to))
  {
    to = from;
  }
  return { from, to };
}

export function formatDisplayDate(iso: string): string
{
  const d = parseIsoDate(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function formatRangeLabel(range: DateRange): string
{
  const sep = i18n.t('mobileExtra.rangeSeparator');
  if(range.from === range.to)
  {
    return formatDisplayDate(range.from);
  }
  return `${formatDisplayDate(range.from)}${sep}${formatDisplayDate(range.to)}`;
}
