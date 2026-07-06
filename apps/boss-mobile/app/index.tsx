import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { useBootstrap } from '@/lib/bootstrap';

export default function Index()
{
  const ready = useBootstrap((s) => s.ready);
  const status = useAuth((s) => s.status);
  // 'idle' iken login'e gondermiyoruz: AppGate guard'i once oturumu sessizce geri yuklesin
  // (restoreSession). Aksi halde bundle reload sonrasi kisa bir login flash'i olusuyor.
  if(!ready || status === 'loading' || status === 'idle')
  {
    return null;
  }
  if(status === 'authed')
  {
    return <Redirect href="/(main)/boss/pos" />;
  }
  return <Redirect href="/(auth)/login" />;
}
