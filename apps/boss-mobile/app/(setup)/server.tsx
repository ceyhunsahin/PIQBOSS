import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { AuthShell } from '@/components/ui/AuthShell';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { useBootstrap } from '@/lib/bootstrap';
import { getDefaultServerUrl } from '@/lib/serverConfig';
import { resetSocket } from '@/lib/socket';
import {
  loadServerProfiles,
  removeServerProfile,
  setActiveProfile,
  upsertServerProfile,
  type ServerProfile
} from '@/lib/serverProfiles';
import { ms } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';

export default function ServerSetupScreen()
{
  const router = useRouter();
  const { t } = useTranslation();
  const setServerUrlState = useBootstrap((s) => s.setServerUrl);
  const [profiles, setProfiles] = useState<ServerProfile[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [url, setUrl] = useState(getDefaultServerUrl());
  const [label, setLabel] = useState('');
  const [db, setDb] = useState('');
  useEffect(() =>
  {
    void loadServerProfiles().then(setProfiles);
  }, []);
  const resetForm = () =>
  {
    setEditingId(null);
    setUrl(getDefaultServerUrl());
    setLabel('');
    setDb('');
  };
  const startEdit = (profile: ServerProfile) =>
  {
    setEditingId(profile.id);
    setUrl(profile.url);
    setLabel(profile.label);
    setDb(profile.db);
  };
  const onSave = async () =>
  {
    const trimmed = url.trim().replace(/\/+$/, '');
    if(!trimmed)
    {
      Alert.alert(t('msgWarning'), t('txtServerAddressExample'));
      return;
    }
    try
    {
      resetSocket();
      const next = await upsertServerProfile({
        id: editingId ?? undefined,
        url: trimmed,
        label: label.trim() || trimmed,
        db: db.trim()
      });
      const saved = next.find((x) => x.url === trimmed) ?? next[next.length - 1];
      if(saved)
      {
        await setActiveProfile(saved);
        setServerUrlState(saved.url);
      }
      setProfiles(next);
      resetForm();
    }
    catch(e)
    {
      Alert.alert(t('msgWarning'), (e as Error).message);
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
            setProfiles(next);
            if(editingId === profile.id)
            {
              resetForm();
            }
          })();
        }
      }
    ]);
  };
  const onUse = async (profile: ServerProfile) =>
  {
    resetSocket();
    await setActiveProfile(profile);
    setServerUrlState(profile.url);
    router.replace('/(auth)/login');
  };
  return (
    <AuthShell subtitle={t('firmListTitle')}>
      <Text style={[textSharp, styles.heading]}>{t('firmListTitle')}</Text>
      <Text style={[textSharp, styles.lead]}>{t('txtServerAddressExample')}</Text>
      <Field
        label={t('lblServer')}
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        placeholder="http://192.168.1.10:80"
      />
      <Field
        label={t('txtNewName')}
        value={label}
        onChangeText={setLabel}
        autoCapitalize="words"
        placeholder={t('txtNewName')}
      />
      <Field
        label="DB"
        value={db}
        onChangeText={setDb}
        autoCapitalize="characters"
        autoCorrect={false}
        placeholder="GENDB"
      />
      <Button label={editingId ? t('btnUpdate') : t('btnAdd')} onPress={onSave} />
      {editingId ?
        (
          <Pressable style={styles.cancelEdit} onPress={resetForm}>
            <Text style={[textSharp, styles.cancelEditText]}>{t('btnCancel')}</Text>
          </Pressable>
        ) : null}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {profiles.length === 0 ?
          <Text style={[textSharp, styles.empty]}>{t('msgNoFirmRegistered')}</Text> : null}
        {profiles.map((profile) =>
        (
          <View key={profile.id} style={styles.card}>
            <View style={styles.cardMain}>
              <Text style={[textSharp, styles.cardTitle]} numberOfLines={1}>{profile.label}</Text>
              <Text style={[textSharp, styles.cardSub]} numberOfLines={1}>{profile.url}</Text>
              {profile.db ?
                <Text style={[textSharp, styles.cardDb]} numberOfLines={1}>DB: {profile.db}</Text> : null}
            </View>
            <View style={styles.cardActions}>
              <Pressable style={styles.iconBtn} onPress={() => void onUse(profile)}>
                <Ionicons name="log-in-outline" size={ms(20)} color={theme.color.primary} />
              </Pressable>
              <Pressable style={styles.iconBtn} onPress={() => startEdit(profile)}>
                <Ionicons name="create-outline" size={ms(20)} color={theme.color.textSecondary} />
              </Pressable>
              <Pressable style={styles.iconBtn} onPress={() => onDelete(profile)}>
                <Ionicons name="trash-outline" size={ms(20)} color={theme.color.danger} />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
      <Pressable style={styles.backBtn} onPress={() => router.replace('/(auth)/login')}>
        <Text style={[textSharp, styles.backText]}>{t('back')}</Text>
      </Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.color.text,
    marginBottom: theme.space.sm
  },
  lead: {
    fontSize: theme.fontSize.sm,
    color: theme.color.textSecondary,
    lineHeight: 20,
    marginBottom: theme.space.lg
  },
  cancelEdit: {
    alignItems: 'center',
    marginBottom: theme.space.lg
  },
  cancelEditText: {
    color: theme.color.textMuted,
    fontSize: theme.fontSize.sm,
    fontWeight: '600'
  },
  list: {
    maxHeight: 280,
    marginTop: theme.space.lg
  },
  listContent: {
    gap: theme.space.sm,
    paddingBottom: theme.space.md
  },
  empty: {
    textAlign: 'center',
    color: theme.color.textMuted,
    paddingVertical: theme.space.lg
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    padding: theme.space.md,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surfaceMuted
  },
  cardMain: {
    flex: 1,
    minWidth: 0
  },
  cardTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.color.text
  },
  cardSub: {
    marginTop: 2,
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted
  },
  cardDb: {
    marginTop: 2,
    fontSize: theme.fontSize.xs,
    color: theme.color.textSecondary
  },
  cardActions: {
    flexDirection: 'row',
    gap: theme.space.xs
  },
  iconBtn: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.surface
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: theme.space.lg
  },
  backText: {
    color: theme.color.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600'
  }
});
