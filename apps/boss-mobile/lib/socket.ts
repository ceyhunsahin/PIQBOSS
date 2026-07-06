import { io, Socket } from 'socket.io-client';
import i18n from './i18n';
import { useBootstrap } from './bootstrap';
import { attachGeneralListener } from './general';

function connectErrorMessage(): string
{
  return i18n.t('msgSocketConnectFailed');
}

let socket: Socket | null = null;
let currentUrl: string | null = null;
let sessionInitialized = false;
let loginPayload: unknown[] | null = null;
let authenticatedSocketId: string | null = null;
let pendingLogin: Promise<void> | null = null;

export function setSocketLoginPayload(payload: unknown[] | null): void
{
  loginPayload = payload;
}

export function clearSocketLoginPayload(): void
{
  loginPayload = null;
  authenticatedSocketId = null;
  pendingLogin = null;
}

function markLoginSuccess(): void
{
  authenticatedSocketId = socket?.id ?? null;
}

function clearLoginState(): void
{
  authenticatedSocketId = null;
}

export function resetSocket(): void
{
  if(socket)
  {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    currentUrl = null;
    sessionInitialized = false;
    clearLoginState();
    pendingLogin = null;
  }
}

function waitForConnect(s: Socket, timeoutMs = 30000): Promise<void>
{
  if(s.connected)
  {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) =>
  {
    const cleanup = () =>
    {
      clearTimeout(timeout);
      s.off('connect', onConnect);
      s.off('connect_error', onError);
    };
    const timeout = setTimeout(() =>
    {
      cleanup();
      reject(new Error(connectErrorMessage()));
    }, timeoutMs);
    const onConnect = () =>
    {
      cleanup();
      resolve();
    };
    const onError = () =>
    {
      cleanup();
      reject(new Error(connectErrorMessage()));
    };
    s.on('connect', onConnect);
    s.on('connect_error', onError);
  });
}

export function waitForConnectPublic(s: Socket, timeoutMs = 30000): Promise<void>
{
  return waitForConnect(s, timeoutMs);
}

function attachSessionHandlers(s: Socket): void
{
  s.on('disconnect', () =>
  {
    clearLoginState();
  });
}

/**
 * Sunucu URL'ini io() hedefi (origin) ve socket.io path'ine ayirir.
 * Reverse-proxy alt yolu (orn. piqpos.net/pos) socket.io'da namespace degil
 * `path` ile cozulur: io("https://host", { path: "/pos/socket.io/" }).
 */
function splitSocketTarget(fullUrl: string): { origin: string; path: string }
{
  const clean = fullUrl.replace(/\/+$/, '');
  const match = clean.match(/^(https?:\/\/[^/]+)(\/.*)?$/i);
  if(!match)
  {
    return { origin: clean, path: '/socket.io/' };
  }
  const origin = match[1];
  const base = (match[2] || '').replace(/\/+$/, '');
  return { origin, path: base ? `${base}/socket.io/` : '/socket.io/' };
}

export function getSocket(serverUrl: string): Socket
{
  const url = serverUrl.replace(/\/+$/, '');
  if(socket && currentUrl === url)
  {
    return socket;
  }
  resetSocket();
  currentUrl = url;
  const target = splitSocketTarget(url);
  socket = io(target.origin, {
    path: target.path,
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 100000
  });
  return socket;
}

export function initSocketSession(serverUrl: string): Socket
{
  const url = serverUrl.replace(/\/+$/, '');
  const s = getSocket(url);
  if(!sessionInitialized)
  {
    sessionInitialized = true;
    attachGeneralListener(s);
    attachSessionHandlers(s);
  }
  return s;
}

function resolveServerUrl(serverUrl?: string): string
{
  const url = serverUrl ?? useBootstrap.getState().serverUrl;
  if(!url)
  {
    throw new Error(i18n.t('msgServerUrlMissing'));
  }
  return url;
}

function normalizeLoginPayload(param: unknown): unknown[]
{
  if(Array.isArray(param))
  {
    return param;
  }
  if(param && typeof param === 'object')
  {
    const p = param as {
      user?: string;
      username?: string;
      pwd?: string;
      password?: string;
      app?: string;
      db?: string;
      tenant?: string;
    };
    return [
      p.user ?? p.username ?? '',
      p.pwd ?? p.password ?? '',
      p.app ?? 'BOSS',
      p.db ?? p.tenant ?? ''
    ];
  }
  throw new Error('Gecersiz login parametresi');
}

function emitRaw<TResult>(
  s: Socket,
  event: string,
  payload: unknown,
  timeoutMs: number
): Promise<TResult>
{
  return new Promise((resolve, reject) =>
  {
    const timeout = setTimeout(() =>
    {
      reject(new Error(`socket timeout: ${event}`));
    }, timeoutMs);
    s.emit(event, payload, (res: unknown) =>
    {
      clearTimeout(timeout);
      resolve(res as TResult);
    });
  });
}

function isAuthenticatedOnCurrentSocket(): boolean
{
  return !!socket?.connected && !!authenticatedSocketId && authenticatedSocketId === socket.id;
}

async function ensureSocketAuthenticated(serverUrl: string): Promise<void>
{
  if(isAuthenticatedOnCurrentSocket())
  {
    return;
  }
  if(!loginPayload)
  {
    throw new Error('Oturum gecersiz — tekrar giris yapin');
  }
  if(pendingLogin)
  {
    await pendingLogin;
    if(isAuthenticatedOnCurrentSocket())
    {
      return;
    }
  }
  const url = resolveServerUrl(serverUrl);
  initSocketSession(url);
  pendingLogin = (async () =>
  {
    const s = socket;
    if(!s)
    {
      throw new Error('socket not connected');
    }
    await waitForConnect(s);
    if(isAuthenticatedOnCurrentSocket())
    {
      return;
    }
    const rows = await emitRaw<Record<string, unknown>[]>(s, 'login', loginPayload, 60000);
    if(!Array.isArray(rows) || rows.length === 0)
    {
      throw new Error('Oturum yenilenemedi');
    }
    markLoginSuccess();
  })().finally(() =>
  {
    pendingLogin = null;
  });
  await pendingLogin;
}

function parseLoginResponse(res: unknown): Record<string, unknown>[]
{
  const rows = res as Record<string, unknown>[];
  if(Array.isArray(rows) && rows.length > 0)
  {
    return rows;
  }
  throw new Error('Gecersiz kullanici veya sifre');
}

function parseSqlSafeResponse<TResult>(res: unknown): TResult
{
  const r = res as {
    status?: string;
    result?: { recordset?: TResult; err?: unknown };
    msg?: string;
    auth_err?: unknown;
  };
  if(r?.auth_err)
  {
    clearLoginState();
    throw new Error('Oturum gecersiz — tekrar giris yapin');
  }
  if(r?.status === 'ERR')
  {
    throw new Error(String(r.msg ?? 'sql-safe hatasi'));
  }
  if(r?.status === 'OK')
  {
    return (r.result?.recordset ?? []) as TResult;
  }
  throw new Error('sql-safe yanit yok — sunucuda mobileSqlGateway aktif mi? node server yeniden baslatildi mi?');
}

/** gensrv socket callback → Promise (login, sql-safe). BOSS_MIMARI Bölüm 16. */
export async function emitAsync<TResult = unknown>(
  event: string,
  param?: unknown,
  serverUrl?: string
): Promise<TResult>
{
  const url = resolveServerUrl(serverUrl);
  initSocketSession(url);
  const s = socket;
  if(!s)
  {
    throw new Error('socket not connected');
  }
  await waitForConnect(s);
  if(event === 'sql-safe')
  {
    await ensureSocketAuthenticated(url);
  }
  const payload = event === 'login' ? normalizeLoginPayload(param) : param;
  const timeoutMs = event === 'login' ? 60000 : 120000;
  const res = await emitRaw<unknown>(s, event, payload, timeoutMs);
  if(event === 'login')
  {
    const rows = parseLoginResponse(res);
    markLoginSuccess();
    return rows as TResult;
  }
  if(event === 'sql-safe')
  {
    try
    {
      return parseSqlSafeResponse<TResult>(res);
    }
    catch(err)
    {
      const msg = String((err as Error)?.message ?? err ?? '');
      if(msg.includes('Oturum gecersiz') && loginPayload)
      {
        await ensureSocketAuthenticated(url);
        const retry = await emitRaw<unknown>(s, event, payload, timeoutMs);
        return parseSqlSafeResponse<TResult>(retry);
      }
      throw err;
    }
  }
  const r = res as { status?: string; data?: TResult; msg?: string };
  if(r?.status === 'OK')
  {
    return r.data as TResult;
  }
  throw new Error(r?.msg ?? `event failed: ${event}`);
}

/** Auth gerektirmeyen, callback'li plain event (get-version, get-mobile-version). */
export async function emitWithCallback<TResult = unknown>(
  serverUrl: string,
  event: string,
  payload?: unknown,
  timeoutMs = 15000
): Promise<TResult>
{
  const url = resolveServerUrl(serverUrl);
  initSocketSession(url);
  const s = socket;
  if(!s)
  {
    throw new Error('socket not connected');
  }
  await waitForConnect(s);
  return emitRaw<TResult>(s, event, payload ?? {}, timeoutMs);
}

export function emitLogin(serverUrl: string, payload: unknown[]): Promise<Record<string, unknown>[]>
{
  return emitAsync<Record<string, unknown>[]>('login', payload, serverUrl);
}

export function emitSqlSafe<TRecord = Record<string, unknown>>(
  serverUrl: string,
  payload: { queryId: string; param: string[]; value: unknown[]; tag?: string }
): Promise<TRecord[]>
{
  // Cok-DB (Azure): secili DB her sorguya eklenir; sunucu sorguyu o DB'ye yonlendirir.
  const db = useBootstrap.getState().selectedDb;
  const withDb = db ? { ...payload, db } : payload;
  return emitAsync<TRecord[]>('sql-safe', withDb, serverUrl);
}

export type PushTokenPayload = {
  user: string;
  token: string;
  platform: 'ios' | 'android';
  app: string;
  module: string;
  appVersion: string;
};

/** piqoff piqhub.js → piqhub-set-push-token koprüsü (callback yok, fire-and-forget). */
export async function emitSetPushToken(serverUrl: string, payload: PushTokenPayload): Promise<void>
{
  const url = resolveServerUrl(serverUrl);
  initSocketSession(url);
  const s = socket;
  if(!s)
  {
    throw new Error('socket not connected');
  }
  await waitForConnect(s);
  await ensureSocketAuthenticated(url);
  s.emit('set-push-token', payload);
}
