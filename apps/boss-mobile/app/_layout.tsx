import { useEffect } from 'react';
import { Stack, useRouter, useSegments, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BootSplash } from '@/components/ui/BootSplash';
import { useAuth } from '@/lib/auth';
import { useBootstrap } from '@/lib/bootstrap';
import { SECTOR_ROUTE } from '@/lib/menu';
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
      if(!inAuth && !inSetup)
      {
        router.replace('/(auth)/login');
      }
      return;
    }
    // Authed degil ve auth/setup'ta degilsek: once oturumu SESSIZCE geri yuklemeyi dene.
    // Boylece gecici bir state sifirlanmasi (render crash/bundle reload veya anlik idle/error)
    // kullaniciyi sayfalar arasi gezerken login'e atmaz. Sadece gercekten oturum yoksa
    // (logout sonrasi SecureStore'daki SHA silinmistir → restoreSession false doner) login'e gider.
    if(status !== 'authed' && status !== 'loading' && !inAuth && !inSetup)
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
    if(status === 'authed' && (inAuth || inSetup || segments[0] === undefined))
    {
      const sector = useBootstrap.getState().sector;
      const menu = useAuth.getState().menuItems;
      const target = menu.find((x) => x.sector === sector) ?? menu[0];
      const route = target?.route ?? SECTOR_ROUTE[sector];
      router.replace(route as Href);
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
    void checkForUpdate();
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
