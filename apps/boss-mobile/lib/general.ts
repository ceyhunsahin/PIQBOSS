import { Alert } from 'react-native';
import type { Socket } from 'socket.io-client';
import i18n from './i18n';

type GeneralPayload = {
  id?: string;
  data?: string;
  type?: number;
};

let forceLogoutHandler: (() => Promise<void>) | null = null;

export function setForceLogoutHandler(handler: () => Promise<void>): void
{
  forceLogoutHandler = handler;
}

export function attachGeneralListener(socket: Socket): void
{
  socket.off('general');
  socket.on('general', (payload: GeneralPayload) =>
  {
    if(payload.id === 'M004')
    {
      // M004 = "baska cihazdan giris" sadece bilgilendirme; gensrv diger cihazi disconnect ETMIYOR.
      // Mobil tek cihaz olarak calisir ve bu sinyale aksiyon almaz; yeniden baglanma/yeniden giriste
      // sunucu eski socket'i hentemizlemeden yenisini sayinca yanlis pozitif uretiyordu. Mobilde bastiriyoruz.
      return;
    }
    if(payload.id === 'M001')
    {
      Alert.alert(i18n.t('msgWarning'), payload.data ?? i18n.t('licenceMsg'));
      void forceLogoutHandler?.();
      return;
    }
    if(payload.id === 'M005' && payload.type === 3)
    {
      Alert.alert(i18n.t('msgWarning'), payload.data ?? i18n.t('licenceBlockedMsg'));
      void forceLogoutHandler?.();
    }
  });
}
