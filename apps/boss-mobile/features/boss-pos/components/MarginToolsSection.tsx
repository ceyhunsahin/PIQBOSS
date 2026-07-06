import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ComboSelect } from '@/components/ui/ComboSelect';
import { PressableScale } from '@/components/ui/PressableScale';
import { ms } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { useTDash } from '@/lib/i18n';
import { theme } from '@/lib/theme';
import type { DateRange } from '@/lib/dateRange';
import { fetchLowMarginProducts, fetchRedTagItems, fetchUnsoldLossProducts, fetchZeroCostItems } from '../detail/fetchExtraDashboard';
import { SectionBlock } from './SectionBlock';

type Props = {
  serverUrl: string | null;
  range: DateRange;
  groupNames: string[];
  rangeLabel: string;
  onSearch: () => void;
  onLowMarginSold: (threshold: number, groupName: string) => void;
  onLowMarginUnsold: (groupName: string) => void;
  onZeroCost: () => void;
  onRedTag: () => void;
};

const THRESHOLDS = ['5', '10', '15', '20'];

function CountBadge({ count, accent }: { count: number | null; accent: string })
{
  if(count == null)
  {
    return null;
  }
  return (
    <View style={[styles.badge, { backgroundColor: accent }]}>
      <Text style={[textSharp, styles.badgeText]}>{count}</Text>
    </View>
  );
}

function ActionTile({ icon, title, sub, accent, count, onPress }: {
  icon: string;
  title: string;
  sub?: string;
  accent: string;
  count?: number | null;
  onPress: () => void;
})
{
  return (
    <PressableScale onPress={onPress} style={styles.tile}>
      <View style={[styles.tileIcon, { backgroundColor: `${accent}18` }]}>
        <Text style={[textSharp, styles.tileEmoji]}>{icon}</Text>
      </View>
      <View style={styles.tileTextCol}>
        <Text style={[textSharp, styles.tileTitle]} numberOfLines={2}>{title}</Text>
        {sub ?
          <Text style={[textSharp, styles.tileSub]} numberOfLines={1}>{sub}</Text> : null}
      </View>
      <CountBadge count={count ?? null} accent={accent} />
    </PressableScale>
  );
}

export const MarginToolsSection = memo(function MarginToolsSection({
  serverUrl,
  range,
  groupNames,
  rangeLabel,
  onSearch,
  onLowMarginSold,
  onLowMarginUnsold,
  onZeroCost,
  onRedTag
}: Props)
{
  const dash = useTDash();
  const [threshold, setThreshold] = useState('15');
  const [groupName, setGroupName] = useState('');
  const [soldCount, setSoldCount] = useState<number | null>(null);
  const [unsoldCount, setUnsoldCount] = useState<number | null>(null);
  const [zeroCount, setZeroCount] = useState<number | null>(null);
  const [redCount, setRedCount] = useState<number | null>(null);
  const groupOptions = useMemo(() =>
  {
    const all = { value: '', label: dash('all') };
    const names = groupNames.filter(Boolean);
    return [all, ...names.map((name) => ({ value: name, label: name }))];
  }, [dash, groupNames]);
  const thresholdNum = Number(threshold) || 15;
  const groupLabel = groupName || dash('all');
  // Statik sayilar (alis fiyati 0 / kirmizi etiket) tarih araligina gore yuklenir.
  const staticReqRef = useRef(0);
  useEffect(() =>
  {
    if(!serverUrl)
    {
      return;
    }
    const reqId = ++staticReqRef.current;
    void (async () =>
    {
      try
      {
        // Pool kilitlenmesini onlemek icin sirayla yukle (paralel degil).
        const zero = await fetchZeroCostItems(serverUrl);
        if(reqId === staticReqRef.current)
        {
          setZeroCount(zero.length);
        }
        const red = await fetchRedTagItems(serverUrl, range);
        if(reqId === staticReqRef.current)
        {
          setRedCount(red.length);
        }
      }
      catch
      {
        if(reqId === staticReqRef.current)
        {
          setZeroCount(null);
          setRedCount(null);
        }
      }
    })();
  }, [serverUrl, range]);
  // Marj esigi/gruba bagli sayilar (sous marge / risque de perte) debounce ile yuklenir.
  const marginReqRef = useRef(0);
  useEffect(() =>
  {
    if(!serverUrl)
    {
      return;
    }
    const reqId = ++marginReqRef.current;
    const timer = setTimeout(() =>
    {
      void (async () =>
      {
        try
        {
          // Agir sorgular: sirayla yukle (paralel degil) ki socket pool kilitlenmesin.
          const sold = await fetchLowMarginProducts(serverUrl, range, thresholdNum, groupName);
          if(reqId === marginReqRef.current)
          {
            setSoldCount(sold.length);
          }
          const unsold = await fetchUnsoldLossProducts(serverUrl, range, groupName);
          if(reqId === marginReqRef.current)
          {
            setUnsoldCount(unsold.length);
          }
        }
        catch
        {
          if(reqId === marginReqRef.current)
          {
            setSoldCount(null);
            setUnsoldCount(null);
          }
        }
      })();
    }, 400);
    return () => clearTimeout(timer);
  }, [serverUrl, range, thresholdNum, groupName]);
  return (
    <>
      <SectionBlock title={dash('marginFilter')} accent={theme.color.violet}>
        <View style={styles.filtersLast}>
          <Text style={[textSharp, styles.thrLabel]}>{dash('lowMarginMarginLabel')}</Text>
          <View style={styles.thrRow}>
            {THRESHOLDS.map((v) =>
            {
              const active = v === threshold;
              return (
                <Pressable key={v} style={[styles.chip, active && styles.chipActive]} onPress={() => setThreshold(v)}>
                  <Text style={[textSharp, styles.chipText, active && styles.chipTextActive]}>{`< ${v}%`}</Text>
                </Pressable>
              );
            })}
            <View style={styles.thrInputWrap}>
              <TextInput
                style={[textSharp, styles.thrInput]}
                value={threshold}
                onChangeText={(t) => setThreshold(t.replace(/[^0-9]/g, '').slice(0, 3))}
                keyboardType="number-pad"
                placeholder="…"
                placeholderTextColor={theme.color.textMuted}
              />
              <Text style={[textSharp, styles.thrPct]}>%</Text>
            </View>
          </View>
          <PressableScale onPress={() => onLowMarginSold(thresholdNum, groupName)} style={styles.searchBtnLast}>
            <Text style={[textSharp, styles.searchEmoji]}>🔍</Text>
            <View style={styles.searchTextCol}>
              <Text style={[textSharp, styles.searchTitle]}>{dash('lowMarginSoldMode')}</Text>
              <Text style={[textSharp, styles.searchSub]} numberOfLines={1}>{`< ${thresholdNum}% · ${groupLabel}`}</Text>
            </View>
            <CountBadge count={soldCount} accent={theme.color.primary} />
          </PressableScale>
        </View>
      </SectionBlock>
      <SectionBlock title={dash('productAnalysisTools')} accent={theme.color.primary}>
        <View style={styles.filters}>
          <ComboSelect
            label={dash('marginByProductGroups')}
            placeholder={dash('all')}
            options={groupOptions}
            value={groupName}
            onChange={setGroupName}
          />
        </View>
        <View style={styles.list}>
          <ActionTile
            icon="🔎"
            title={dash('itemMarginSearch')}
            sub={dash('itemSearchInfo')}
            accent={theme.color.primary}
            onPress={onSearch}
          />
          <ActionTile
            icon="⚠️"
            title={dash('lowMarginUnsoldLoss')}
            sub={groupLabel}
            accent={theme.color.warning}
            count={unsoldCount}
            onPress={() => onLowMarginUnsold(groupName)}
          />
          <ActionTile
            icon="🧾"
            title={dash('zeroCostItems')}
            accent={theme.color.danger}
            count={zeroCount}
            onPress={onZeroCost}
          />
          <ActionTile
            icon="🔖"
            title={dash('redTagItems')}
            sub={rangeLabel}
            accent={theme.color.pink}
            count={redCount}
            onPress={onRedTag}
          />
        </View>
      </SectionBlock>
    </>
  );
});

const styles = StyleSheet.create({
  filters: {
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.md,
    paddingBottom: theme.space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.color.border
  },
  filtersLast: {
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.md,
    paddingBottom: theme.space.md
  },
  thrLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.color.textSecondary,
    marginBottom: theme.space.sm
  },
  thrRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.space.sm,
    marginBottom: theme.space.md
  },
  chip: {
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.sm,
    borderRadius: 999,
    backgroundColor: theme.color.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.color.border
  },
  chipActive: {
    backgroundColor: theme.color.primary,
    borderColor: theme.color.primary
  },
  chipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.color.textSecondary
  },
  chipTextActive: {
    color: theme.color.textOnPrimary
  },
  thrInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.space.md,
    borderRadius: 999,
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.borderStrong
  },
  thrInput: {
    minWidth: ms(34),
    paddingVertical: theme.space.sm,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.color.text,
    textAlign: 'center'
  },
  thrPct: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.color.textMuted
  },
  searchBtnLast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    padding: theme.space.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.primarySoft,
    borderWidth: 1,
    borderColor: theme.color.border
  },
  searchEmoji: {
    fontSize: theme.fontSize.lg
  },
  searchTextCol: {
    flex: 1
  },
  searchTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '800',
    color: theme.color.primaryDark
  },
  searchSub: {
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted,
    marginTop: 1
  },
  list: {
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.md,
    paddingBottom: theme.space.lg,
    gap: theme.space.sm
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    padding: theme.space.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.color.border
  },
  tileIcon: {
    width: ms(38),
    height: ms(38),
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tileTextCol: {
    flex: 1,
    minWidth: 0
  },
  tileEmoji: {
    fontSize: theme.fontSize.md
  },
  tileTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '800',
    color: theme.color.text
  },
  tileSub: {
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted,
    marginTop: 2
  },
  badge: {
    minWidth: ms(24),
    height: ms(22),
    paddingHorizontal: theme.space.sm,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.space.sm
  },
  badgeText: {
    color: theme.color.textOnPrimary,
    fontSize: theme.fontSize.xs,
    fontWeight: '800'
  }
});
