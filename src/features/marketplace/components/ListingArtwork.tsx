import { AppText } from '@/src/components/ui/AppText';
import { useThemeTokens } from '@/src/theme';
import { ReactNode } from 'react';
import {
  ImageBackground,
  type ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

type ListingArtworkProps = {
  coverUrl?: string | null;
  fallbackColor?: string;
  label?: string | null;
  overlay?: boolean;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  children?: ReactNode;
};

export function ListingArtwork({
  coverUrl,
  fallbackColor,
  label,
  overlay = false,
  style,
  imageStyle,
  children,
}: ListingArtworkProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme, fallbackColor);
  const content =
    children !== undefined && children !== null ? (
      children
    ) : (
      <View style={styles.fallbackContent}>
        <AppText variant="title" style={styles.fallbackText} numberOfLines={2}>
          {label ?? 'Music'}
        </AppText>
      </View>
    );

  if (coverUrl) {
    return (
      <ImageBackground
        source={{ uri: coverUrl }}
        resizeMode="cover"
        style={[styles.frame, style]}
        imageStyle={imageStyle}
      >
        {overlay ? <View style={styles.overlay} /> : null}
        {content}
      </ImageBackground>
    );
  }

  return <View style={[styles.frame, style]}>{content}</View>;
}

function createStyles(
  theme: ReturnType<typeof useThemeTokens>,
  fallbackColor?: string
) {
  return StyleSheet.create({
    frame: {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: fallbackColor ?? theme.colors.accentSoft,
    },
    fallbackContent: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.sm,
    },
    fallbackText: {
      color: theme.colors.textOnMedia,
      textAlign: 'center',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.28)',
    },
  });
}
