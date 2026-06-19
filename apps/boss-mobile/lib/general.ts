import { Alert } from 'react-native';
import type { Socket } from 'socket.io-client';
import i18n from './i18n';

type GeneralPayload = {
  id?: string;
  data?: string;
  type?: number;
};

let forceLogoutHandler: (() => Promise<void>) | null = null;
let lastLoginSuccessAt = 0;

const DUPLICATE_DEVICE_GRACE_MS = 30000;

export function notifyLoginSuccess(): void
{
  lastLoginSuccessAt = Date.now();
}

export function shouldIgnoreDuplicateDeviceAlert(): boolean
{
  return Date.now() - lastLoginSuccessAt < DUPLICATE_DEVICE_GRACE_MS;
}

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
      // gensrv diger cihazi disconnect ETMIYOR (core.js icinde yorumlu); bu sadece bilgilendirme.
      // Bu yuzden oturumu zorla kapatmiyoruz; kendi (yeniden) girisimizden gelen sinyali de yok sayiyoruz.
      if(shouldIgnoreDuplicateDeviceAlert())
      {
        return;
      }
      Alert.alert(i18n.t('msgAnotherUserAlert.title'), i18n.t('msgAnotherUserAlert.msg'), [
        { text: i18n.t('msgAnotherUserAlert.btn01') }
      ]);
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
