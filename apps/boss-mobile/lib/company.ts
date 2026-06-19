import { SystemQueryIds } from '@piqboss/shared';
import { sqlSafe } from './sql';

export type CompanyInfo = {
  code: string;
  name: string;
};

export async function loadCompanyInfo(serverUrl: string): Promise<CompanyInfo | null>
{
  const rows = await sqlSafe<{ CODE?: string; NAME?: string }>(serverUrl, {
    queryId: SystemQueryIds.COMPANY_INFO,
    param: [],
    value: []
  });
  const row = rows[0];
  if(!row?.NAME)
  {
    return null;
  }
  return {
    code: String(row.CODE ?? ''),
    name: String(row.NAME)
  };
}
