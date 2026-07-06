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
import { fetchLoginBootstrap, type LoginDatabase } from '@/lib/loginBootstrap';
import { resetSocket } from '@/lib/socket';
import { loadLastUsername, loadRememberPassword, saveLastTenant, saveRememberPassword } from '@/lib/tenantConfig';
import { APP_LANG_OPTIONS, setAppLanguage, type AppLang } from '@/lib/i18n';
import { ms } from '@/lib/responsive';
import {
  loadServerProfiles,
  normalizeServerUrl,
  resolveActiveProfile,
  serverHost,
  setActiveProfile,
  upsertServerProfile,
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
  const setSector = useBootstrap((s) => s.setSector);
  const setSelectedDb = useBootstrap((s) => s.setSelectedDb);
  const [submitting, setSubmitting] = useState(false);
  const [servers, setServers] = useState<ServerProfile[]>([]);
  const [activeServerId, setActiveServerId] = useState('');
  const [serverInput, setServerInput] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerAddHost, setPickerAddHost] = useState<string | null>(null);
  const [databases, setDatabases] = useState<LoginDatabase[]>([]);
  const [selectedDb, setSelectedDbLocal] = useState('');
  const [companies, setCompanies] = useState<{ code: string; name: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
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
  const companyOptions = useMemo(() =>
    companies.map((x) => ({ value: x.code, label: x.name || x.code, sub: x.code })), [companies]);
  const loadBootstrap = useCallback(async (profile: ServerProfile, dbOverride?: string) =>
  {
    setBootstrapBusy(true);
    setBootstrapError('');
    setCompanies([]);
    setSelectedCompany('');
    setBossUsers([]);
    setUsername('');
    try
    {
      resetSocket();
      setServerUrlState(profile.url);
      setSector(profile.module);
      await setActiveProfile(profile);
      let data = await fetchLoginBootstrap(profile.url, dbOverride);
      setDatabases(data.databases);
      // Cok-DB (Azure): hedef DB'yi belirle ve kullanici/firma listesini o DB'den yukle.
      let effectiveDb = dbOverride ?? '';
      if(!effectiveDb && data.databases.length > 0)
      {
        effectiveDb = data.databases.some((d) => d.code === data.db) ? data.db : data.databases[0].code;
        if(effectiveDb && effectiveDb !== data.db)
        {
          data = await fetchLoginBootstrap(profile.url, effectiveDb);
        }
      }
      if(!effectiveDb)
      {
        // Tek-DB: sunucu config veritabani.
        effectiveDb = data.db;
      }
      setSelectedDbLocal(effectiveDb);
      setSelectedDb(effectiveDb);
      setCompanies(data.companies);
      setSelectedCompany(data.companies[0]?.code ?? '');
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
  }, [setServerUrlState, setSector, setSelectedDb]);
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
      setServerInput(serverHost(active.url));
      await loadBootstrap(active);
    })();
  }, [loadBootstrap]);
  const connectServer = useCallback(async (addr: string) =>
  {
    const normalized = normalizeServerUrl(addr);
    if(!normalized)
    {
      if(addr.trim())
      {
        setBootstrapError(t('txtServerAddressExample'));
      }
      return;
    }
    if(bootstrapBusy)
    {
      return;
    }
    if(activeServer && normalized === activeServer.url && (companies.length > 0 || bossUsers.length > 0))
    {
      return;
    }
    const existing = servers.find((x) => x.url === normalized);
    if(!existing)
    {
      // Yeni IP/sunucu → modul (POS/OFF/REST) secimi icin firma kayit ekranini ac.
      setPickerAddHost(addr);
      setPickerOpen(true);
      return;
    }
    setActiveServerId(existing.id);
    setServerInput(serverHost(existing.url));
    await loadBootstrap(existing);
  }, [activeServer, bootstrapBusy, bossUsers.length, companies.length, loadBootstrap, servers, t]);
  const onServerSelect = async (profile: ServerProfile) =>
  {
    setServerInput(serverHost(profile.url));
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
    const company = companies.find((x) => x.code === selectedCompany) ?? companies[0];
    setSubmitting(true);
    try
    {
      const tenant = selectedDb || activeServer.db || '';
      await saveLastTenant(tenant);
      await login(tenant, username.trim(), password, company ? { code: company.code, name: company.name } : undefined);
      await upsertServerProfile({ ...activeServer, db: tenant });
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
      <Field
        label={t('lblServer')}
        value={serverInput}
        onChangeText={setServerInput}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        clearable
        returnKeyType="go"
        onSubmitEditing={() => void connectServer(serverInput)}
        onEndEditing={() => void connectServer(serverInput)}
        placeholder="firma.piqpos.net"
        hint={serverInput.trim() ? `→ ${normalizeServerUrl(serverInput)}` : t('txtServerAddressExample')}
      />
      {servers.length > 0 ?
        (
          <Pressable style={styles.savedBtn} onPress={() => { setPickerAddHost(null); setPickerOpen(true); }}>
            <Ionicons name="albums-outline" size={ms(18)} color={theme.color.primary} />
            <Text style={[textSharp, styles.savedText]} numberOfLines={1}>
              {activeServer ? activeServer.label : t('txtFirmSelect')}
            </Text>
            <Ionicons name="swap-horizontal" size={ms(16)} color={theme.color.primary} />
          </Pressable>
        ) : null}
      <ServerPicker
        servers={servers}
        activeId={activeServerId}
        onSelect={(profile) => void onServerSelect(profile)}
        onChange={onServersChange}
        hideTrigger
        open={pickerOpen}
        onOpenChange={(o) => { setPickerOpen(o); if(!o) { setPickerAddHost(null); } }}
        addHost={pickerAddHost}
      />
      {databases.length > 0 ?
        (
          <ComboSelect
            label={t('txtDbSelect')}
            placeholder={t('txtDbSelect')}
            options={databases.map((d) => ({ value: d.code, label: d.name || d.code, sub: d.code }))}
            value={selectedDb}
            onChange={(db) => { if(activeServer) { void loadBootstrap(activeServer, db); } }}
            disabled={bootstrapBusy}
          />
        ) : null}
      <ComboSelect
        label={t('txtFirmSelect')}
        placeholder={t('txtFirmSelect')}
        options={companyOptions}
        value={selectedCompany}
        onChange={setSelectedCompany}
        loading={bootstrapBusy}
        disabled={!activeServer || bootstrapBusy || companies.length === 0}
        emptyLabel={t('msgNoFirmRegistered')}
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
  savedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.xs,
    alignSelf: 'flex-start',
    paddingVertical: theme.space.xs,
    paddingHorizontal: theme.space.sm,
    marginTop: -theme.space.sm,
    marginBottom: theme.space.lg,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.color.primarySoft
  },
  savedText: {
    color: theme.color.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '700'
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
