import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { SECTOR_ROUTE } from '@/lib/menu';
import {
  loadActiveProfileId,
  loadServerProfiles,
  serverHost,
  type ServerProfile
} from '@/lib/serverProfiles';
import { ms } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';

type Anchor = { x: number; y: number; width: number; height: number };

export function MarketSelect()
{
  const router = useRouter();
  const { t } = useTranslation();
  const switchMarket = useAuth((s) => s.switchMarket);
  const authStatus = useAuth((s) => s.status);
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [profiles, setProfiles] = useState<ServerProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const refresh = useCallback(async () =>
  {
    const [list, active] = await Promise.all([loadServerProfiles(), loadActiveProfileId()]);
    setProfiles(list);
    setActiveId(active ?? list[0]?.id ?? null);
  }, []);
  useEffect(() =>
  {
    void refresh();
  }, [refresh, authStatus]);
  const active = profiles.find((x) => x.id === activeId) ?? profiles[0];
  const openMenu = useCallback(() =>
  {
    void refresh();
    triggerRef.current?.measureInWindow((x, y, width, height) =>
    {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  }, [refresh]);
  const onSelect = useCallback(async (profile: ServerProfile) =>
  {
    if(profile.id === activeId)
    {
      setOpen(false);
      return;
    }
    setBusyId(profile.id);
    const res = await switchMarket(profile);
    setBusyId(null);
    setOpen(false);
    if(res.needLogin)
    {
      router.replace('/(auth)/login');
      return;
    }
    if(res.reverted)
    {
      // Secilen markete gecilemedi, son calisan markete geri baglanildi. Aktif market degismez.
      Alert.alert(t('msgWarning'), `${t('msgSocketConnectFailed')}\n${t('marketReconnected')} ${res.revertedLabel ?? ''}`.trim());
      return;
    }
    if(!res.ok)
    {
      Alert.alert(t('msgWarning'), t('msgSocketConnectFailed'));
      return;
    }
    setActiveId(profile.id);
    router.replace(SECTOR_ROUTE[profile.module] as Href);
  }, [activeId, router, switchMarket, t]);
  if(profiles.length < 2)
  {
    return null;
  }
  const screen = Dimensions.get('window');
  const menuWidth = anchor ? Math.min(Math.max(anchor.width, ms(220)), screen.width - ms(24)) : ms(220);
  const menuLeft = anchor ? Math.min(anchor.x, screen.width - menuWidth - ms(12)) : ms(12);
  const menuTop = anchor ? anchor.y + anchor.height + ms(6) : 0;
  return (
    <>
      <Pressable ref={triggerRef} style={styles.trigger} onPress={openMenu} hitSlop={6}>
        <Ionicons name="storefront-outline" size={ms(14)} color={theme.color.accentLight} />
        <Text style={[textSharp, styles.triggerText]} numberOfLines={1}>{active?.label ?? t('marketTitle')}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={ms(13)} color={theme.color.textOnInkMuted} />
      </Pressable>
      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.menu, { top: menuTop, left: menuLeft, width: menuWidth }]}>
          <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false} bounces={false}>
            {profiles.map((profile, idx) =>
            {
              const selected = profile.id === activeId;
              const loading = busyId === profile.id;
              return (
                <Pressable
                  key={profile.id}
                  style={[styles.option, idx > 0 && styles.optionDivider, selected && styles.optionActive]}
                  onPress={() => void onSelect(profile)}
                  disabled={busyId !== null}
                >
                  <Ionicons name="storefront" size={ms(17)} color={selected ? theme.color.primary : theme.color.textMuted} />
                  <View style={styles.optionMain}>
                    <Text style={[styles.optionText, selected && styles.optionTextActive]} numberOfLines={1}>{profile.label}</Text>
                    <Text style={styles.optionSub} numberOfLines={1}>{serverHost(profile.url)}{profile.db ? ` - ${profile.db}` : ''}</Text>
                  </View>
                  {loading ?
                    <ActivityIndicator size="small" color={theme.color.primary} /> :
                    (selected ? <Ionicons name="checkmark-circle" size={ms(18)} color={theme.color.primary} /> : null)}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    maxWidth: '100%',
    gap: ms(5),
    paddingHorizontal: ms(9),
    paddingVertical: ms(5),
    borderRadius: ms(10),
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)'
  },
  triggerText: {
    color: theme.color.textOnInk,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    flexShrink: 1
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'transparent'
  },
  menu: {
    position: 'absolute',
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    overflow: 'hidden',
    ...theme.shadow.card
  },
  menuScroll: {
    maxHeight: ms(280)
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm
  },
  optionDivider: {
    borderTopWidth: 1,
    borderTopColor: theme.color.border
  },
  optionActive: {
    backgroundColor: theme.color.primarySoft
  },
  optionMain: {
    flex: 1,
    minWidth: 0
  },
  optionText: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.color.text
  },
  optionTextActive: {
    color: theme.color.primaryDark
  },
  optionSub: {
    marginTop: 1,
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted
  }
});
