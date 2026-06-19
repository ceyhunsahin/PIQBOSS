import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { useBootstrap } from '@/lib/bootstrap';

export default function Index()
{
  const ready = useBootstrap((s) => s.ready);
  const serverUrl = useBootstrap((s) => s.serverUrl);
  const status = useAuth((s) => s.status);
  if(!ready || status === 'loading')
  {
    return null;
  }
  if(status === 'authed')
  {
    return <Redirect href="/(main)/boss/pos" />;
  }
  if(!serverUrl)
  {
    return <Redirect href="/(setup)/server" />;
  }
  return <Redirect href="/(auth)/login" />;
}
