import * as SecureStore from 'expo-secure-store';

const TENANTS_KEY = 'piqboss.tenants';
const LAST_USER_KEY = 'piqboss.lastUser';
const LAST_TENANT_KEY = 'piqboss.lastTenant';
const REMEMBER_PWD_KEY = 'piqboss.rememberPwd';

export type TenantOption = {
  db: string;
  label: string;
};

const DEFAULT_TENANTS: TenantOption[] = [{ db: 'GENDB', label: 'GENDB' }];

export async function loadTenants(): Promise<TenantOption[]>
{
  const raw = await SecureStore.getItemAsync(TENANTS_KEY);
  if(!raw)
  {
    return [...DEFAULT_TENANTS];
  }
  try
  {
    const parsed = JSON.parse(raw) as TenantOption[];
    return parsed.length > 0 ? parsed : [...DEFAULT_TENANTS];
  }
  catch
  {
    return [...DEFAULT_TENANTS];
  }
}

export async function saveTenants(list: TenantOption[]): Promise<void>
{
  await SecureStore.setItemAsync(TENANTS_KEY, JSON.stringify(list));
}

export async function loadLastUsername(): Promise<string>
{
  return (await SecureStore.getItemAsync(LAST_USER_KEY)) ?? '';
}

export async function saveLastUsername(username: string): Promise<void>
{
  await SecureStore.setItemAsync(LAST_USER_KEY, username);
}

export async function loadLastTenant(): Promise<string>
{
  return (await SecureStore.getItemAsync(LAST_TENANT_KEY)) ?? 'GENDB';
}

export async function saveLastTenant(db: string): Promise<void>
{
  await SecureStore.setItemAsync(LAST_TENANT_KEY, db);
}
/** Sifre hatirlama tercihi (varsayilan acik). */
export async function loadRememberPassword(): Promise<boolean>
{
  const v = await SecureStore.getItemAsync(REMEMBER_PWD_KEY);
  return v == null ? true : v === '1';
}
export async function saveRememberPassword(value: boolean): Promise<void>
{
  await SecureStore.setItemAsync(REMEMBER_PWD_KEY, value ? '1' : '0');
}
