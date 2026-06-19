import { memo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ms } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';

type Option = {
  value: string;
  label: string;
  sub?: string;
};

type Props = {
  label: string;
  placeholder?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  emptyLabel?: string;
};

export const ComboSelect = memo(function ComboSelect({ label, placeholder, options, value, onChange, disabled, loading, emptyLabel }: Props)
{
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const active = options.find((x) => x.value === value);
  const close = () => setOpen(false);
  const pick = (next: string) =>
  {
    onChange(next);
    close();
  };
  return (
    <>
      <View style={styles.wrap}>
        <Text style={[textSharp, styles.label]}>{label}</Text>
        <Pressable
          style={[styles.box, (disabled || loading) && styles.boxDisabled]}
          onPress={() => (!disabled && !loading ? setOpen(true) : undefined)}
        >
          <View style={styles.textWrap}>
            <Text style={[textSharp, styles.value, !active && styles.placeholder]} numberOfLines={1}>
              {loading ? t('loading') : (active?.label ?? placeholder ?? label)}
            </Text>
            {active?.sub ?
              <Text style={[textSharp, styles.sub]} numberOfLines={1}>{active.sub}</Text> : null}
          </View>
          <Ionicons name="chevron-down" size={ms(18)} color={theme.color.textMuted} />
        </Pressable>
      </View>
      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={close} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, theme.space.lg) }]}>
            <View style={styles.handle} />
            <View style={styles.head}>
              <Text style={[textSharp, styles.sheetTitle]}>{label}</Text>
              <Pressable style={styles.closeBtn} onPress={close} hitSlop={10}>
                <Ionicons name="close" size={ms(22)} color={theme.color.textSecondary} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.options} showsVerticalScrollIndicator={false}>
              {options.length === 0 ?
                <Text style={[textSharp, styles.empty]}>{emptyLabel ?? t('msgNoFirmRegistered')}</Text> : null}
              {options.map((opt) =>
              {
                const selected = opt.value === value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.option, selected && styles.optionActive]}
                    onPress={() => pick(opt.value)}
                  >
                    <View style={styles.optionTextWrap}>
                      <Text style={[textSharp, styles.optionText, selected && styles.optionTextActive]}>{opt.label}</Text>
                      {opt.sub ?
                        <Text style={[textSharp, styles.optionSub]} numberOfLines={1}>{opt.sub}</Text> : null}
                    </View>
                    {selected ?
                      <Ionicons name="checkmark-circle" size={20} color={theme.color.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginBottom: theme.space.lg
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.color.textSecondary,
    marginBottom: theme.space.sm
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: theme.layout.inputHeight,
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface
  },
  boxDisabled: {
    opacity: 0.6
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
    paddingVertical: theme.space.sm
  },
  value: {
    fontSize: theme.fontSize.body,
    fontWeight: '600',
    color: theme.color.text
  },
  placeholder: {
    color: theme.color.textMuted,
    fontWeight: '500'
  },
  sub: {
    marginTop: 2,
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted
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
    maxHeight: '72%',
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
  options: {
    gap: theme.space.sm,
    paddingBottom: theme.space.sm
  },
  empty: {
    textAlign: 'center',
    color: theme.color.textMuted,
    paddingVertical: theme.space.xl
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.md,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surfaceMuted
  },
  optionActive: {
    borderColor: theme.color.primary,
    backgroundColor: theme.color.primarySoft
  },
  optionTextWrap: {
    flex: 1,
    minWidth: 0,
    marginRight: theme.space.sm
  },
  optionText: {
    fontSize: theme.fontSize.body,
    fontWeight: '600',
    color: theme.color.text
  },
  optionTextActive: {
    color: theme.color.primaryDark
  },
  optionSub: {
    marginTop: 2,
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted
  }
});
