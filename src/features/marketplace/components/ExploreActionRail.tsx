import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import { useThemeTokens } from '@/src/theme';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import type { MockExploreItem } from '../data/mockExploreItems';

type ExploreActionRailProps = {
  item: MockExploreItem;
  bottomOffset?: number;
};

export function ExploreActionRail({
  item,
  bottomOffset = 188,
}: ExploreActionRailProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  function handleFollow() {
    Alert.alert('Follow coming soon', `Follow ${item.artist} later.`);
  }

  function handleLike() {
    Alert.alert(
      'Liked',
      'This will become a recommendation signal for the For You feed.'
    );
  }

  function handleShare() {
    Alert.alert('Share coming soon', 'Share links will be added later.');
  }

  return (
    <View style={[styles.container, { bottom: bottomOffset }]}>
      <Pressable style={styles.creatorButton} onPress={handleFollow}>
        <View style={styles.creatorAvatar}>
          <AppText variant="caption" style={styles.creatorInitial}>
            {item.artist.slice(0, 1).toUpperCase()}
          </AppText>
        </View>
        <View style={styles.plusBadge}>
          <AppText variant="caption" style={styles.plusText}>
            +
          </AppText>
        </View>
      </Pressable>

      <Pressable style={styles.action} onPress={handleLike}>
        <AppIcon name="like" size="xl" tone="inverse" stroke="bold" />
        <AppText variant="caption" style={styles.actionLabel}>
          {item.likes}
        </AppText>
      </Pressable>

      <Pressable style={styles.action} onPress={handleShare}>
        <AppIcon name="share" size="xl" tone="inverse" stroke="bold" />
        <AppText variant="caption" style={styles.actionLabel}>
          Share
        </AppText>
      </Pressable>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      right: theme.spacing.xxl,
      zIndex: 15,
      alignItems: 'center',
      gap: theme.spacing.xl,
    },
    creatorButton: {
      width: 52,
      height: 60,
      alignItems: 'center',
    },
    creatorAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    creatorInitial: {
      color: '#FFFFFF',
    },
    plusBadge: {
      position: 'absolute',
      bottom: 0,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    plusText: {
      color: '#FFFFFF',
      lineHeight: 14,
    },
    action: {
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    actionLabel: {
      color: '#FFFFFF',
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 1,
    },
  });
}
