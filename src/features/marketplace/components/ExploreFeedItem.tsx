import { AppText } from '@/src/components/ui/AppText';
import { useThemeTokens } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { memo } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import {
  formatExplorePrice,
  type ExploreFeedItemModel,
} from '../marketplace.types';
import { ExploreActionRail } from './ExploreActionRail';
import { ListingArtwork } from './ListingArtwork';

const ARTWORK_SIZE = 140;
const ARTWORK_RADIUS = ARTWORK_SIZE / 2;
const DISC_SIZE = 248;
const DISC_RADIUS = DISC_SIZE / 2;
const DISC_SCALE = 1.06;
const DISC_CENTER_OFFSET = 10;

type ExploreFeedItemProps = {
  item: ExploreFeedItemModel;
  pageHeight: number;
};

function ExploreFeedItem({ item, pageHeight }: ExploreFeedItemProps) {
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
      'Track details',
      `${item.genre ?? 'Track'} - ${item.bpm ?? 'N/A'} BPM - ${item.key ?? 'N/A'}`
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
              label={item.artworkLabel ?? item.genre ?? 'Track'}
              overlay={Boolean(item.coverUrl)}
              style={styles.artwork}
            >
              {item.coverUrl ? (
                <View style={styles.artworkPill}>
                  <AppText variant="caption" style={styles.artworkPillText}>
                    {item.genre ?? 'Track'}
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
                Review Purchase
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
      transform: [{ translateY: DISC_CENTER_OFFSET }],
    },
    blurOrb: {
      position: 'absolute',
      width: DISC_SIZE,
      height: DISC_SIZE,
      borderRadius: DISC_RADIUS,
      left: -DISC_RADIUS,
      top: -DISC_RADIUS,
      backgroundColor: 'rgba(97,96,96,0.88)',
      opacity: 0.78,
      transform: [{ scale: DISC_SCALE }],
    },
    artworkAnchor: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 0,
      height: 0,
      transform: [{ translateY: DISC_CENTER_OFFSET }],
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

export const MemoExploreFeedItem = memo(
  ExploreFeedItem,
  (previous, next) =>
    previous.pageHeight === next.pageHeight &&
    previous.item.id === next.item.id &&
    previous.item.coverUrl === next.item.coverUrl &&
    previous.item.title === next.item.title &&
    previous.item.artist === next.item.artist &&
    previous.item.price === next.item.price &&
    previous.item.currency === next.item.currency &&
    previous.item.audioUrl === next.item.audioUrl &&
    previous.item.genre === next.item.genre &&
    previous.item.bpm === next.item.bpm &&
    previous.item.key === next.item.key
);

export { ExploreFeedItem };
