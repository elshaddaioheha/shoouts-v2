import { AppText } from '@/src/components/ui/AppText';
import { useThemeTokens } from '@/src/theme';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ExploreFeedTab } from '../data/mockExploreItems';

type ExploreTabsProps = {
  activeTab: ExploreFeedTab;
  onChangeTab: (tab: ExploreFeedTab) => void;
};

const tabs: { key: ExploreFeedTab; label: string }[] = [
  { key: 'following', label: 'Following' },
  { key: 'forYou', label: 'For you' },
];

export function ExploreTabs({ activeTab, onChangeTab }: ExploreTabsProps) {
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, { top: insets.top + 56 }]}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            style={styles.tab}
            onPress={() => onChangeTab(tab.key)}
          >
            <AppText
              variant="title"
              style={[styles.label, active && styles.activeLabel]}
            >
              {tab.label}
            </AppText>
            {active ? <View style={styles.indicator} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      top: 96,
      left: 0,
      right: 0,
      zIndex: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 38,
    },
    tab: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 30,
    },
    label: {
      color: 'rgba(255,255,255,0.92)',
    },
    activeLabel: {
      color: '#FFFFFF',
    },
    indicator: {
      width: '100%',
      height: 3,
      marginTop: 2,
      borderRadius: theme.radius.pill,
      backgroundColor: '#FFFFFF',
    },
  });
}
