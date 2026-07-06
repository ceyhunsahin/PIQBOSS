import { memo, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MenuItem } from '@/lib/menu';
import { ms } from '@/lib/responsive';
import { theme } from '@/lib/theme';

type Props = {
  items: MenuItem[];
  activeId?: string;
};

export const ModuleSelect = memo(function ModuleSelect({ items, activeId }: Props)
{
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const active = useMemo(() => items.find((x) => x.id === activeId) ?? items[0], [activeId, items]);
  const close = () => setOpen(false);
  const navigate = (route: MenuItem['route']) =>
  {
    close();
    router.push(route as Href);
  };
  if(items.length <= 1)
  {
    return null;
  }
  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)} hitSlop={8}>
        <Ionicons name="grid" size={ms(18)} color={theme.color.accentLight} />
      </Pressable>
      <Modal visible={open} animationType="slide" transparent onRequestClose={close}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={close} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, theme.space.lg) }]}>
            <View style={styles.handle} />
            <View style={styles.head}>
              <Text style={styles.sheetTitle}>{t('txtModule')}</Text>
              <Pressable style={styles.closeBtn} onPress={close} hitSlop={10}>
                <Ionicons name="close" size={ms(22)} color={theme.color.textSecondary} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.options} showsVerticalScrollIndicator={false}>
              {items.map((item) =>
              {
                const selected = item.id === active?.id;
                return (
                  <Pressable
                    key={item.id}
                    style={[styles.option, selected && styles.optionActive]}
                    onPress={() => navigate(item.route)}
                  >
                    <View style={[styles.optionIcon, selected && styles.optionIconActive]}>
                      <Ionicons name="apps" size={ms(22)} color={selected ? theme.color.primary : theme.color.textMuted} />
                    </View>
                    <Text style={[styles.optionText, selected && styles.optionTextActive]}>{t(item.labelKey)}</Text>
                    {selected ?
                      <Ionicons name="checkmark-circle" size={ms(26)} color={theme.color.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable style={styles.cancelBtn} onPress={close}>
              <Text style={styles.cancelText}>{t('btnCancel')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  trigger: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)'
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
    paddingTop: theme.space.md,
    maxHeight: '82%',
    ...theme.shadow.sheet
  },
  handle: {
    alignSelf: 'center',
    width: ms(48),
    height: ms(5),
    borderRadius: ms(3),
    backgroundColor: theme.color.border,
    marginBottom: theme.space.lg
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.space.lg
  },
  closeBtn: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.surfaceMuted
  },
  sheetTitle: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.color.text
  },
  options: {
    gap: theme.space.md,
    paddingBottom: theme.space.sm
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.md,
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surfaceMuted
  },
  optionActive: {
    borderColor: theme.color.primary,
    backgroundColor: theme.color.primarySoft
  },
  optionIcon: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.surfaceTint
  },
  optionIconActive: {
    backgroundColor: theme.color.surface
  },
  optionText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.color.text
  },
  optionTextActive: {
    color: theme.color.primaryDark
  },
  cancelBtn: {
    marginTop: theme.space.sm,
    alignItems: 'center',
    paddingVertical: theme.space.lg
  },
  cancelText: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.color.textSecondary
  }
});
