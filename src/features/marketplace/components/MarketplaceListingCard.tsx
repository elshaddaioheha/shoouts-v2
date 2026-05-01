import { AppText } from '@/src/components/ui/AppText';
import type { MarketplaceListing } from '@/src/features/marketplace/marketplace.types';
import { useThemeTokens } from '@/src/theme';
import { Music2, Play, ShoppingCart } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { ListingArtwork } from './ListingArtwork';

type MarketplaceListingCardProps = {
  listing: MarketplaceListing;
  inCart: boolean;
  onOpen: () => void;
  onPreview: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
};

export function MarketplaceListingCard({
  listing,
  inCart,
  onOpen,
  onPreview,
  onAddToCart,
  onBuyNow,
}: MarketplaceListingCardProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const priceLabel = listing.price <= 0 ? 'Free' : `$${listing.price.toFixed(2)}`;
  const buyLabel = listing.price <= 0 ? 'Download later' : 'Buy now';

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.cardPressed : undefined,
      ]}
    >
      <ListingArtwork
        coverUrl={listing.coverUrl}
        label={listing.genre ?? 'Beat'}
        overlay={Boolean(listing.coverUrl)}
        style={styles.artwork}
      >
        <View style={styles.artworkBadge}>
          <Music2 size={20} color={theme.colors.accent} />
        </View>

        <View style={styles.artworkMeta}>
          <AppText
            variant="caption"
            tone={listing.coverUrl ? 'primary' : 'accent'}
            style={listing.coverUrl ? styles.artworkTextOnMedia : undefined}
            numberOfLines={1}
          >
            {listing.genre ?? 'Beat'}
          </AppText>

          <AppText
            variant="pageHeading"
            style={listing.coverUrl ? styles.artworkTextOnMedia : undefined}
            numberOfLines={2}
          >
            {listing.title}
          </AppText>
        </View>
      </ListingArtwork>

      <View style={styles.cardBody}>
        <View style={styles.titleBlock}>
          <AppText variant="bodySmall" tone="secondary" numberOfLines={1}>
            {listing.artist}
          </AppText>
        </View>

        <View style={styles.metaRow}>
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {listing.bpm ? `${listing.bpm} BPM` : 'Audio'}
          </AppText>

          <AppText variant="button" tone="accent" numberOfLines={1}>
            {priceLabel}
          </AppText>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed ? styles.secondaryButtonPressed : undefined,
            ]}
            onPress={(event) => {
              event.stopPropagation?.();
              onPreview();
            }}
          >
            <Play size={16} color={theme.colors.textPrimary} />
            <AppText variant="button">Preview</AppText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              inCart ? styles.disabledButton : undefined,
              pressed && !inCart ? styles.primaryButtonPressed : undefined,
            ]}
            onPress={(event) => {
              event.stopPropagation?.();
              onAddToCart();
            }}
            disabled={inCart}
          >
            <ShoppingCart size={16} color={theme.colors.textOnAccent} />
            <AppText variant="button" style={styles.primaryButtonText}>
              {inCart ? 'Added' : 'Add'}
            </AppText>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.buyButton,
            pressed ? styles.buyButtonPressed : undefined,
          ]}
          onPress={(event) => {
            event.stopPropagation?.();
            onBuyNow();
          }}
        >
          <AppText variant="button" tone="secondary">
            {buyLabel}
          </AppText>
        </Pressable>
      </View>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    card: {
      borderRadius: theme.radius.xxl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      overflow: 'hidden',
      ...theme.shadows.md,
    },
    cardPressed: {
      borderColor: theme.colors.accentBorder,
    },
    artwork: {
      minHeight: 210,
      backgroundColor: theme.colors.accentSoft,
      justifyContent: 'space-between',
      padding: theme.spacing.lg,
    },
    artworkBadge: {
      width: theme.layout.minTouchTarget,
      height: theme.layout.minTouchTarget,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-end',
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    artworkMeta: {
      gap: theme.spacing.sm,
      maxWidth: 420,
    },
    artworkTextOnMedia: {
      color: theme.colors.textOnMedia,
    },
    cardBody: {
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    titleBlock: {
      gap: theme.spacing.xs,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    secondaryButton: {
      flex: 1,
      minWidth: 120,
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
    },
    secondaryButtonPressed: {
      backgroundColor: theme.colors.surfacePressed,
    },
    primaryButton: {
      flex: 1,
      minWidth: 120,
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.accent,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
    },
    primaryButtonPressed: {
      backgroundColor: theme.colors.accentPressed,
    },
    primaryButtonText: {
      color: theme.colors.textOnAccent,
    },
    disabledButton: {
      backgroundColor: theme.colors.surfacePressed,
    },
    buyButton: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    buyButtonPressed: {
      backgroundColor: theme.colors.surfacePressed,
    },
  });
}
