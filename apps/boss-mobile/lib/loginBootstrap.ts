import { initSocketSession, waitForConnectPublic } from './socket';

export type LoginCompany = {
  code: string;
  name: string;
};

export type LoginBossUser = {
  code: string;
  name: string;
};

type BootstrapResponse = {
  status?: string;
  msg?: string;
  companies?: Array<{ CODE?: string; NAME?: string }>;
  users?: Array<{ CODE?: string; NAME?: string; USER_APP?: string }>;
};

function mapCompanies(rows: BootstrapResponse['companies']): LoginCompany[]
{
  return (rows ?? [])
    .map((r) => ({ code: String(r.CODE ?? ''), name: String(r.NAME ?? r.CODE ?? '') }))
    .filter((x) => x.code !== '' || x.name !== '');
}

function mapBossUsers(rows: BootstrapResponse['users']): LoginBossUser[]
{
  return (rows ?? [])
    .filter((r) => String(r.USER_APP ?? '').toUpperCase().includes('BOSS'))
    .map((r) => ({ code: String(r.CODE ?? ''), name: String(r.NAME ?? r.CODE ?? '') }))
    .filter((x) => x.code !== '');
}

export async function fetchLoginBootstrap(serverUrl: string): Promise<{ companies: LoginCompany[]; users: LoginBossUser[] }>
{
  const url = serverUrl.replace(/\/+$/, '');
  const socket = initSocketSession(url);
  await waitForConnectPublic(socket);
  const res = await new Promise<BootstrapResponse>((resolve, reject) =>
  {
    const timeout = setTimeout(() => reject(new Error('login bootstrap timeout')), 30000);
    socket.emit('mobile-login-bootstrap', {}, (payload: BootstrapResponse) =>
    {
      clearTimeout(timeout);
      resolve(payload ?? {});
    });
  });
  if(res.status === 'OK')
  {
    return {
      companies: mapCompanies(res.companies),
      users: mapBossUsers(res.users)
    };
  }
  throw new Error(String(res.msg ?? 'login bootstrap failed'));
}
