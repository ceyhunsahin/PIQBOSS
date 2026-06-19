import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { ms } from '@/lib/responsive';
import { theme } from '@/lib/theme';

const LOGO = require('../../assets/piqsoft-logo.png');

type Props = {
  title?: string;
  subtitle?: string;
};

export function AuthHeader({ subtitle }: Props)
{
  const { t } = useTranslation();
  const resolvedSubtitle = subtitle ?? t('lblLogin');
  return (
    <LinearGradient colors={theme.gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.wrap}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
        <View style={styles.bgCircleLarge} />
        <View style={styles.bgCircleSmall} />
        <View style={styles.inner}>
          <View style={styles.logoCard}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.subtitle}>{resolvedSubtitle}</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexShrink: 0,
    minHeight: theme.layout.authHeaderMin,
    overflow: 'hidden'
  },
  safe: {
    flex: 1
  },
  bgCircleLarge: {
    position: 'absolute',
    width: ms(240),
    height: ms(240),
    borderRadius: ms(120),
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -ms(90),
    right: -ms(60)
  },
  bgCircleSmall: {
    position: 'absolute',
    width: ms(120),
    height: ms(120),
    borderRadius: ms(60),
    backgroundColor: 'rgba(236,78,120,0.10)',
    bottom: ms(30),
    left: -ms(36)
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.space.xl,
    paddingTop: theme.space.xxl + theme.space.md,
    paddingBottom: theme.space.xl,
    gap: theme.space.sm
  },
  logoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.space.xl,
    paddingVertical: theme.space.lg,
    ...theme.shadow.card
  },
  logo: {
    width: ms(186),
    height: ms(67)
  },
  subtitle: {
    color: theme.color.textOnPrimaryMuted,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    letterSpacing: 0.3
  }
});
