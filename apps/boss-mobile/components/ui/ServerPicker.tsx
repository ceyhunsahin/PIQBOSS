import { memo, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { ModuleToggle } from '@/components/ui/ModuleToggle';
import {
  normalizeServerUrl,
  removeServerProfile,
  serverHost,
  upsertServerProfile,
  type SectorModule,
  type ServerProfile
} from '@/lib/serverProfiles';
import { ms } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';

type Props = {
  servers: ServerProfile[];
  activeId: string;
  onSelect: (profile: ServerProfile) => void;
  onChange: (servers: ServerProfile[]) => void;
  hideTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  addHost?: string | null;
};

export const ServerPicker = memo(function ServerPicker({ servers, activeId, onSelect, onChange, hideTrigger, open: openProp, onOpenChange, addHost }: Props)
{
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (next: boolean) =>
  {
    if(onOpenChange)
    {
      onOpenChange(next);
    }
    else
    {
      setInternalOpen(next);
    }
  };
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [host, setHost] = useState('');
  const [name, setName] = useState('');
  const [mod, setMod] = useState<SectorModule>('pos');
  const slide = useRef(new Animated.Value(0)).current;
  const active = servers.find((x) => x.id === activeId) ?? servers[0];
  useEffect(() =>
  {
    if(open)
    {
      slide.setValue(0);
      Animated.timing(slide, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
      // Yeni IP girisinden geliyorsa direkt ekleme formunu modul secimiyle ac.
      if(addHost)
      {
        setEditingId(null);
        setHost(addHost);
        setName(serverHost(normalizeServerUrl(addHost) || addHost));
        setMod('pos');
        setAdding(true);
      }
    }
  }, [open, slide, addHost]);
  const close = () =>
  {
    setOpen(false);
    setAdding(false);
    setEditingId(null);
    setHost('');
    setName('');
    setMod('pos');
  };
  const pick = (profile: ServerProfile) =>
  {
    onSelect(profile);
    close();
  };
  const startEdit = (profile: ServerProfile) =>
  {
    setEditingId(profile.id);
    setHost(serverHost(profile.url));
    setName(profile.label);
    setMod(profile.module);
    setAdding(true);
  };
  const onSave = async () =>
  {
    if(!host.trim())
    {
      Alert.alert(t('msgWarning'), t('txtServerAddressExample'));
      return;
    }
    const normalized = normalizeServerUrl(host);
    // DB sunucu config'inden otomatik gelir (bootstrap); duzenlemede mevcut deger korunur.
    const keepDb = editingId ? (servers.find((x) => x.id === editingId)?.db ?? '') : '';
    const next = await upsertServerProfile({ id: editingId ?? undefined, url: host, label: name, db: keepDb, module: mod });
    onChange(next);
    const saved = next.find((x) => x.url === normalized) ?? next[next.length - 1];
    setAdding(false);
    setEditingId(null);
    setHost('');
    setName('');
    setMod('pos');
    if(saved)
    {
      pick(saved);
    }
  };
  const onDelete = (profile: ServerProfile) =>
  {
    Alert.alert(t('msgWarning'), t('msgConfirmDelete'), [
      { text: t('btnCancel'), style: 'cancel' },
      {
        text: t('btnOk'),
        style: 'destructive',
        onPress: () =>
        {
          void (async () =>
          {
            const next = await removeServerProfile(profile.id);
            onChange(next);
          })();
        }
      }
    ]);
  };
  return (
    <>
      {!hideTrigger ?
        (
          <>
            <Text style={[textSharp, styles.label]}>{t('txtFirmSelect')}</Text>
            <Pressable onPress={() => setOpen(true)}>
              <LinearGradient
                colors={theme.gradient.night}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="business" size={ms(20)} color={theme.color.accentLight} />
                </View>
                <View style={styles.cardMain}>
                  <Text style={[textSharp, styles.cardTitle]} numberOfLines={1}>
                    {active ? active.label : t('msgNoFirmRegistered')}
                  </Text>
                  <Text style={[textSharp, styles.cardSub]} numberOfLines={1}>
                    {active ? serverHost(active.url) : t('txtServerAddressExample')}
                  </Text>
                </View>
                <Ionicons name="swap-horizontal" size={ms(20)} color={theme.color.textOnInkMuted} />
              </LinearGradient>
            </Pressable>
          </>
        ) : null}
      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.backdrop} onPress={close} />
          <Animated.View
            style={[
              styles.sheet,
              {
                paddingTop: Math.max(insets.top, theme.space.lg),
                opacity: slide,
                transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [-28, 0] }) }]
              }
            ]}
          >
            <View style={styles.head}>
              <Text style={[textSharp, styles.sheetTitle]}>{t('txtFirmSelect')}</Text>
              <Pressable style={styles.closeBtn} onPress={close} hitSlop={10}>
                <Ionicons name="close" size={ms(22)} color={theme.color.textSecondary} />
              </Pressable>
            </View>
            {adding ?
              (
                <View style={styles.addForm}>
                  <Field
                    label={t('lblServer')}
                    value={host}
                    onChangeText={setHost}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    clearable
                    placeholder="firma.piqpos.net  /  6.122.45.65"
                    hint={host.trim() ? `→ ${normalizeServerUrl(host)}` : t('txtServerAddressExample')}
                  />
                  <Field
                    label={t('txtNewName')}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    placeholder={t('txtNewName')}
                  />
                  <ModuleToggle label={t('txtModule')} value={mod} onChange={setMod} />
                  <Button label={editingId ? t('btnUpdate') : t('btnOk')} onPress={() => void onSave()} />
                  <Pressable style={styles.linkBtn} onPress={() => { setAdding(false); setEditingId(null); setHost(''); setName(''); setMod('pos'); }}>
                    <Text style={[textSharp, styles.linkText]}>{t('btnCancel')}</Text>
                  </Pressable>
                </View>
              ) :
              (
                <>
                  <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
                    {servers.length === 0 ?
                      <Text style={[textSharp, styles.empty]}>{t('msgNoFirmRegistered')}</Text> : null}
                    {servers.map((profile) =>
                    {
                      const selected = profile.id === active?.id;
                      return (
                        <Pressable
                          key={profile.id}
                          style={[styles.row, selected && styles.rowActive]}
                          onPress={() => pick(profile)}
                        >
                          <View style={[styles.rowIcon, selected && styles.rowIconActive]}>
                            <Ionicons
                              name="business"
                              size={ms(18)}
                              color={selected ? theme.color.textOnPrimary : theme.color.primary}
                            />
                          </View>
                          <View style={styles.rowMain}>
                            <Text style={[textSharp, styles.rowTitle]} numberOfLines={1}>{profile.label}</Text>
                            <Text style={[textSharp, styles.rowSub]} numberOfLines={1}>{serverHost(profile.url)}</Text>
                          </View>
                          {selected ?
                            <Ionicons name="checkmark-circle" size={ms(20)} color={theme.color.primary} /> : null}
                          <Pressable style={styles.actionBtn} onPress={() => startEdit(profile)} hitSlop={8}>
                            <Ionicons name="create-outline" size={ms(18)} color={theme.color.textSecondary} />
                          </Pressable>
                          <Pressable style={styles.actionBtn} onPress={() => onDelete(profile)} hitSlop={8}>
                            <Ionicons name="trash-outline" size={ms(18)} color={theme.color.danger} />
                          </Pressable>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                  <Pressable style={styles.addBtn} onPress={() => setAdding(true)}>
                    <Ionicons name="add-circle" size={ms(20)} color={theme.color.primary} />
                    <Text style={[textSharp, styles.addText]}>{t('btnAdd')}</Text>
                  </Pressable>
                </>
              )}
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.color.textSecondary,
    marginBottom: theme.space.sm
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    padding: theme.space.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.space.lg,
    ...theme.shadow.card
  },
  cardIcon: {
    width: ms(40),
    height: ms(40),
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  cardMain: {
    flex: 1,
    minWidth: 0
  },
  cardTitle: {
    color: theme.color.textOnInk,
    fontSize: theme.fontSize.body,
    fontWeight: '700'
  },
  cardSub: {
    color: theme.color.textOnInkMuted,
    fontSize: theme.fontSize.xs,
    marginTop: 2
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-start'
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
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    paddingHorizontal: theme.space.lg,
    paddingBottom: theme.space.lg,
    maxHeight: '82%',
    ...theme.shadow.sheet
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
    fontWeight: '700',
    color: theme.color.text
  },
  list: {
    gap: theme.space.sm,
    paddingBottom: theme.space.sm
  },
  empty: {
    textAlign: 'center',
    color: theme.color.textMuted,
    paddingVertical: theme.space.xl
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.md,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surfaceMuted
  },
  rowActive: {
    borderColor: theme.color.primary,
    backgroundColor: theme.color.primarySoft
  },
  rowIcon: {
    width: ms(36),
    height: ms(36),
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.primarySoft
  },
  rowIconActive: {
    backgroundColor: theme.color.primary
  },
  rowMain: {
    flex: 1,
    minWidth: 0
  },
  rowTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.color.text
  },
  rowSub: {
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted,
    marginTop: 2
  },
  actionBtn: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    alignItems: 'center',
    justifyContent: 'center'
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space.xs,
    paddingVertical: theme.space.md,
    marginTop: theme.space.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.color.primary,
    borderStyle: 'dashed'
  },
  addText: {
    color: theme.color.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '700'
  },
  addForm: {
    paddingTop: theme.space.sm
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: theme.space.md
  },
  linkText: {
    color: theme.color.textMuted,
    fontSize: theme.fontSize.sm,
    fontWeight: '600'
  }
});
