import type { OffDashboardSnapshot } from '@piqboss/shared';
import type { DateRange } from '@/lib/dateRange';
import { sqlSafe } from '@/lib/sql';
import { mapPool } from '@/lib/concurrency';
import { OFF_DASHBOARD_QUERIES } from './queries';

type Row = Record<string, unknown>;
type PatchFn = (patch: Partial<OffDashboardSnapshot>) => void;

function readField(row: Row | undefined, field: string): number
{
  const raw = row?.[field];
  if(raw == null || raw === '')
  {
    return 0;
  }
  const n = parseFloat(String(raw));
  return Number.isFinite(n) ? n : 0;
}

function isFatalSqlError(err: unknown): boolean
{
  const msg = String((err as Error)?.message ?? err ?? '');
  return msg.includes('Oturum gecersiz')
    || msg.includes('mobileSqlGateway')
    || msg.includes('sql-safe yanit')
    || msg.includes('socket timeout')
    || msg.includes('socket not connected');
}
/** dashboardOff.js getQuery: her KPI bagimsiz, gelen deger aninda patch edilir. */
export async function loadOffDashboardKpis(
  serverUrl: string,
  range: DateRange,
  onPatch: PatchFn,
  signal?: AbortSignal
): Promise<void>
{
  let fatal: Error | null = null;
  // KPI'lar hafif ve bagimsiz; sunucu havuzu (max 10) bos. Eszamanliligi artirinca
  // ~5 dalga -> ~2 dalgaya iner, ilk yukleme belirgin hizlanir.
  await mapPool(OFF_DASHBOARD_QUERIES, 8, async (def) =>
  {
    const value = def.value === 'none' ? [] : [range.from, range.to];
    try
    {
      const rows = await sqlSafe<Row>(serverUrl, { queryId: def.queryId, param: [], value });
      if(signal?.aborted)
      {
        return;
      }
      const patch: Partial<OffDashboardSnapshot> = {};
      for(const fld of def.fields)
      {
        patch[fld.key] = readField(rows[0], fld.col);
      }
      onPatch(patch);
    }
    catch(err)
    {
      if(signal?.aborted)
      {
        return;
      }
      if(isFatalSqlError(err))
      {
        if(!fatal)
        {
          fatal = err instanceof Error ? err : new Error(String(err));
        }
        return;
      }
      const patch: Partial<OffDashboardSnapshot> = {};
      for(const fld of def.fields)
      {
        patch[fld.key] = 0;
      }
      onPatch(patch);
    }
  });
  if(fatal)
  {
    throw fatal;
  }
}
