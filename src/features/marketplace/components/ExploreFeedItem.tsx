import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import { useThemeTokens } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Alert, Dimensions, Pressable, StyleSheet, View } from 'react-native';
import {
  formatExplorePrice,
  type MockExploreItem,
} from '../data/mockExploreItems';
import { ExploreActionRail } from './ExploreActionRail';

const { height: windowHeight } = Dimensions.get('window');

type ExploreFeedItemProps = {
  item: MockExploreItem;
};

export function ExploreFeedItem({ item }: ExploreFeedItemProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const mediaGradient = theme.experience.mediaGradient ?? theme.experience.gradient;

  function handleOpenListing() {
    router.push({
      pathname: '/listing/[id]',
      params: { id: item.listingId },
    } as any);
  }

  function handlePurchaseNow() {
    handleOpenListing();
  }

  function handleArtworkPress() {
    handleOpenListing();
  }

  function handleMoreMetadata() {
    Alert.alert(
      'Beat details',
      `${item.genre ?? 'Beat'} - ${item.bpm ?? 'N/A'} BPM - ${item.key ?? 'N/A'}`
    );
  }

  return (
    <View style={styles.page}>
      <LinearGradient colors={mediaGradient} style={styles.media}>
        <View style={styles.blurOrb} />

        <Pressable style={styles.artwork} onPress={handleArtworkPress}>
          <AppText variant="title" style={styles.artworkText}>
            {item.artworkLabel ?? item.genre ?? 'Beat'}
          </AppText>
        </Pressable>

        <ExploreActionRail item={item} />

        <View style={styles.meta}>
          <AppText variant="title" style={styles.trackTitle}>
            {item.title}
          </AppText>

          <AppText variant="bodySmall" style={styles.artist}>
            {item.artist}
          </AppText>

          <View style={styles.priceRow}>
            <AppText variant="bodySmall" style={styles.currency}>
              {formatExplorePrice(item)}
            </AppText>

            <Pressable style={styles.purchaseButton} onPress={handlePurchaseNow}>
              <AppText variant="caption" style={styles.purchaseText}>
                Purchase Now
              </AppText>
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.moreMetaButton} onPress={handleMoreMetadata}>
          <AppIcon name="more" size="md" tone="inverse" stroke="bold" />
        </Pressable>
      </LinearGradient>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    page: {
      height: windowHeight,
      width: '100%',
      backgroundColor: theme.colors.background,
    },
    media: {
      flex: 1,
      marginHorizontal: 5,
      overflow: 'hidden',
    },
    blurOrb: {
      position: 'absolute',
      width: 265,
      height: 286,
      borderRadius: 143,
      left: '12%',
      top: '30%',
      backgroundColor: 'rgba(97,96,96,0.88)',
      opacity: 0.78,
      transform: [{ scale: 1.05 }],
    },
    artwork: {
      position: 'absolute',
      width: 135,
      height: 135,
      borderRadius: 68,
      left: '50%',
      top: '41%',
      marginLeft: -68,
      marginTop: -68,
      backgroundColor: theme.colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    artworkText: {
      color: '#FFFFFF',
      textAlign: 'center',
      paddingHorizontal: theme.spacing.sm,
    },
    meta: {
      position: 'absolute',
      left: theme.spacing.lg,
      right: 130,
      bottom: 124,
    },
    trackTitle: {
      color: '#FFFFFF',
      marginBottom: theme.spacing.xs,
    },
    artist: {
      color: '#FFFFFF',
      marginBottom: theme.spacing.sm,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    currency: {
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
    purchaseButton: {
      minHeight: 30,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.accent,
      paddingHorizontal: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    purchaseText: {
      color: '#FFFFFF',
    },
    moreMetaButton: {
      position: 'absolute',
      right: theme.spacing.xxl,
      bottom: 178,
      width: 42,
      height: 42,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
