export function formatCurrency(value: number, locale = 'fr-FR'): string
{
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0);
}

export function formatNumber(value: number, locale = 'fr-FR'): string
{
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value || 0);
}

/** Miktar/agirlik gosterimi: float kuyruklarini temizler (max 2 ondalik, gereksiz sifirlar atilir). */
export function formatQuantity(value: number, locale = 'fr-FR'): string
{
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value || 0);
}

export function formatPercent(value: number, locale = 'fr-FR'): string
{
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 1
  }).format((value || 0) / 100);
}
