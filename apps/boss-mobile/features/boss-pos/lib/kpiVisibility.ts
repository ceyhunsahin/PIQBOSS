import type { ParamRow } from '@piqboss/shared';

export function isKpiVisible(paramRows: ParamRow[], prmId?: string): boolean
{
  if(!prmId)
  {
    return true;
  }
  const row = paramRows.find((r) => r.ID === prmId && r.APP === 'BOSS');
  if(!row?.VALUE)
  {
    return true;
  }
  try
  {
    const parsed = JSON.parse(row.VALUE) as { value?: boolean };
    if(typeof parsed.value === 'boolean')
    {
      return parsed.value;
    }
  }
  catch
  {
    // ignore
  }
  return true;
}
