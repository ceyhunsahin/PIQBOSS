import { memo, type ReactNode, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { f, ms, pctH } from '@/lib/responsive';
import { theme } from '@/lib/theme';

type Props = {
  visible: boolean;
  title: string;
  subtitle?: string;
  loading?: boolean;
  onClose: () => void;
  onExportPdf?: () => void;
  onShareWhatsApp?: () => void;
  children: ReactNode;
};

export const BottomSheet = memo(function BottomSheet({ visible, title, subtitle, loading, onClose, onExportPdf, onShareWhatsApp, children }: Props)
{
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const slide = useRef(new Animated.Value(480)).current;
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() =>
  {
    if(visible)
    {
      Animated.parallel([
        Animated.spring(slide, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }),
        Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true })
      ]).start();
    }
    else
    {
      slide.setValue(480);
      fade.setValue(0);
    }
  }, [visible, slide, fade]);
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: fade }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, theme.space.lg),
              transform: [{ translateY: slide }]
            }
          ]}
        >
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
          <View style={styles.header}>
            <View style={styles.headerMain}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ?
                <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <View style={styles.headerActions}>
              {onShareWhatsApp ?
                (
                  <Pressable style={styles.waBtn} onPress={onShareWhatsApp} hitSlop={6}>
                    <Ionicons name="logo-whatsapp" size={ms(20)} color={theme.color.textOnInk} />
                  </Pressable>
                ) : null}
              {onExportPdf ?
                (
                  <Pressable style={styles.actionBtn} onPress={onExportPdf}>
                    <Text style={styles.actionPdf}>{t('dashboardOff.viewPDF')}</Text>
                  </Pressable>
                ) : null}
              <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={10}>
                <Text style={styles.closeLabel}>✕</Text>
              </Pressable>
            </View>
          </View>
          {loading ?
            (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={theme.color.primary} />
                <Text style={styles.loadingText}>{t('loading')}</Text>
              </View>
            ) :
            (
              <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {children}
              </ScrollView>
            )}
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  root: {
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
    maxHeight: pctH(theme.layout.sheetMaxHeightPct * 100),
    backgroundColor: theme.color.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    overflow: 'hidden',
    ...theme.shadow.sheet
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: theme.space.sm,
    paddingBottom: theme.space.xs,
    backgroundColor: theme.color.sheetHeader
  },
  handle: {
    width: ms(42),
    height: ms(4),
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.28)'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
    backgroundColor: theme.color.sheetHeader
  },
  headerMain: {
    flex: 1,
    marginRight: theme.space.md
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.color.textOnInk,
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.color.textOnPrimaryMuted,
    marginTop: theme.space.xs
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm
  },
  actionBtn: {
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)'
  },
  actionPdf: {
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    color: theme.color.textOnInk,
    letterSpacing: 0.4
  },
  waBtn: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37, 211, 102, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.5)'
  },
  closeBtn: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeLabel: {
    fontSize: f(16),
    color: theme.color.textOnInk,
    fontWeight: '700'
  },
  loading: {
    paddingVertical: theme.space.xxl,
    alignItems: 'center',
    gap: theme.space.md
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.color.textMuted,
    fontWeight: '600'
  },
  scroll: {
    maxHeight: pctH(theme.layout.listMaxHeightPct * 100)
  },
  scrollContent: {
    padding: theme.space.lg,
    paddingBottom: theme.space.xl
  }
});
