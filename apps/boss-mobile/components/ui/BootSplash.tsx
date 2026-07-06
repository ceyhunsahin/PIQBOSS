import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ms } from '@/lib/responsive';
import { theme } from '@/lib/theme';

const LOGO = require('../../assets/icon.png');

export function BootSplash()
{
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.bgCircleLarge} />
      <View style={styles.bgCircleSmall} />
      <View style={styles.center}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
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
  logo: {
    width: ms(88),
    height: ms(88),
    borderRadius: ms(20),
    marginBottom: theme.space.lg
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
