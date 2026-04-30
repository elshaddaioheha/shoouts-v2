import { layout, useThemeTokens } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type HeaderWithGradientProps = {
  children: ReactNode;
  gradientHeight?: number;
};

function withAlpha(hexColor: string, alphaHex: string) {
  if (hexColor.startsWith('#') && hexColor.length === 7) {
    return `${hexColor}${alphaHex}`;
  }

  return hexColor;
}

export function HeaderWithGradient({
  children,
  gradientHeight = layout.headerGradientHeight,
}: HeaderWithGradientProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const fadeFrom = withAlpha(theme.colors.background, 'FF');
  const fadeMid = withAlpha(theme.colors.background, '96');
  const fadeTo = withAlpha(theme.colors.background, '00');

  return (
    <View style={styles.wrapper}>
      {children}
      <LinearGradient
        pointerEvents="none"
        colors={[fadeFrom, fadeMid, fadeTo]}
        style={[styles.fade, { height: gradientHeight, bottom: -gradientHeight + 2 }]}
      />
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    wrapper: {
      position: 'relative',
      zIndex: 20,
      backgroundColor: theme.colors.background,
    },
    fade: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: -14,
      height: layout.headerGradientHeight,
    },
  });
}
