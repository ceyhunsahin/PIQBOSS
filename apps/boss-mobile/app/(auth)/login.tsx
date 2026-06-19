import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AuthShell } from '@/components/ui/AuthShell';
import { Button } from '@/components/ui/Button';
import { ComboSelect } from '@/components/ui/ComboSelect';
import { ServerPicker } from '@/components/ui/ServerPicker';
import { Field } from '@/components/ui/Field';
import { useAuth } from '@/lib/auth';
import { useBootstrap } from '@/lib/bootstrap';
import { clearCredentials, loadCredentials } from '@/lib/credentials';
import { fetchLoginBootstrap } from '@/lib/loginBootstrap';
import { resetSocket } from '@/lib/socket';
import { loadLastUsername, loadRememberPassword, saveLastTenant, saveRememberPassword } from '@/lib/tenantConfig';
import { APP_LANG_OPTIONS, setAppLanguage, type AppLang } from '@/lib/i18n';
import { ms } from '@/lib/responsive';
import {
  loadServerProfiles,
  resolveActiveProfile,
  setActiveProfile,
  type ServerProfile
} from '@/lib/serverProfiles';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';

export default function LoginScreen()
{
  const { t, i18n } = useTranslation();
  const activeLang = (i18n.language as AppLang) || 'fr';
  const login = useAuth((s) => s.login);
  const setServerUrlState = useBootstrap((s) => s.setServerUrl);
  const [submitting, setSubmitting] = useState(false);
  const [servers, setServers] = useState<ServerProfile[]>([]);
  const [activeServerId, setActiveServerId] = useState('');
  const [companies, setCompanies] = useState<{ code: string; name: string }[]>([]);
  const [bossUsers, setBossUsers] = useState<{ code: string; name: string }[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const passwordRef = useRef<TextInput>(null);
  const [bootstrapBusy, setBootstrapBusy] = useState(false);
  const [bootstrapError, setBootstrapError] = useState('');
  const [error, setError] = useState('');
  const activeServer = useMemo(() => servers.find((x) => x.id === activeServerId) ?? servers[0], [activeServerId, servers]);
  useEffect(() =>
  {
    void (async () => { setRemember(await loadRememberPassword()); })();
  }, []);
  useEffect(() =>
  {
    if(bootstrapBusy || !username || password)
    {
      return;
    }
    const timer = setTimeout(() => passwordRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, [bootstrapBusy, username, password]);
  const userOptions = useMemo(() =>
    bossUsers.map((x) => ({ value: x.code, label: x.name || x.code, sub: x.code })), [bossUsers]);
  const loadBootstrap = useCallback(async (profile: ServerProfile) =>
  {
    setBootstrapBusy(true);
    setBootstrapError('');
    setCompanies([]);
    setBossUsers([]);
    setUsername('');
    try
    {
      resetSocket();
      setServerUrlState(profile.url);
      await setActiveProfile(profile);
      const data = await fetchLoginBootstrap(profile.url);
      setCompanies(data.companies);
      setBossUsers(data.users);
      const lastUser = await loadLastUsername();
      let nextUser = '';
      if(lastUser && data.users.some((x) => x.code === lastUser))
      {
        nextUser = lastUser;
      }
      else if(data.users.length === 1)
      {
        nextUser = data.users[0].code;
      }
      if(nextUser)
      {
        setUsername(nextUser);
      }
      const rememberFlag = await loadRememberPassword();
      if(rememberFlag)
      {
        const cred = await loadCredentials();
        if(cred && cred.password && (!nextUser || cred.username === nextUser))
        {
          if(!nextUser)
          {
            setUsername(cred.username);
          }
          setPassword(cred.password);
        }
      }
    }
    catch(e)
    {
      setBootstrapError((e as Error).message);
    }
    finally
    {
      setBootstrapBusy(false);
    }
  }, [setServerUrlState]);
  useEffect(() =>
  {
    void (async () =>
    {
      const list = await loadServerProfiles();
      setServers(list);
      if(list.length === 0)
      {
        return;
      }
      const active = await resolveActiveProfile();
      if(!active)
      {
        return;
      }
      setActiveServerId(active.id);
      await loadBootstrap(active);
    })();
  }, [loadBootstrap]);
  const onServerSelect = async (profile: ServerProfile) =>
  {
    setActiveServerId(profile.id);
    await loadBootstrap(profile);
  };
  const onToggleRemember = async () =>
  {
    const next = !remember;
    setRemember(next);
    await saveRememberPassword(next);
    if(!next)
    {
      setPassword('');
      await clearCredentials();
    }
  };
  const onServersChange = (next: ServerProfile[]) =>
  {
    setServers(next);
    if(next.length > 0 && !next.some((x) => x.id === activeServerId))
    {
      setActiveServerId(next[0].id);
    }
  };
  const onSubmit = async () =>
  {
    if(submitting)
    {
      return;
    }
    setError('');
    if(!activeServer)
    {
      setError(t('msgNoFirmRegistered'));
      return;
    }
    if(bootstrapBusy)
    {
      setError(t('loading'));
      return;
    }
    if(!username.trim() || !password)
    {
      setError(t('txtUser'));
      return;
    }
    const company = companies[0];
    setSubmitting(true);
    try
    {
      const tenant = activeServer.db || '';
      await saveLastTenant(tenant);
      await login(tenant, username.trim(), password, company ? { code: company.code, name: company.name } : undefined);
      if(!remember)
      {
        await clearCredentials();
      }
    }
    catch(e)
    {
      setError((e as Error).message);
    }
    finally
    {
      setSubmitting(false);
    }
  };
  return (
    <AuthShell subtitle={t('lblLogin')}>
      <View style={styles.langRow}>
        {APP_LANG_OPTIONS.map((opt) =>
        {
          const active = activeLang === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={[styles.flagBtn, active && styles.flagBtnActive]}
              onPress={() => void setAppLanguage(opt.value)}
              hitSlop={6}
            >
              <Text style={styles.flagText}>{opt.flag}</Text>
            </Pressable>
          );
        })}
      </View>
      <ServerPicker
        servers={servers}
        activeId={activeServerId}
        onSelect={(profile) => void onServerSelect(profile)}
        onChange={onServersChange}
      />
      <ComboSelect
        label={t('login.selectUser')}
        placeholder={t('login.selectUser')}
        options={userOptions}
        value={username}
        onChange={setUsername}
        loading={bootstrapBusy}
        disabled={!activeServer || bootstrapBusy || bossUsers.length === 0}
        emptyLabel={t('msgNoUser')}
      />
      <Field
        ref={passwordRef}
        label={t('txtPass')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        secureToggle
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={() => void onSubmit()}
      />
      <Pressable style={styles.rememberRow} onPress={() => void onToggleRemember()} hitSlop={8}>
        <Ionicons
          name={remember ? 'checkbox' : 'square-outline'}
          size={ms(20)}
          color={remember ? theme.color.brand : theme.color.textMuted}
        />
        <Text style={[textSharp, styles.rememberLabel]}>{t('chkRememberMe')}</Text>
      </Pressable>
      {bootstrapError ?
        (
          <View style={styles.warnBox}>
            <Text style={[textSharp, styles.warnTitle]}>{t('msgWarning')}</Text>
            <Text style={[textSharp, styles.warnText]}>{bootstrapError}</Text>
          </View>
        ) : null}
      {error ?
        (
          <View style={styles.errorBox}>
            <Text style={[textSharp, styles.errorTitle]}>{t('msgWarning')}</Text>
            <Text style={[textSharp, styles.errorText]}>{error}</Text>
          </View>
        ) : null}
      <Button label={t('btnLogin')} loading={submitting} disabled={submitting} onPress={onSubmit} style={styles.loginBtn} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  loginBtn: {
    backgroundColor: theme.color.brand
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.space.sm,
    marginBottom: theme.space.md
  },
  flagBtn: {
    width: ms(40),
    height: ms(32),
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.color.border,
    opacity: 0.5
  },
  flagBtnActive: {
    opacity: 1,
    borderColor: theme.color.brand,
    backgroundColor: `${theme.color.brand}14`
  },
  flagText: {
    fontSize: ms(18)
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    paddingVertical: theme.space.sm,
    marginBottom: theme.space.xs
  },
  rememberLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.color.textSecondary
  },
  warnBox: {
    backgroundColor: theme.color.warningSoft,
    borderRadius: theme.radius.sm,
    padding: theme.space.md,
    marginBottom: theme.space.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.color.warning
  },
  warnTitle: {
    color: theme.color.warning,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    marginBottom: theme.space.xs
  },
  warnText: {
    color: theme.color.textSecondary,
    fontSize: theme.fontSize.sm,
    lineHeight: 20
  },
  errorBox: {
    backgroundColor: theme.color.dangerBg,
    borderRadius: theme.radius.sm,
    padding: theme.space.md,
    marginBottom: theme.space.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.color.danger
  },
  errorTitle: {
    color: theme.color.danger,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    marginBottom: theme.space.xs
  },
  errorText: {
    color: theme.color.danger,
    fontSize: theme.fontSize.sm,
    lineHeight: 20
  }
});
