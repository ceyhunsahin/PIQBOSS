import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useTDash } from '@/lib/i18n';
import { ms } from '@/lib/responsive';
import { theme } from '@/lib/theme';
import { emptyLabel } from '@/lib/uiText';
import { loadOffCustomerSearch, type OffCustomerSearchRow } from '../fetchOffLists';

type Props = {
  visible: boolean;
  serverUrl: string | null;
  onClose: () => void;
  onSelect: (item: OffCustomerSearchRow) => void;
};

export const CustomerSearchSheet = memo(function CustomerSearchSheet({ visible, serverUrl, onClose, onSelect }: Props)
{
  const { t } = useTranslation();
  const dash = useTDash();
  const dl = (key: string): string => t(`dashboardOff.${key}`);
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<OffCustomerSearchRow[]>([]);
  const [searched, setSearched] = useState(false);
  useEffect(() =>
  {
    if(!visible || results.length > 0)
    {
      return;
    }
    const timer = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(timer);
  }, [visible, results.length]);
  const runSearch = useCallback(async () =>
  {
    const term = text.trim();
    if(!serverUrl || term.length === 0)
    {
      return;
    }
    setBusy(true);
    setSearched(true);
    try
    {
      const rows = await loadOffCustomerSearch(serverUrl, term);
      setResults(rows);
    }
    catch
    {
      setResults([]);
    }
    finally
    {
      setBusy(false);
    }
  }, [serverUrl, text]);
  useEffect(() =>
  {
    const term = text.trim();
    if(term.length < 2)
    {
      setResults([]);
      setSearched(false);
      return;
    }
    if(!visible || !serverUrl)
    {
      return;
    }
    const timer = setTimeout(() =>
    {
      setBusy(true);
      setSearched(true);
      loadOffCustomerSearch(serverUrl, term)
        .then((rows) => setResults(rows))
        .catch(() => setResults([]))
        .finally(() => setBusy(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [text, visible, serverUrl]);
  return (
    <BottomSheet visible={visible} title={dl('customerSearch')} subtitle={dl('customer')} onClose={onClose}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={ms(16)} color={theme.color.textMuted} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={dl('customerSearchPlaceholder')}
          placeholderTextColor={theme.color.textMuted}
          returnKeyType="search"
          onSubmitEditing={() => void runSearch()}
          autoFocus
        />
        <Pressable style={styles.searchBtn} onPress={() => void runSearch()} hitSlop={6}>
          <Ionicons name="arrow-forward" size={ms(16)} color={theme.color.textOnPrimary} />
        </Pressable>
      </View>
      {busy ?
        <ActivityIndicator style={styles.loader} color={theme.color.primary} /> : null}
      {!busy && searched && results.length === 0 ?
        <Text style={styles.empty}>{dash('noData')}</Text> : null}
      {!busy && results.length > 0 ?
        (
          <View style={styles.list}>
            <Text style={styles.listHead}>{dl('customerSearchResults')}</Text>
            {results.map((item, index) =>
            (
              <Pressable
                key={`${item.code || index}`}
                style={({ pressed }) => [styles.row, index === results.length - 1 && styles.rowLast, pressed && styles.rowPressed]}
                onPress={() => onSelect(item)}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.rowLabel} numberOfLines={2}>{item.name || emptyLabel()}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>{`${item.code}${item.phone ? ` · ${item.phone}` : ''}`.trim()}</Text>
                </View>
                <Ionicons name="chevron-forward" size={ms(14)} color={theme.color.textMuted} />
              </Pressable>
            ))}
          </View>
        ) : null}
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    backgroundColor: theme.color.surfaceMuted,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.xs
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.body,
    color: theme.color.text,
    paddingVertical: theme.space.sm
  },
  searchBtn: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: theme.color.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loader: {
    marginTop: theme.space.lg
  },
  empty: {
    marginTop: theme.space.lg,
    fontSize: theme.fontSize.sm,
    color: theme.color.textMuted
  },
  list: {
    marginTop: theme.space.lg,
    backgroundColor: theme.color.surfaceMuted,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    overflow: 'hidden'
  },
  listHead: {
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
    color: theme.color.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    paddingHorizontal: theme.space.md,
    paddingTop: theme.space.md,
    paddingBottom: theme.space.sm
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.md,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.color.border,
    backgroundColor: theme.color.surface
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
    marginTop: 2
  }
});
