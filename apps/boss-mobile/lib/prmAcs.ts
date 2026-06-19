import { SystemQueryIds, type AccessRow, type ParamRow } from '@piqboss/shared';
import { sqlSafe } from './sql';

export async function loadParamRows(serverUrl: string): Promise<ParamRow[]>
{
  return sqlSafe<ParamRow>(serverUrl, {
    queryId: SystemQueryIds.LOAD_PARAM,
    param: ['APP:string|50', 'USERS:string|50', 'ID:string|50'],
    value: ['BOSS', '-1', '']
  });
}

export async function loadAccessRows(serverUrl: string): Promise<AccessRow[]>
{
  return sqlSafe<AccessRow>(serverUrl, {
    queryId: SystemQueryIds.LOAD_ACCESS,
    param: ['APP:string|50', 'USERS:string|50', 'ID:string|50', 'PAGE:string|50', 'ELEMENT:string|50'],
    value: ['BOSS', '-1', '', '', '']
  });
}

export function parseAccessValue(raw?: string): { visible?: boolean; editable?: boolean }
{
  if(!raw)
  {
    return { visible: true, editable: true };
  }
  try
  {
    return JSON.parse(raw) as { visible?: boolean; editable?: boolean };
  }
  catch
  {
    return { visible: true, editable: true };
  }
}
