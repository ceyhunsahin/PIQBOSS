import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { DetailContent } from '@/features/boss-pos/detail/types';
import i18n, { tDash } from '@/lib/i18n';

function esc(text: string): string
{
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml(content: DetailContent): string
{
  const sections = content.sections.map((section) =>
  {
    const rows = section.rows.length === 0
      ? `<tr><td colspan="2" class="empty">${esc(section.emptyText ?? tDash('noData'))}</td></tr>`
      : section.rows.map((row) =>
        `
        <tr>
          <td class="label">
            <div>${esc(row.label)}</div>
            ${row.sub ? `<div class="sub">${esc(row.sub)}</div>` : ''}
          </td>
          <td class="value" style="${row.accent ? `color:${row.accent}` : ''}">${esc(row.value)}</td>
        </tr>
      `).join('');
    return `
      <section>
        <h2>${esc(section.title)}</h2>
        <table>${rows}</table>
      </section>
    `;
  }).join('');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a; padding: 24px; }
    h1 { font-size: 22px; margin: 0 0 4px; color: #007bff; }
    .subhead { color: #64748b; font-size: 12px; margin-bottom: 20px; }
    section { margin-bottom: 20px; page-break-inside: avoid; }
    h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin: 0 0 8px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 10px 0; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    .label { width: 62%; font-weight: 600; }
    .sub { font-size: 11px; color: #94a3b8; margin-top: 2px; font-weight: 400; }
    .value { text-align: right; font-weight: 800; color: #007bff; white-space: nowrap; }
    .empty { color: #94a3b8; font-style: italic; }
  </style>
</head>
<body>
  <h1>${esc(content.title)}</h1>
  <div class="subhead">${esc(content.subtitle)} · ${esc(i18n.t('lblLogin'))}</div>
  ${sections}
</body>
</html>`;
}

export async function exportDetailPdf(content: DetailContent): Promise<void>
{
  const html = buildHtml(content);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if(canShare)
  {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: content.title });
  }
}
