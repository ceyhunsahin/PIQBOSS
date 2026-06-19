import { memo, useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import {
  buildDatePresets,
  formatDisplayDate,
  formatRangeLabel,
  normalizeRange,
  parseIsoDate,
  toIsoDate,
  type DatePresetId,
  type DateRange
} from '@/lib/dateRange';
import { useSnapOffsets } from '../hooks/useSnapOffsets';
import { useBossPresetLabel, useTDash } from '@/lib/i18n';
import { f, ms } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';

type Props = {
  range: DateRange;
  preset: DatePresetId;
  busy?: boolean;
  onApply: (range: DateRange, preset: DatePresetId) => void;
  onRefresh: () => void;
};

type PickerTarget = 'start' | 'end' | null;

export const DateRangePicker = memo(function DateRangePicker({ range, preset, busy, onApply, onRefresh }: Props)
{
  const { t, i18n } = useTranslation();
  const dash = useTDash();
  const presetLabel = useBossPresetLabel();
  const pickerLocale = i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'en' ? 'en-US' : 'fr-FR';
  const [open, setOpen] = useState(false);
  const [draftPreset, setDraftPreset] = useState<DatePresetId>(preset);
  const [draftFrom, setDraftFrom] = useState(range.from);
  const [draftTo, setDraftTo] = useState(range.to);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const presets = useMemo(() => buildDatePresets(), []);
  const { offsets: presetOffsets, onItemLayout: onPresetLayout } = useSnapOffsets(presets.length, 0);
  const openSheet = useCallback(() =>
  {
    setDraftPreset(preset);
    setDraftFrom(range.from);
    setDraftTo(range.to);
    setOpen(true);
  }, [preset, range.from, range.to]);
  const applyPreset = useCallback((id: DatePresetId) =>
  {
    const p = buildDatePresets().find((x) => x.id === id);
    if(!p)
    {
      return;
    }
    setDraftPreset(id);
    setDraftFrom(p.range.from);
    setDraftTo(p.range.to);
  }, []);
  const onPickerChange = useCallback((event: DateTimePickerEvent, date?: Date) =>
  {
    if(Platform.OS === 'android')
    {
      setPickerTarget(null);
    }
    if(event.type === 'dismissed' || !date)
    {
      return;
    }
    const iso = toIsoDate(date);
    if(pickerTarget === 'start')
    {
      setDraftFrom(iso);
      if(parseIsoDate(iso) > parseIsoDate(draftTo))
      {
        setDraftTo(iso);
      }
      setDraftPreset('custom');
      if(Platform.OS === 'ios')
      {
        setPickerTarget(null);
      }
    }
    else if(pickerTarget === 'end')
    {
      setDraftTo(iso);
      if(parseIsoDate(iso) < parseIsoDate(draftFrom))
      {
        setDraftFrom(iso);
      }
      setDraftPreset('custom');
      if(Platform.OS === 'ios')
      {
        setPickerTarget(null);
      }
    }
  }, [pickerTarget, draftFrom, draftTo]);
  const confirm = useCallback(() =>
  {
    const next = normalizeRange({ from: draftFrom, to: draftTo });
    onApply(next, draftPreset);
    setOpen(false);
  }, [draftFrom, draftTo, draftPreset, onApply]);
  return (
    <>
      <View style={styles.banner}>
        <Pressable style={styles.rangeBtn} onPress={openSheet}>
          <Text style={[textSharp, styles.rangeCaption]}>{dash('selectDateRange')}</Text>
          <Text style={[textSharp, styles.rangeValue]}>{formatRangeLabel(range)}</Text>
          <Text style={[textSharp, styles.rangePreset]}>{presetLabel(preset)}</Text>
        </Pressable>
        <Pressable style={[styles.refreshBtn, busy && styles.refreshDisabled]} onPress={onRefresh} disabled={busy}>
          <Text style={[textSharp, styles.refreshIcon]}>↻</Text>
        </Pressable>
      </View>
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={[textSharp, styles.sheetTitle]}>{dash('selectDateRange')}</Text>
          <Text style={[textSharp, styles.sheetSub]}>{dash('selectCompareDateHint')}</Text>
          <View style={styles.dateRow}>
            <Pressable style={styles.dateCell} onPress={() => setPickerTarget('start')}>
              <Text style={[textSharp, styles.dateLabel]}>{dash('startDate')}</Text>
              <Text style={[textSharp, styles.dateValue]}>{formatDisplayDate(draftFrom)}</Text>
            </Pressable>
            <View style={styles.dateArrow}>
              <Text style={[textSharp, styles.dateArrowText]}>→</Text>
            </View>
            <Pressable style={styles.dateCell} onPress={() => setPickerTarget('end')}>
              <Text style={[textSharp, styles.dateLabel]}>{dash('endDate')}</Text>
              <Text style={[textSharp, styles.dateValue]}>{formatDisplayDate(draftTo)}</Text>
            </Pressable>
          </View>
          {pickerTarget && Platform.OS === 'ios' ?
            (
              <View style={styles.iosPickerWrap}>
                <DateTimePicker
                  value={parseIsoDate(pickerTarget === 'start' ? draftFrom : draftTo)}
                  mode="date"
                  display="spinner"
                  onChange={onPickerChange}
                  locale={pickerLocale}
                />
              </View>
            ) : null}
          <Text style={[textSharp, styles.shortcutTitle]}>{dash('selectDateRange')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shortcuts}
            snapToOffsets={presetOffsets.length ? presetOffsets : undefined}
            decelerationRate="fast"
            disableIntervalMomentum
          >
            {presets.map((p, i) =>
            {
              const active = draftPreset === p.id;
              return (
                <Pressable
                  key={p.id}
                  onLayout={onPresetLayout(i)}
                  style={[styles.shortcut, active && styles.shortcutActive]}
                  onPress={() => applyPreset(p.id)}
                >
                  <Text style={[textSharp, styles.shortcutText, active && styles.shortcutTextActive]}>{presetLabel(p.id)}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={() => setOpen(false)}>
              <Text style={[textSharp, styles.cancelText]}>{t('btnCancel')}</Text>
            </Pressable>
            <Pressable style={styles.applyBtn} onPress={confirm}>
              <Text style={[textSharp, styles.applyText]}>{t('btnOk')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {pickerTarget && Platform.OS === 'android' ?
        (
          <DateTimePicker
            value={parseIsoDate(pickerTarget === 'start' ? draftFrom : draftTo)}
            mode="date"
            display="default"
            onChange={onPickerChange}
          />
        ) : null}
    </>
  );
});

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: theme.space.lg,
    marginTop: theme.space.sm,
    marginBottom: theme.space.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    padding: theme.space.md,
    ...theme.shadow.soft
  },
  rangeBtn: {
    flex: 1
  },
  rangeCaption: {
    color: theme.color.textMuted,
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  rangeValue: {
    color: theme.color.text,
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    marginTop: theme.space.xs,
    letterSpacing: -0.2
  },
  rangePreset: {
    color: theme.color.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginTop: theme.space.xs
  },
  refreshBtn: {
    width: ms(42),
    height: ms(42),
    borderRadius: theme.radius.sm,
    backgroundColor: theme.color.primarySoft,
    borderWidth: 1,
    borderColor: theme.color.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.space.md
  },
  refreshDisabled: {
    opacity: 0.5
  },
  refreshIcon: {
    color: theme.color.primary,
    fontSize: f(20),
    fontWeight: '700'
  },
  backdrop: {
    flex: 1,
    backgroundColor: theme.color.overlay
  },
  sheet: {
    backgroundColor: theme.color.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingHorizontal: theme.space.xl,
    paddingBottom: theme.space.xxl,
    paddingTop: theme.space.md
  },
  handle: {
    alignSelf: 'center',
    width: ms(40),
    height: ms(4),
    borderRadius: 2,
    backgroundColor: theme.color.border,
    marginBottom: theme.space.lg
  },
  sheetTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.color.text
  },
  sheetSub: {
    fontSize: theme.fontSize.sm,
    color: theme.color.textSecondary,
    marginTop: theme.space.xs,
    marginBottom: theme.space.lg,
    lineHeight: f(20)
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.space.md
  },
  dateCell: {
    flex: 1,
    backgroundColor: theme.color.surfaceMuted,
    borderRadius: theme.radius.md,
    padding: theme.space.md,
    borderWidth: 1,
    borderColor: theme.color.border
  },
  dateLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.color.textMuted,
    textTransform: 'uppercase'
  },
  dateValue: {
    fontSize: theme.fontSize.body,
    fontWeight: '800',
    color: theme.color.primary,
    marginTop: theme.space.sm
  },
  dateArrow: {
    paddingHorizontal: theme.space.sm
  },
  dateArrowText: {
    fontSize: theme.fontSize.lg,
    color: theme.color.textMuted
  },
  iosPickerWrap: {
    marginBottom: theme.space.md
  },
  shortcutTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.color.textSecondary,
    marginBottom: theme.space.sm
  },
  shortcuts: {
    gap: theme.space.sm,
    paddingBottom: theme.space.lg
  },
  shortcut: {
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    borderRadius: 999,
    backgroundColor: theme.color.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.color.border
  },
  shortcutActive: {
    backgroundColor: theme.color.primary,
    borderColor: theme.color.primary
  },
  shortcutText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.color.textSecondary
  },
  shortcutTextActive: {
    color: theme.color.textOnPrimary
  },
  actions: {
    flexDirection: 'row',
    gap: theme.space.sm
  },
  cancelBtn: {
    flex: 1,
    height: theme.layout.buttonHeight,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.color.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelText: {
    fontWeight: '700',
    color: theme.color.textSecondary
  },
  applyBtn: {
    flex: 1,
    height: theme.layout.buttonHeight,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.color.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  applyText: {
    fontWeight: '700',
    color: theme.color.textOnPrimary
  }
});
