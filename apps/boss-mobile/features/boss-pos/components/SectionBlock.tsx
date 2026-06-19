import { memo, useState, type ReactNode } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FadeInView } from '@/components/ui/FadeInView';
import { ms } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';

type Props = {
  title: string;
  pending?: boolean;
  children: ReactNode;
  accent?: string;
  count?: number;
  plain?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  card?: boolean;
};

export const SectionBlock = memo(function SectionBlock({ title, pending, children, accent, count, plain, collapsible = true, defaultExpanded = true, card = false }: Props)
{
  const barColor = accent ?? theme.color.primary;
  const [expanded, setExpanded] = useState(defaultExpanded);
  const toggle = () =>
  {
    if(collapsible)
    {
      setExpanded((v) => !v);
    }
  };
  return (
    <FadeInView offset={16} duration={380} style={styles.wrap}>
      <Pressable style={[styles.header, card && styles.headerCard, card && expanded && styles.headerCardExpanded]} onPress={toggle} disabled={!collapsible} hitSlop={6}>
        <View style={styles.titleRow}>
          <View style={[styles.bar, { backgroundColor: barColor }]} />
          <Text style={styles.title}>{title}</Text>
          {typeof count === 'number' && count > 0 ?
            (
              <View style={[styles.countPill, card && styles.countPillCard, { backgroundColor: card ? barColor : `${barColor}1A` }]}>
                <Text style={[textSharp, styles.countText, { color: card ? theme.color.textOnPrimary : barColor }]}>{count}</Text>
              </View>
            ) : null}
        </View>
        {pending ? <ActivityIndicator size="small" color={barColor} /> : null}
        {collapsible ?
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={ms(18)} color={theme.color.textMuted} /> : null}
      </Pressable>
      {expanded ?
        <View style={plain ? undefined : [styles.body, card && styles.bodyCard]}>{children}</View> : null}
    </FadeInView>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: theme.space.lg,
    marginBottom: theme.space.lg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.sm,
    marginBottom: theme.space.sm,
    paddingHorizontal: theme.space.xs
  },
  headerCard: {
    marginBottom: 0,
    paddingVertical: theme.space.md,
    paddingHorizontal: theme.space.lg,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
    ...theme.shadow.soft
  },
  headerCardExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    flex: 1
  },
  bar: {
    width: ms(4),
    height: ms(18),
    borderRadius: 2
  },
  title: {
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    color: theme.color.text
  },
  countPill: {
    minWidth: ms(22),
    paddingHorizontal: ms(6),
    height: ms(20),
    borderRadius: ms(10),
    alignItems: 'center',
    justifyContent: 'center'
  },
  countPillCard: {
    minWidth: ms(26),
    height: ms(24),
    borderRadius: ms(12),
    ...theme.shadow.soft
  },
  countText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '800'
  },
  body: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.color.border,
    ...theme.shadow.soft
  },
  bodyCard: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0
  }
});
