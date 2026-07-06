import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { ChipSelect } from '@/components/ui/ChipSelect';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { useBootstrap } from '@/lib/bootstrap';
import type { DatePresetId } from '@/lib/dateRange';
import { useLangOptions, setAppLanguage, useBossPresetLabel, useTDash, type AppLang } from '@/lib/i18n';
import { usePrefs } from '@/lib/preferences';
import { ms } from '@/lib/responsive';
import { useEmptyLabel } from '@/lib/uiText';
import { theme } from '@/lib/theme';

const LOGO = require('../../../assets/icon.png');
const PRESETS: DatePresetId[] = ['today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth'];

export default function BossSettings()
{
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const dash = useTDash();
  const presetLabel = useBossPresetLabel();
  const langOptions = useLangOptions();
  const emptyLabel = useEmptyLabel();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const serverUrl = useBootstrap((s) => s.serverUrl);
  const defaultPreset = usePrefs((s) => s.defaultPreset);
  const setDefaultPreset = usePrefs((s) => s.setDefaultPreset);
  const version = Constants.expoConfig?.version ?? '0.1.0';
  const presetOptions = PRESETS.map((p) => ({ value: p, label: presetLabel(p) }));
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{dash('prefTitle')}</Text>
      <View style={styles.card}>
        <ChipSelect
          label={t('txtLangSelect')}
          options={langOptions}
          value={(i18n.language as AppLang) || 'fr'}
          onChange={(value) => void setAppLanguage(value as AppLang)}
        />
        <View style={styles.prefField}>
          <Text style={styles.fieldLabel}>{dash('prefDefaultRange')}</Text>
          <View style={styles.presetGrid}>
            {presetOptions.map((opt) =>
            {
              const active = opt.value === defaultPreset;
              return (
                <Pressable
                  key={opt.value}
                  style={[styles.presetChip, active && styles.presetChipActive]}
                  onPress={() => setDefaultPreset(opt.value as DatePresetId)}
                >
                  <Text style={[styles.presetText, active && styles.presetTextActive]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('lblServer')}</Text>
        <Text style={styles.rowLabel}>{t('lblServer')}</Text>
        <Text style={styles.rowValue}>{serverUrl ?? emptyLabel}</Text>
        <Text style={styles.rowLabel}>{t('txtUser')}</Text>
        <Text style={styles.rowValue}>{user?.displayName ?? user?.username ?? emptyLabel}</Text>
        <Button label={t('btnEdit')} variant="ghost" onPress={() => router.push('/(setup)/server')} />
      </View>
      <View style={styles.card}>
        <Image source={LOGO} style={styles.brandLogo} resizeMode="contain" />
        <Text style={styles.brandTag}>PIQSOFT SAS · ERP / MRP</Text>
        <Pressable style={styles.linkRow} onPress={() => void Linking.openURL('https://piqsoft.fr')}>
          <Text style={styles.linkLabel}>Web</Text>
          <Text style={styles.linkValue}>piqsoft.fr</Text>
        </Pressable>
        <Pressable style={styles.linkRow} onPress={() => void Linking.openURL('mailto:info@piqsoft.fr')}>
          <Text style={styles.linkLabel}>E-mail</Text>
          <Text style={styles.linkValue}>info@piqsoft.fr</Text>
        </Pressable>
        <Pressable style={styles.linkRow} onPress={() => void Linking.openURL('tel:+33383526234')}>
          <Text style={styles.linkLabel}>Tel</Text>
          <Text style={styles.linkValue}>+33 3 83 52 62 34</Text>
        </Pressable>
        <View style={styles.linkRow}>
          <Text style={styles.linkLabel}>{dash('certifications')}</Text>
          <Text style={styles.infoValue}>NF203 · NF525</Text>
        </View>
        <Text style={styles.addr}>55 BIS Rue Louis Blériot, 54420 Saulxures-lès-Nancy, France</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('msgVersionCurrent')} {version}</Text>
        <Button label={t('btnLogout')} onPress={() => void logout()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.bg },
  content: { padding: theme.space.lg, paddingBottom: theme.space.xxl },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.color.text,
    marginBottom: theme.space.md
  },
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space.lg,
    marginBottom: theme.space.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    ...theme.shadow.soft
  },
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.color.text,
    marginBottom: theme.space.md
  },
  prefField: {
    marginTop: theme.space.xs
  },
  fieldLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.color.textSecondary,
    marginBottom: theme.space.sm
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space.sm
  },
  presetChip: {
    flexGrow: 1,
    flexBasis: '46%',
    paddingVertical: theme.space.sm,
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.color.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.color.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  presetChipActive: {
    backgroundColor: theme.color.primary,
    borderColor: theme.color.primary
  },
  presetText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.color.textSecondary,
    textAlign: 'center'
  },
  presetTextActive: {
    color: theme.color.textOnPrimary
  },
  rowLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted,
    marginTop: theme.space.sm
  },
  rowValue: {
    fontSize: theme.fontSize.body,
    fontWeight: '600',
    color: theme.color.text
  },
  brandLogo: {
    width: ms(72),
    height: ms(72),
    borderRadius: ms(16),
    marginBottom: theme.space.sm
  },
  brandTag: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.color.textSecondary,
    marginBottom: theme.space.md
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.color.border
  },
  linkLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.color.textMuted,
    fontWeight: '700'
  },
  linkValue: {
    fontSize: theme.fontSize.body,
    color: theme.color.primary,
    fontWeight: '700'
  },
  infoValue: {
    fontSize: theme.fontSize.body,
    color: theme.color.text,
    fontWeight: '700'
  },
  addr: {
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted,
    marginTop: theme.space.md,
    lineHeight: 16
  }
});
