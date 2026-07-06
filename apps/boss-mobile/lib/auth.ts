import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import type { AccessRow, AuthUser, ParamRow } from '@piqboss/shared';
import { useBootstrap } from './bootstrap';
import { buildMenu, type MenuItem } from './menu';
import { loadCompanyInfo } from './company';
import { loadAccessRows, loadParamRows } from './prmAcs';
import { saveLastTenant, saveLastUsername, loadLastTenant, loadRememberPassword } from './tenantConfig';
import { initSocketSession, emitLogin, resetSocket, setSocketLoginPayload, clearSocketLoginPayload } from './socket';
import { registerForPushNotifications, sendPushTokenToServer } from './pushNotifications';
import { setForceLogoutHandler } from './general';
import { clearCredentials, loadCredentials, saveCredentials } from './credentials';
import { setActiveProfile, loadActiveProfileId, loadServerProfiles, upsertServerProfile, type ServerProfile } from './serverProfiles';
import { fetchLoginBootstrap } from './loginBootstrap';

const AUTH_SHA_KEY = 'piqboss.authSha';

type GensrvUser = Record<string, unknown> & {
  CODE?: string;
  NAME?: string;
  GUID?: string;
  SHA?: string;
  USER_APP?: string;
};

type AuthState = {
  user: AuthUser | null;
  gensrvUser: GensrvUser | null;
  tenant: string | null;
  companyName: string | null;
  menuItems: MenuItem[];
  paramRows: ParamRow[];
  accessRows: AccessRow[];
  status: 'idle' | 'loading' | 'authed' | 'error';
  login: (tenant: string, username: string, password: string, company?: { code: string; name: string }) => Promise<void>;
  restoreSession: () => Promise<boolean>;
  switchMarket: (profile: ServerProfile) => Promise<{ ok: boolean; needLogin?: boolean; error?: string; reverted?: boolean; revertedLabel?: string }>;
  logout: () => Promise<void>;
};

function mapGensrvUser(row: GensrvUser, tenant: string): AuthUser
{
  return {
    userId: String(row.GUID ?? row.CODE ?? ''),
    tenant,
    username: String(row.CODE ?? ''),
    displayName: String(row.NAME ?? row.CODE ?? ''),
    roles: String(row.USER_APP ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  };
}

function assertBossAccess(row: GensrvUser): void
{
  const app = String(row.USER_APP ?? '').toUpperCase();
  if(!app.includes('BOSS') && !app.includes('RESP'))
  {
    throw new Error('Bu kullanicinin Boss/Resp erisim yetkisi yok');
  }
}

async function afterLogin(serverUrl: string, row: GensrvUser, tenant: string): Promise<Pick<AuthState, 'user' | 'gensrvUser' | 'tenant' | 'companyName' | 'menuItems' | 'paramRows' | 'accessRows'>>
{
  if(row.SHA)
  {
    await SecureStore.setItemAsync(AUTH_SHA_KEY, String(row.SHA));
  }
  await saveLastTenant(tenant);
  let paramRows: ParamRow[] = [];
  let accessRows: AccessRow[] = [];
  const session = {
    user: mapGensrvUser(row, tenant),
    gensrvUser: row,
    tenant,
    companyName: null as string | null,
    menuItems: buildMenu(String(row.USER_APP ?? ''), []),
    paramRows,
    accessRows
  };
  void (async () =>
  {
    try
    {
      const [loadedParams, loadedAccess, company] = await Promise.all([
        loadParamRows(serverUrl),
        loadAccessRows(serverUrl),
        loadCompanyInfo(serverUrl).catch(() => null)
      ]);
      paramRows = loadedParams;
      accessRows = loadedAccess;
      useAuth.setState({
        paramRows,
        accessRows,
        companyName: company?.name ?? null,
        menuItems: buildMenu(String(row.USER_APP ?? ''), accessRows)
      });
    }
    catch
    {
      // mobileSqlGateway / MOBILE_LOAD_* henuz yoksa varsayilan menu
    }
  })();
  void registerForPushNotifications().then(() =>
  {
    const code = String(row.CODE ?? '');
    if(code)
    {
      void sendPushTokenToServer(serverUrl, code);
    }
  });
  return session;
}

async function resolveTenantForProfile(profile: ServerProfile, fallback = ''): Promise<string>
{
  if(profile.db?.trim())
  {
    return profile.db.trim();
  }
  const data = await fetchLoginBootstrap(profile.url);
  if(data.databases.length > 0)
  {
    return data.databases.some((d) => d.code === data.db) ? data.db : data.databases[0].code;
  }
  return data.db || fallback;
}
async function persistProfileDb(profile: ServerProfile, tenant: string): Promise<void>
{
  if(!tenant || profile.db === tenant)
  {
    return;
  }
  await upsertServerProfile({ ...profile, db: tenant });
}

let restoreInFlight = false;

export const useAuth = create<AuthState>((set) => ({
  user: null,
  gensrvUser: null,
  tenant: null,
  companyName: null,
  menuItems: [],
  paramRows: [],
  accessRows: [],
  status: 'idle',
  login: async (tenant, username, password, company) =>
  {
    const serverUrl = useBootstrap.getState().serverUrl;
    if(!serverUrl)
    {
      throw new Error('Sunucu adresi ayarlanmamis');
    }
    set({ status: 'loading' });
    useBootstrap.getState().setSelectedDb(tenant ?? '');
    try
    {
      initSocketSession(serverUrl);
      const rows = await emitLogin(serverUrl, [username, password, 'BOSS', tenant]);
      const row = rows[0] as GensrvUser;
      assertBossAccess(row);
      if(row.SHA)
      {
        setSocketLoginPayload([String(row.SHA), 'BOSS', tenant]);
      }
      await saveLastUsername(username);
      void saveCredentials({ username, password, tenant });
      const session = await afterLogin(serverUrl, row, tenant);
      set({
        ...session,
        companyName: company?.name ?? session.companyName,
        status: 'authed'
      });
    }
    catch(e)
    {
      set({ status: 'error' });
      throw e;
    }
  },
  restoreSession: async () =>
  {
    if(restoreInFlight)
    {
      return false;
    }
    const serverUrl = useBootstrap.getState().serverUrl;
    if(!serverUrl)
    {
      return false;
    }
    const sha = await SecureStore.getItemAsync(AUTH_SHA_KEY);
    const tenant = await loadLastTenant();
    if(!sha)
    {
      return false;
    }
    restoreInFlight = true;
    set({ status: 'loading' });
    useBootstrap.getState().setSelectedDb(tenant ?? '');
    try
    {
      setSocketLoginPayload([sha, 'BOSS', tenant ?? '']);
      initSocketSession(serverUrl);
      const rows = await emitLogin(serverUrl, [sha, 'BOSS', tenant]);
      const row = rows[0] as GensrvUser;
      assertBossAccess(row);
      if(row.SHA)
      {
        setSocketLoginPayload([String(row.SHA), 'BOSS', tenant ?? '']);
      }
      const session = await afterLogin(serverUrl, row, tenant ?? '');
      set({ ...session, status: 'authed' });
      return true;
    }
    catch
    {
      set({ status: 'idle' });
      return false;
    }
    finally
    {
      restoreInFlight = false;
    }
  },
  switchMarket: async (profile) =>
  {
    const cred = await loadCredentials();
    if(!cred)
    {
      // Sifre saklanmamis (orn. sadece SHA ile restore edilmis) → o market icin giris ekrani
      resetSocket();
      await setActiveProfile(profile);
      useBootstrap.getState().setServerUrl(profile.url);
      clearSocketLoginPayload();
      set({ status: 'idle', user: null, gensrvUser: null, companyName: null, menuItems: [], paramRows: [], accessRows: [] });
      return { ok: false, needLogin: true };
    }
    // Hata durumunda geri donebilmek icin onceki (son calisan) market.
    const prevId = await loadActiveProfileId();
    const prevProfile = prevId ? ((await loadServerProfiles()).find((p) => p.id === prevId) ?? null) : null;
    const connect = async (target: ServerProfile) =>
    {
      const tenant = await resolveTenantForProfile(target, cred.tenant || '');
      resetSocket();
      await setActiveProfile(target);
      useBootstrap.getState().setServerUrl(target.url);
      useBootstrap.getState().setSector(target.module);
      useBootstrap.getState().setSelectedDb(tenant);
      await saveLastTenant(tenant);
      initSocketSession(target.url);
      const rows = await emitLogin(target.url, [cred.username, cred.password, 'BOSS', tenant]);
      const row = rows[0] as GensrvUser;
      assertBossAccess(row);
      if(row.SHA)
      {
        setSocketLoginPayload([String(row.SHA), 'BOSS', tenant]);
      }
      await saveLastUsername(cred.username);
      void saveCredentials({ username: cred.username, password: cred.password, tenant });
      const session = await afterLogin(target.url, row, tenant);
      await persistProfileDb(target, tenant);
      set({ ...session, status: 'authed' });
    };
    set({ status: 'loading' });
    try
    {
      await connect(profile);
      return { ok: true };
    }
    catch(e)
    {
      const error = (e as Error).message;
      // Secilen markete gecilemedi → login'e dusurmeden (status 'loading' kalir) son calisan markete geri baglan.
      if(prevProfile && prevProfile.id !== profile.id)
      {
        try
        {
          await connect(prevProfile);
          return { ok: false, reverted: true, revertedLabel: prevProfile.label, error };
        }
        catch
        {
          // Geri baglanma da basarisiz → asagida error durumuna dusulur.
        }
      }
      set({ status: 'error' });
      return { ok: false, error };
    }
  },
  logout: async () =>
  {
    await SecureStore.deleteItemAsync(AUTH_SHA_KEY);
    const rememberPwd = await loadRememberPassword();
    if(!rememberPwd)
    {
      await clearCredentials();
    }
    clearSocketLoginPayload();
    resetSocket();
    set({
      user: null,
      gensrvUser: null,
      tenant: null,
      companyName: null,
      menuItems: [],
      paramRows: [],
      accessRows: [],
      status: 'idle'
    });
  }
}));

setForceLogoutHandler(async () =>
{
  await useAuth.getState().logout();
});
