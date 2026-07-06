import { memo } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OFF_TABS } from '@/features/boss-off/config/offTabs';
import type { OffTabId } from '@/lib/offTabStore';
import { ms } from '@/lib/responsive';
import { theme } from '@/lib/theme';

type Props = {
  active: OffTabId;
  onChange: (id: OffTabId) => void;
};

export const OffTabBar = memo(function OffTabBar({ active, onChange }: Props)
{
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, theme.space.sm) }]}>
      {OFF_TABS.map((tab) =>
      {
        const isActive = tab.id === active;
        const icon = (isActive ? tab.iconFilled : tab.iconOutline) as keyof typeof Ionicons.glyphMap;
        return (
          <Pressable key={tab.id} style={styles.item} onPress={() => onChange(tab.id)} hitSlop={6}>
            {isActive ?
              (
                <LinearGradient
                  colors={theme.gradient.royal}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.iconWrap, styles.iconWrapActive]}
                >
                  <Ionicons name={icon} size={ms(22)} color={theme.color.textOnPrimary} />
                </LinearGradient>
              ) :
              (
                <View style={styles.iconWrap}>
                  <Ionicons name={icon} size={ms(22)} color={theme.color.textMuted} />
                </View>
              )}
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: theme.space.sm,
    paddingHorizontal: theme.space.xs,
    backgroundColor: theme.color.surface,
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
    ...theme.shadow.card
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconWrap: {
    width: ms(46),
    height: ms(36),
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconWrapActive: {
    ...theme.shadow.glow
  }
});
