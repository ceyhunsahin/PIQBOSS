import type { PosDashboardSnapshot } from '@piqboss/shared';
import type { DateRange } from '@/lib/dateRange';
import { sqlSafe } from '@/lib/sql';
import { mapPool } from '@/lib/concurrency';
import { POS_DASHBOARD_QUERIES } from './queries';

type Row = Record<string, unknown>;
type PatchFn = (patch: Partial<PosDashboardSnapshot>) => void;

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
/** Legacy getSalesData/getExtra: her sorgu bagimsiz, gelen KPI aninda patch edilir. */
export async function loadPosDashboardKpis(
  serverUrl: string,
  range: DateRange,
  onPatch: PatchFn,
  signal?: AbortSignal
): Promise<void>
{
  let fatal: Error | null = null;
  // overview'da KPI + lists ayni anda calisir; KPI sorgulari sargable filtrelerle hafif.
  // Eszamanligi 6'ya cikarinca KPI dalgalari ~7 -> ~5'e iner (KPI 6 + lists 3 = 9, havuz max 10).
  await mapPool(POS_DASHBOARD_QUERIES, 6, async (def) =>
  {
    const value = def.valueMode === 'none' ? [] : [range.from, range.to];
    try
    {
      const rows = await sqlSafe<Row>(serverUrl, { queryId: def.queryId, param: [], value });
      if(signal?.aborted)
      {
        return;
      }
      onPatch({ [def.stateKey]: readField(rows[0], def.field) });
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
      onPatch({ [def.stateKey]: 0 });
    }
  });
  if(fatal)
  {
    throw fatal;
  }
}
