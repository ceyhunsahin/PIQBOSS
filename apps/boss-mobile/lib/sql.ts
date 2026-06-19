import type { SqlSafeRequest } from '@piqboss/shared';
import { emitSqlSafe } from './socket';

export async function sqlSafe<TRecord = Record<string, unknown>>(
  serverUrl: string,
  request: SqlSafeRequest
): Promise<TRecord[]>
{
  return emitSqlSafe<TRecord>(serverUrl, request);
}
