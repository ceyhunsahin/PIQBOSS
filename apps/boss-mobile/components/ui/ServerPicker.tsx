import { memo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import {
  removeServerProfile,
  serverHost,
  upsertServerProfile,
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
};

export const ServerPicker = memo(function ServerPicker({ servers, activeId, onSelect, onChange }: Props)
{
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [host, setHost] = useState('');
  const [name, setName] = useState('');
  const active = servers.find((x) => x.id === activeId) ?? servers[0];
  const close = () =>
  {
    setOpen(false);
    setAdding(false);
    setHost('');
    setName('');
  };
  const pick = (profile: ServerProfile) =>
  {
    onSelect(profile);
    close();
  };
  const onSave = async () =>
  {
    if(!host.trim())
    {
      Alert.alert(t('msgWarning'), t('txtServerAddressExample'));
      return;
    }
    const next = await upsertServerProfile({ url: host, label: name, db: '' });
    onChange(next);
    const saved = next[next.length - 1];
    setAdding(false);
    setHost('');
    setName('');
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
      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={close} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, theme.space.lg) }]}>
            <View style={styles.handle} />
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
                    placeholder="pratik.piqpos.net"
                  />
                  <Field
                    label={t('txtNewName')}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    placeholder={t('txtNewName')}
                  />
                  <Button label={t('btnOk')} onPress={() => void onSave()} />
                  <Pressable style={styles.linkBtn} onPress={() => setAdding(false)}>
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
                          <Pressable style={styles.trashBtn} onPress={() => onDelete(profile)} hitSlop={8}>
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
          </View>
        </View>
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
    maxHeight: '76%',
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
  trashBtn: {
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
