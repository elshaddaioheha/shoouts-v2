import { AppText } from '@/src/components/ui/AppText';
import { useThemeTokens } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import {
  formatExplorePrice,
  type ExploreFeedItemModel,
} from '../marketplace.types';
import { ExploreActionRail } from './ExploreActionRail';
import { ListingArtwork } from './ListingArtwork';

const ARTWORK_SIZE = 140;
const ARTWORK_RADIUS = ARTWORK_SIZE / 2;
const ARTWORK_CENTER_OFFSET = 10;
const BLUR_ORB_CENTER_OFFSET = -6;
const DISC_WIDTH = 265;
const DISC_HEIGHT = 286;

type ExploreFeedItemProps = {
  item: ExploreFeedItemModel;
  pageHeight: number;
};

export function ExploreFeedItem({ item, pageHeight }: ExploreFeedItemProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme, pageHeight);
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
        <View style={styles.blurOrbAnchor}>
          <View style={styles.blurOrb} />
        </View>

        <View style={styles.artworkAnchor}>
          <Pressable style={styles.artworkPressable} onPress={handleArtworkPress}>
            <ListingArtwork
              coverUrl={item.coverUrl}
              label={item.artworkLabel ?? item.genre ?? 'Beat'}
              overlay={Boolean(item.coverUrl)}
              style={styles.artwork}
            >
              {item.coverUrl ? (
                <View style={styles.artworkPill}>
                  <AppText variant="caption" style={styles.artworkPillText}>
                    {item.genre ?? 'Beat'}
                  </AppText>
                </View>
              ) : null}
            </ListingArtwork>
          </Pressable>
        </View>

        <ExploreActionRail
          item={item}
          bottomOffset={104}
          onMorePress={handleMoreMetadata}
        />

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
      </LinearGradient>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>, pageHeight: number) {
  return StyleSheet.create({
    page: {
      height: pageHeight,
      width: '100%',
      backgroundColor: theme.colors.background,
    },
    media: {
      flex: 1,
      overflow: 'hidden',
    },
    blurOrbAnchor: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 0,
      height: 0,
      transform: [{ translateY: BLUR_ORB_CENTER_OFFSET }],
    },
    blurOrb: {
      position: 'absolute',
      width: DISC_WIDTH,
      height: DISC_HEIGHT,
      borderRadius: 143,
      left: -(DISC_WIDTH / 2),
      top: -(DISC_HEIGHT / 2),
      backgroundColor: 'rgba(97,96,96,0.88)',
      opacity: 0.78,
      transform: [{ scale: 1.05 }],
    },
    artworkAnchor: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 0,
      height: 0,
      transform: [{ translateY: ARTWORK_CENTER_OFFSET }],
    },
    artworkPressable: {
      position: 'absolute',
      width: ARTWORK_SIZE,
      height: ARTWORK_SIZE,
      borderRadius: ARTWORK_RADIUS,
      left: -ARTWORK_RADIUS,
      top: -ARTWORK_RADIUS,
    },
    artwork: {
      width: '100%',
      height: '100%',
      borderRadius: ARTWORK_RADIUS,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    artworkPill: {
      position: 'absolute',
      left: theme.spacing.sm,
      right: theme.spacing.sm,
      bottom: theme.spacing.sm,
      minHeight: 24,
      borderRadius: theme.radius.pill,
      backgroundColor: 'rgba(0,0,0,0.42)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.sm,
    },
    artworkPillText: {
      color: theme.colors.textOnMedia,
      textAlign: 'center',
    },
    meta: {
      position: 'absolute',
      left: theme.spacing.lg,
      right: 116,
      bottom: 112,
    },
    trackTitle: {
      color: theme.colors.textOnMedia,
      marginBottom: theme.spacing.xs,
    },
    artist: {
      color: theme.colors.textOnMedia,
      marginBottom: theme.spacing.sm,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    currency: {
      color: theme.colors.textOnMedia,
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
      color: theme.colors.textOnAccent,
    },
  });
}
