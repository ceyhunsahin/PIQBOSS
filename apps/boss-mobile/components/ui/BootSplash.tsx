import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { f, ms } from '@/lib/responsive';
import { theme } from '@/lib/theme';

export function BootSplash()
{
  const { t } = useTranslation();
  const mark = t('lblLogin').slice(0, 1).toUpperCase();
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.bgCircleLarge} />
      <View style={styles.bgCircleSmall} />
      <View style={styles.center}>
        <View style={styles.mark}>
          <Text style={styles.markText}>{mark}</Text>
        </View>
        <Text style={styles.title}>{t('lblLogin')}</Text>
        <Text style={styles.subtitle}>{t('splash.title')}</Text>
        <ActivityIndicator style={styles.loader} color={theme.color.textOnPrimary} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.color.primary
  },
  bgCircleLarge: {
    position: 'absolute',
    width: ms(280),
    height: ms(280),
    borderRadius: ms(140),
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -ms(80),
    right: -ms(60)
  },
  bgCircleSmall: {
    position: 'absolute',
    width: ms(120),
    height: ms(120),
    borderRadius: ms(60),
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: ms(120),
    left: -ms(30)
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.space.xl
  },
  mark: {
    width: ms(72),
    height: ms(72),
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.space.lg
  },
  markText: {
    color: theme.color.textOnPrimary,
    fontSize: f(32),
    fontWeight: '800'
  },
  title: {
    color: theme.color.textOnPrimary,
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  subtitle: {
    color: theme.color.textOnPrimaryMuted,
    fontSize: theme.fontSize.body,
    marginTop: theme.space.sm
  },
  loader: {
    marginTop: theme.space.xxl
  }
});
