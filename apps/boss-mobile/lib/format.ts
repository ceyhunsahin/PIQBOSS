export function formatCurrency(value: number, locale = 'fr-FR'): string
{
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(value || 0);
}

export function formatNumber(value: number, locale = 'fr-FR'): string
{
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value || 0);
}

export function formatPercent(value: number, locale = 'fr-FR'): string
{
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 1
  }).format((value || 0) / 100);
}
