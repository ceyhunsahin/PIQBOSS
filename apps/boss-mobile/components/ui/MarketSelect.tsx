import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import {
  loadActiveProfileId,
  loadServerProfiles,
  serverHost,
  type ServerProfile
} from '@/lib/serverProfiles';
import { ms } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';

export function MarketSelect()
{
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const switchMarket = useAuth((s) => s.switchMarket);
  const authStatus = useAuth((s) => s.status);
  const [open, setOpen] = useState(false);
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
    if(!res.ok)
    {
      Alert.alert(t('msgWarning'), res.error ?? t('msgWarning'));
      return;
    }
    setActiveId(profile.id);
  }, [activeId, router, switchMarket, t]);
  if(profiles.length < 2)
  {
    return null;
  }
  return (
    <>
      <Pressable style={styles.trigger} onPress={() => { void refresh(); setOpen(true); }} hitSlop={6}>
        <Ionicons name="storefront-outline" size={ms(13)} color={theme.color.accentLight} />
        <Text style={[textSharp, styles.triggerText]} numberOfLines={1}>{active?.label ?? t('marketTitle')}</Text>
        <Ionicons name="chevron-down" size={ms(12)} color={theme.color.textOnInkMuted} />
      </Pressable>
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, theme.space.lg) }]}>
            <View style={styles.handle} />
            <View style={styles.head}>
              <Text style={styles.sheetTitle}>{t('marketTitle')}</Text>
              <Pressable style={styles.closeBtn} onPress={() => setOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={ms(22)} color={theme.color.textSecondary} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.options} showsVerticalScrollIndicator={false}>
              {profiles.map((profile) =>
              {
                const selected = profile.id === activeId;
                const loading = busyId === profile.id;
                return (
                  <Pressable
                    key={profile.id}
                    style={[styles.option, selected && styles.optionActive]}
                    onPress={() => void onSelect(profile)}
                    disabled={busyId !== null}
                  >
                    <View style={styles.optionMain}>
                      <Text style={[styles.optionText, selected && styles.optionTextActive]} numberOfLines={1}>{profile.label}</Text>
                      <Text style={styles.optionSub} numberOfLines={1}>{serverHost(profile.url)}{profile.db ? ` · ${profile.db}` : ''}</Text>
                    </View>
                    {loading ?
                      <ActivityIndicator size="small" color={theme.color.primary} /> :
                      (selected ? <Ionicons name="checkmark-circle" size={20} color={theme.color.primary} /> : null)}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable style={styles.cancelBtn} onPress={() => setOpen(false)}>
              <Text style={styles.cancelText}>{t('btnCancel')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0,
    gap: ms(4),
    paddingHorizontal: ms(8),
    paddingVertical: ms(2),
    borderRadius: ms(10),
    backgroundColor: 'rgba(255,255,255,0.10)'
  },
  triggerText: {
    color: theme.color.textOnInk,
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    flexShrink: 1
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.color.overlay
  },
  sheet: {
    backgroundColor: theme.color.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.sm,
    maxHeight: '70%',
    ...theme.shadow.sheet
  },
  handle: {
    alignSelf: 'center',
    width: ms(40),
    height: ms(4),
    borderRadius: ms(2),
    backgroundColor: theme.color.border,
    marginBottom: theme.space.md
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.space.md
  },
  closeBtn: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.surfaceMuted
  },
  sheetTitle: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.color.text
  },
  options: {
    gap: theme.space.sm,
    paddingBottom: theme.space.sm
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.sm,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.md,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surfaceMuted
  },
  optionActive: {
    borderColor: theme.color.primary,
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
    marginTop: 2,
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted
  },
  cancelBtn: {
    marginTop: theme.space.sm,
    alignItems: 'center',
    paddingVertical: theme.space.md
  },
  cancelText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.color.textSecondary
  }
});
