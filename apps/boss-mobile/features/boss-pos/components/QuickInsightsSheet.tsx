import { memo, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useTDash } from '@/lib/i18n';
import { ms } from '@/lib/responsive';
import { theme } from '@/lib/theme';
import type { DateRange } from '@/lib/dateRange';
import { loadQuickInsights, type QuickCard } from '../detail/fetchQuickInsights';

type Props = {
  visible: boolean;
  serverUrl: string | null;
  range: DateRange;
  onClose: () => void;
};

export const QuickInsightsSheet = memo(function QuickInsightsSheet({ visible, serverUrl, range, onClose }: Props)
{
  const dash = useTDash();
  const [cards, setCards] = useState<QuickCard[]>([]);
  const [busy, setBusy] = useState(false);
  const [ranks, setRanks] = useState<Record<string, number>>({});
  useEffect(() =>
  {
    if(!visible || !serverUrl)
    {
      return;
    }
    let active = true;
    setBusy(true);
    setRanks({});
    void (async () =>
    {
      try
      {
        const res = await loadQuickInsights(serverUrl, range);
        if(active)
        {
          setCards(res);
        }
      }
      catch
      {
        if(active)
        {
          setCards([]);
        }
      }
      finally
      {
        if(active)
        {
          setBusy(false);
        }
      }
    })();
    return () => { active = false; };
  }, [visible, serverUrl, range.from, range.to]);
  const rotate = useCallback((card: QuickCard) =>
  {
    if(card.rows.length <= 1)
    {
      return;
    }
    setRanks((prev) => ({ ...prev, [card.id]: ((prev[card.id] ?? 0) + 1) % card.rows.length }));
  }, []);
  return (
    <BottomSheet visible={visible} title={dash('quickPanelTitle')} subtitle={dash('quickPanelSubtitle')} loading={busy} onClose={onClose}>
      <Text style={styles.note}>{dash('quickPanelBaseNote')}</Text>
      <View style={styles.grid}>
        {cards.map((card) =>
        {
          const idx = ranks[card.id] ?? 0;
          const row = card.rows[idx];
          return (
            <Pressable
              key={card.id}
              style={({ pressed }) => [styles.card, { borderLeftColor: card.accent }, pressed && styles.cardPressed]}
              onPress={() => rotate(card)}
            >
              <View style={styles.cardHead}>
                <View style={[styles.cardIcon, { backgroundColor: `${card.accent}1A` }]}>
                  <Ionicons name={card.icon as keyof typeof Ionicons.glyphMap} size={ms(16)} color={card.accent} />
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>{card.title}</Text>
                {card.rows.length > 1 ?
                  (
                    <View style={[styles.rankPill, { backgroundColor: `${card.accent}1A` }]}>
                      <Text style={[styles.rankText, { color: card.accent }]}>{`${idx + 1}/${card.rows.length}`}</Text>
                    </View>
                  ) : null}
              </View>
              {row ?
                (
                  <>
                    <Text style={[styles.cardValue, { color: card.accent }]} numberOfLines={2}>{row.value}</Text>
                    <Text style={styles.cardSub} numberOfLines={2}>{row.sub}</Text>
                  </>
                ) :
                <Text style={styles.cardEmpty}>{dash('quickNoData')}</Text>}
              {card.description ?
                <Text style={styles.cardDesc} numberOfLines={2}>{card.description}</Text> : null}
              {card.rows.length > 1 ?
                (
                  <View style={styles.rotateHint}>
                    <Ionicons name="repeat" size={ms(12)} color={theme.color.textMuted} />
                    <Text style={styles.rotateText}>{dash('quickHelpRotation')}</Text>
                  </View>
                ) : null}
            </Pressable>
          );
        })}
        {!busy && cards.length === 0 ?
          <Text style={styles.cardEmpty}>{dash('quickNoData')}</Text> : null}
      </View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  note: {
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted,
    marginBottom: theme.space.md,
    lineHeight: 16
  },
  grid: {
    gap: theme.space.md
  },
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderLeftWidth: 4,
    padding: theme.space.md,
    ...theme.shadow.soft
  },
  cardPressed: {
    opacity: 0.7
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm
  },
  cardIcon: {
    width: ms(30),
    height: ms(30),
    borderRadius: ms(15),
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: {
    flex: 1,
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
    color: theme.color.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  rankPill: {
    paddingHorizontal: ms(8),
    height: ms(20),
    borderRadius: ms(10),
    alignItems: 'center',
    justifyContent: 'center'
  },
  rankText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '800'
  },
  cardValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginTop: theme.space.sm
  },
  cardSub: {
    fontSize: theme.fontSize.sm,
    color: theme.color.text,
    marginTop: 2
  },
  cardDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted,
    marginTop: theme.space.sm,
    lineHeight: 15
  },
  cardEmpty: {
    fontSize: theme.fontSize.sm,
    color: theme.color.textMuted,
    marginTop: theme.space.sm
  },
  rotateHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: theme.space.sm
  },
  rotateText: {
    fontSize: 10,
    color: theme.color.textMuted,
    flex: 1
  }
});
