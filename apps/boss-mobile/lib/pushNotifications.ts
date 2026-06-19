import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Href } from 'expo-router';
import { PUSH_CONFIG } from './pushConfig';
import { emitSetPushToken } from './socket';

/** Expo Go (SDK 53+) artik remote push desteklemiyor; bu ortamda push cagrilari atlanir. */
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if(!isExpoGo)
{
  try
  {
    Notifications.setNotificationHandler({
      handleNotification: async () =>
      ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true
      })
    });
  }
  catch
  {
    // native push modulu yoksa sessizce gec
  }
}

let cachedNativeToken: string | null = null;
let registrationPromise: Promise<string | null> | null = null;

export function getCachedPushToken(): string | null
{
  return cachedNativeToken;
}

/** FCM (Android) / APNs (iOS) native device token — piqhub gondericisi bunu bekler. */
export async function registerForPushNotifications(): Promise<string | null>
{
  if(isExpoGo || !Device.isDevice)
  {
    return null;
  }
  if(registrationPromise)
  {
    return registrationPromise;
  }
  registrationPromise = (async () =>
  {
    try
    {
      const perm = await Notifications.getPermissionsAsync();
      let status = perm.status;
      if(status !== 'granted')
      {
        const req = await Notifications.requestPermissionsAsync();
        status = req.status;
      }
      if(status !== 'granted')
      {
        return null;
      }
      if(Platform.OS === 'android')
      {
        await Notifications.setNotificationChannelAsync('default',
        {
          name: 'PiqBoss',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250]
        });
      }
      const native = await Notifications.getDevicePushTokenAsync();
      const token = typeof native.data === 'string' ? native.data : String(native.data ?? '');
      if(!token)
      {
        return null;
      }
      cachedNativeToken = token;
      return token;
    }
    catch
    {
      return null;
    }
    finally
    {
      registrationPromise = null;
    }
  })();
  return registrationPromise;
}

export async function sendPushTokenToServer(serverUrl: string, userCode: string): Promise<void>
{
  if(!userCode || !serverUrl)
  {
    return;
  }
  const token = cachedNativeToken ?? await registerForPushNotifications();
  if(!token)
  {
    return;
  }
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  const appVersion = Constants.expoConfig?.version ?? '0.0.0';
  await emitSetPushToken(serverUrl,
  {
    user: userCode,
    token,
    platform,
    app: PUSH_CONFIG.app,
    module: PUSH_CONFIG.module,
    appVersion
  });
}

export function resolveNotificationRoute(data: Record<string, unknown> | undefined): Href
{
  const pageId = data?.pageId != null ? String(data.pageId) : '';
  if(pageId === 'dash' || data?.page === 'dashboard.js')
  {
    return PUSH_CONFIG.defaultRoute as Href;
  }
  return PUSH_CONFIG.defaultRoute as Href;
}

export function attachPushTokenRefresh(serverUrl: string, userCode: string): () => void
{
  if(isExpoGo)
  {
    return () => {};
  }
  try
  {
    const sub = Notifications.addPushTokenListener(() =>
    {
      cachedNativeToken = null;
      void sendPushTokenToServer(serverUrl, userCode);
    });
    return () => sub.remove();
  }
  catch
  {
    return () => {};
  }
}
/** Bildirime tiklayinca rota cozumu; Expo Go'da no-op. */
export function subscribeNotificationResponse(handler: (data: Record<string, unknown> | undefined) => void): () => void
{
  if(isExpoGo)
  {
    return () => {};
  }
  try
  {
    const sub = Notifications.addNotificationResponseReceivedListener((response) =>
    {
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
      handler(data);
    });
    return () => sub.remove();
  }
  catch
  {
    return () => {};
  }
}
