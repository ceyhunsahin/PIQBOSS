import { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { MarginGroupRow, VatRateRow } from '@piqboss/shared';
import { FadeInView } from '@/components/ui/FadeInView';
import { formatCurrency, formatNumber, formatPercent, formatQuantity } from '@/lib/format';
import { useTDash } from '@/lib/i18n';
import { f, ms } from '@/lib/responsive';
import { textSharp } from '@/lib/typography';
import { theme } from '@/lib/theme';

type Props = {
  margins: MarginGroupRow[];
  vat: VatRateRow[];
  unsoldGroups: number;
};

const GRAD: [string, string] = ['#667EEA', '#764BA2'];

export const MarginSummaryCard = memo(function MarginSummaryCard({ margins, vat, unsoldGroups }: Props)
{
  const dash = useTDash();
  const summary = useMemo(() =>
  {
    const totalCost = margins.reduce((acc, r) => acc + (r.cost || 0), 0);
    const totalSales = margins.reduce((acc, r) => acc + (r.sales || 0), 0);
    const totalMargin = margins.reduce((acc, r) => acc + (r.margin || 0), 0);
    const totalTVA = vat.reduce((acc, r) => acc + (r.vat || 0), 0);
    const marginPercent = totalCost > 0 ? (totalMargin / totalCost) * 100 : 0;
    return { totalCost, totalSales, totalMargin, totalTVA, marginPercent, totalTTC: totalSales + totalTVA };
  }, [margins, vat]);
  const soldGroups = margins.length;
  const totalGroups = soldGroups + (unsoldGroups || 0);
  return (
    <FadeInView offset={14} duration={360} style={styles.wrap}>
      <LinearGradient colors={GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <Text style={[textSharp, styles.title]}>📊 {dash('totalMarginSummary')}</Text>
        <View style={styles.ttcBox}>
          <View style={styles.ttcRow}>
            <Text style={[textSharp, styles.ttcLabel]}>💵 {dash('totalSalesTTC')}</Text>
            <Text style={[textSharp, styles.ttcValue]}>{formatCurrency(summary.totalTTC)}</Text>
          </View>
          {vat.map((v, idx) =>
          (
            <View key={`${v.rate}-${idx}`} style={styles.vatRow}>
              <Text style={[textSharp, styles.vatLabel]}>🧾 TVA {formatQuantity(v.rate)}%</Text>
              <Text style={[textSharp, styles.vatValue]}>{formatCurrency(v.vat)}</Text>
            </View>
          ))}
          {vat.length > 0 ?
            <View style={styles.totalVatRow}>
              <Text style={[textSharp, styles.ttcLabel]}>🧾 {dash('totalVAT')}</Text>
              <Text style={[textSharp, styles.ttcValue]}>{formatCurrency(summary.totalTVA)}</Text>
            </View> : null}
        </View>
        <View style={styles.grid}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>💰</Text>
            <View style={styles.statMain}>
              <Text style={[textSharp, styles.statLabel]} numberOfLines={1}>{dash('totalCost')}</Text>
              <Text style={[textSharp, styles.statValue]} numberOfLines={1}>{formatCurrency(summary.totalCost)}</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>💵</Text>
            <View style={styles.statMain}>
              <Text style={[textSharp, styles.statLabel]} numberOfLines={1}>{dash('totalSalesBox')}</Text>
              <Text style={[textSharp, styles.statValue]} numberOfLines={1}>{formatCurrency(summary.totalSales)}</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>📈</Text>
            <View style={styles.statMain}>
              <Text style={[textSharp, styles.statLabel]} numberOfLines={1}>{dash('totalMargin')}</Text>
              <Text style={[textSharp, styles.statValue]} numberOfLines={1}>{formatCurrency(summary.totalMargin)}</Text>
            </View>
          </View>
          <View style={[styles.statBox, styles.statBoxStrong]}>
            <Text style={styles.statIcon}>📊</Text>
            <View style={styles.statMain}>
              <Text style={[textSharp, styles.statLabel]} numberOfLines={1}>{dash('marginPercent')}</Text>
              <Text style={[textSharp, styles.statValue]} numberOfLines={1}>{formatPercent(summary.marginPercent)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.groupsBox}>
          <Text style={styles.statIcon}>🔢</Text>
          <View style={styles.groupsMain}>
            <View style={styles.groupCol}>
              <Text style={[textSharp, styles.groupLabel]}>{dash('totalAllGroups')}</Text>
              <Text style={[textSharp, styles.groupValue]}>{formatNumber(totalGroups)}</Text>
            </View>
            <View style={[styles.groupCol, styles.groupColDivider]}>
              <Text style={[textSharp, styles.groupLabel]}>{dash('soldGroups')}</Text>
              <Text style={[textSharp, styles.groupValue, { color: '#5AFF07' }]}>{formatNumber(soldGroups)}</Text>
            </View>
            <View style={[styles.groupCol, styles.groupColDivider]}>
              <Text style={[textSharp, styles.groupLabel]}>{dash('unsoldGroups')}</Text>
              <Text style={[textSharp, styles.groupValue, { color: theme.color.accentLight }]}>{formatNumber(unsoldGroups || 0)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </FadeInView>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: theme.space.lg,
    marginBottom: theme.space.md
  },
  card: {
    borderRadius: theme.radius.md,
    padding: theme.space.md,
    ...theme.shadow.card
  },
  title: {
    color: theme.color.textOnInk,
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    marginBottom: theme.space.sm
  },
  ttcBox: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: theme.radius.sm,
    padding: theme.space.sm,
    marginBottom: theme.space.sm
  },
  ttcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.space.xs
  },
  ttcLabel: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    flexShrink: 1
  },
  ttcValue: {
    color: theme.color.textOnInk,
    fontSize: theme.fontSize.body,
    fontWeight: '900'
  },
  vatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: ms(8),
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255,255,255,0.3)',
    marginBottom: ms(5)
  },
  vatLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    flexShrink: 1
  },
  vatValue: {
    color: theme.color.textOnInk,
    fontSize: theme.fontSize.sm,
    fontWeight: '700'
  },
  totalVatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.space.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space.sm
  },
  statBox: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: ms(130),
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.space.sm,
    paddingVertical: theme.space.sm
  },
  statBoxStrong: {
    backgroundColor: 'rgba(255,255,255,0.22)'
  },
  statIcon: {
    fontSize: f(18)
  },
  statMain: {
    flex: 1,
    minWidth: 0
  },
  statLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: theme.fontSize.xs,
    fontWeight: '600'
  },
  statValue: {
    color: theme.color.textOnInk,
    fontSize: theme.fontSize.body,
    fontWeight: '900',
    marginTop: 2
  },
  groupsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.space.sm,
    paddingVertical: theme.space.sm,
    marginTop: theme.space.sm
  },
  groupsMain: {
    flex: 1,
    flexDirection: 'row'
  },
  groupCol: {
    flex: 1
  },
  groupColDivider: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.3)',
    paddingLeft: theme.space.sm
  },
  groupLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: theme.fontSize.xs,
    fontWeight: '600'
  },
  groupValue: {
    color: theme.color.textOnInk,
    fontSize: theme.fontSize.md,
    fontWeight: '900',
    marginTop: 2
  }
});
