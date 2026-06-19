import { useEffect } from 'react';
import { Stack, useRouter, useSegments, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BootSplash } from '@/components/ui/BootSplash';
import { useAuth } from '@/lib/auth';
import { useBootstrap } from '@/lib/bootstrap';
import { attachPushTokenRefresh, resolveNotificationRoute, subscribeNotificationResponse } from '@/lib/pushNotifications';
import { checkForUpdate } from '@/lib/appUpdate';
import '@/lib/i18n';

function AppGate()
{
  const serverUrl = useBootstrap((s) => s.serverUrl);
  const status = useAuth((s) => s.status);
  const restoreSession = useAuth((s) => s.restoreSession);
  const segments = useSegments();
  const router = useRouter();
  const inAuthFlow = segments[0] === '(setup)' || segments[0] === '(auth)';
  useEffect(() =>
  {
    const inSetup = segments[0] === '(setup)';
    const inAuth = segments[0] === '(auth)';
    if(!serverUrl)
    {
      if(!inSetup)
      {
        router.replace('/(setup)/server');
      }
      return;
    }
    if(status === 'idle' && !inAuth && !inSetup)
    {
      void restoreSession().then((ok) =>
      {
        if(!ok)
        {
          router.replace('/(auth)/login');
        }
      });
      return;
    }
    if(status !== 'authed' && !inAuth && !inSetup && status !== 'loading')
    {
      router.replace('/(auth)/login');
    }
    else if(status === 'authed' && (inAuth || inSetup || segments[0] === undefined))
    {
      const menu = useAuth.getState().menuItems;
      const first = menu[0]?.route ?? '/(main)/boss/pos';
      router.replace(first as Href);
    }
  }, [serverUrl, status, segments]);
  return (
    <>
      <StatusBar style={inAuthFlow ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </>
  );
}

export default function RootLayout()
{
  const ready = useBootstrap((s) => s.ready);
  const init = useBootstrap((s) => s.init);
  const serverUrl = useBootstrap((s) => s.serverUrl);
  const status = useAuth((s) => s.status);
  const username = useAuth((s) => s.user?.username);
  const router = useRouter();
  useEffect(() =>
  {
    void init();
  }, [init]);
  useEffect(() =>
  {
    if(status !== 'authed' || !serverUrl || !username)
    {
      return;
    }
    const detachRefresh = attachPushTokenRefresh(serverUrl, username);
    void checkForUpdate(serverUrl);
    const detachResponse = subscribeNotificationResponse((data) =>
    {
      router.push(resolveNotificationRoute(data));
    });
    return () =>
    {
      detachRefresh();
      detachResponse();
    };
  }, [status, serverUrl, username, router]);
  return (
    <SafeAreaProvider>
      {ready ? <AppGate /> : <BootSplash />}
    </SafeAreaProvider>
  );
}
