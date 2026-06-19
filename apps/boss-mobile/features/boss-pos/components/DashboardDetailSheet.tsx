import { memo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useTDash } from '@/lib/i18n';
import { ms, pctH } from '@/lib/responsive';
import { theme } from '@/lib/theme';
import { ColumnChart } from './ColumnChart';
import type { DetailContent, DetailSection } from '../detail/types';

type Props = {
  visible: boolean;
  loading?: boolean;
  content: DetailContent | null;
  onClose: () => void;
  onExportPdf?: () => void;
  onShareWhatsApp?: () => void;
};

export const DashboardDetailSheet = memo(function DashboardDetailSheet({ visible, loading, content, onClose, onExportPdf, onShareWhatsApp }: Props)
{
  const dash = useTDash();
  const tabs = content?.tabs ?? null;
  const [activeTab, setActiveTab] = useState(0);
  useEffect(() =>
  {
    setActiveTab(0);
  }, [content?.title, tabs?.length]);
  const activeIndex = tabs && activeTab < tabs.length ? activeTab : 0;
  const sections: DetailSection[] = tabs ? (tabs[activeIndex]?.sections ?? []) : (content?.sections ?? []);
  const renderSection = (section: DetailSection, sectionIndex: number) => (
    <View key={`${section.title}-${sectionIndex}`} style={styles.section}>
      {tabs ? null :
        (
          <View style={styles.sectionHead}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
      {section.chart && section.chart.length > 0 ?
        (
          <View style={styles.chartWrap}>
            <ColumnChart items={section.chart} colors={theme.gradient.royal} emptyText={dash('noData')} />
          </View>
        ) : null}
      <View style={styles.sectionBody}>
        {section.rows.length === 0 ?
          <Text style={styles.empty}>{section.emptyText ?? dash('noData')}</Text> : null}
        {section.rows.map((row, index) =>
        {
          const last = index === section.rows.length - 1;
          const body = (
            <>
              <View style={styles.rowMain}>
                <View style={styles.rowLeft}>
                  <Text style={styles.rowLabel} numberOfLines={2}>{row.label}</Text>
                  {row.sub ?
                    <Text style={styles.rowSub} numberOfLines={2}>{row.sub}</Text> : null}
                </View>
                {row.value ?
                  <Text style={[styles.rowValue, row.accent ? { color: row.accent } : null]}>{row.value}</Text> : null}
                {row.onPress ?
                  <Ionicons name="chevron-forward" size={ms(14)} color={theme.color.textMuted} /> : null}
              </View>
              {row.note ?
                (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteText}>{row.note}</Text>
                  </View>
                ) : null}
            </>
          );
          if(row.onPress)
          {
            return (
              <Pressable
                key={`${row.label}-${index}`}
                style={({ pressed }) => [styles.row, last && styles.rowLast, pressed && styles.rowPressed]}
                onPress={row.onPress}
              >
                {body}
              </Pressable>
            );
          }
          return (
            <View key={`${row.label}-${index}`} style={[styles.row, last && styles.rowLast]}>
              {body}
            </View>
          );
        })}
      </View>
    </View>
  );
  return (
    <BottomSheet
      visible={visible}
      title={content?.title ?? dash('detail')}
      subtitle={content?.subtitle}
      loading={loading}
      onClose={onClose}
      onExportPdf={onExportPdf}
      onShareWhatsApp={onShareWhatsApp}
    >
      {content?.back ?
        (
          <Pressable style={styles.back} onPress={content.back.onPress} hitSlop={8}>
            <Ionicons name="chevron-back" size={ms(16)} color={theme.color.primary} />
            <Text style={styles.backLabel} numberOfLines={1}>{content.back.label}</Text>
          </Pressable>
        ) : null}
      {tabs && tabs.length > 0 ?
        (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBar}
            style={styles.tabBarWrap}
          >
            {tabs.map((tab, index) =>
            {
              const active = index === activeIndex;
              const accent = tab.accent ?? theme.color.primary;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(index)}
                  style={[styles.tab, active && { backgroundColor: accent, borderColor: accent }]}
                >
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>{tab.label}</Text>
                  {typeof tab.badge === 'number' ?
                    (
                      <View style={[styles.tabBadge, active && styles.tabBadgeActive]}>
                        <Text style={[styles.tabBadgeText, active && { color: accent }]}>{tab.badge}</Text>
                      </View>
                    ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}
      {tabs && tabs.length > 0 ?
        (
          <View style={styles.tabContent}>
            {sections.map(renderSection)}
          </View>
        ) :
        sections.map(renderSection)}
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: theme.space.xs,
    paddingRight: theme.space.md,
    marginBottom: theme.space.sm
  },
  backLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.color.primary,
    maxWidth: ms(220)
  },
  tabBarWrap: {
    marginBottom: theme.space.md
  },
  tabContent: {
    minHeight: pctH(56)
  },
  tabBar: {
    flexDirection: 'row',
    gap: theme.space.sm,
    paddingRight: theme.space.md
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.xs,
    paddingVertical: theme.space.xs,
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surfaceMuted
  },
  tabLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.color.textSecondary
  },
  tabLabelActive: {
    color: theme.color.textOnPrimary
  },
  tabBadge: {
    minWidth: ms(20),
    paddingHorizontal: ms(5),
    height: ms(18),
    borderRadius: ms(9),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.border
  },
  tabBadgeActive: {
    backgroundColor: theme.color.surface,
    borderColor: 'transparent'
  },
  tabBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
    color: theme.color.textSecondary
  },
  section: {
    marginBottom: theme.space.lg
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    marginBottom: theme.space.sm
  },
  sectionBar: {
    width: ms(3),
    height: ms(14),
    borderRadius: 2,
    backgroundColor: theme.color.primary
  },
  sectionTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
    color: theme.color.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.7
  },
  sectionBody: {
    backgroundColor: theme.color.surfaceMuted,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    overflow: 'hidden'
  },
  chartWrap: {
    marginBottom: theme.space.sm
  },
  empty: {
    fontSize: theme.fontSize.sm,
    color: theme.color.textMuted,
    padding: theme.space.lg
  },
  row: {
    flexDirection: 'column',
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.color.border,
    backgroundColor: theme.color.surface
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.md
  },
  rowLast: {
    borderBottomWidth: 0
  },
  rowPressed: {
    backgroundColor: theme.color.surfaceMuted
  },
  rowLeft: {
    flex: 1
  },
  rowLabel: {
    fontSize: theme.fontSize.body,
    fontWeight: '600',
    color: theme.color.text
  },
  rowSub: {
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted,
    marginTop: 3,
    lineHeight: ms(16)
  },
  rowValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    color: theme.color.primary,
    textAlign: 'right',
    maxWidth: '42%'
  },
  noteBox: {
    marginTop: theme.space.sm,
    paddingVertical: theme.space.xs,
    paddingHorizontal: theme.space.sm,
    backgroundColor: 'rgba(37,99,235,0.08)',
    borderRadius: theme.radius.sm,
    borderLeftWidth: ms(3),
    borderLeftColor: theme.color.primary
  },
  noteText: {
    fontSize: theme.fontSize.xs,
    color: theme.color.textSecondary,
    lineHeight: ms(16)
  }
});
