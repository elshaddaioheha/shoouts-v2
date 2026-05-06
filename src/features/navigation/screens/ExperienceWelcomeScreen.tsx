import type { AppExperience } from '@/src/features/access/access.types';
import { AppText } from '@/src/components/ui/AppText';
import { appIcons, type AppIconKey } from '@/src/components/ui/appIcons';
import { useReducedMotion } from '@/src/hooks/use-reduced-motion';
import { experienceTokens, useThemeTokens } from '@/src/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type TransitionCopy = {
  label: string;
  badge: string;
  subtitle: string;
  iconName: AppIconKey;
};

const transitionCopy: Record<AppExperience, TransitionCopy> = {
  shoouts: {
    label: 'Shoouts',
    badge: 'Marketplace Mode',
    subtitle: 'Marketplace mode for discovery, buying, and fresh sounds.',
    iconName: 'market',
  },
  vault: {
    label: 'Vault',
    badge: 'Private Workspace',
    subtitle: 'Your private workspace for uploads, folders, and secure sharing.',
    iconName: 'vault',
  },
  studio: {
    label: 'Studio',
    badge: 'Seller Workspace',
    subtitle: 'Create, upload, and sell your music with focused creator tools.',
    iconName: 'studio',
  },
  hybrid: {
    label: 'Hybrid',
    badge: 'Unified Creator Mode',
    subtitle: 'A combined Vault and Studio workflow for end-to-end releases.',
    iconName: 'hybrid',
  },
};

const doodlePositions = [
  { top: '10%', left: '8%', size: 18, rotate: '-14deg', opacity: 0.13 },
  { top: '16%', left: '68%', size: 26, rotate: '18deg', opacity: 0.11 },
  { top: '28%', left: '30%', size: 22, rotate: '-8deg', opacity: 0.1 },
  { top: '38%', left: '80%', size: 20, rotate: '12deg', opacity: 0.08 },
  { top: '52%', left: '12%', size: 28, rotate: '-18deg', opacity: 0.09 },
  { top: '58%', left: '58%', size: 16, rotate: '6deg', opacity: 0.12 },
  { top: '70%', left: '76%', size: 24, rotate: '-10deg', opacity: 0.09 },
  { top: '78%', left: '38%', size: 20, rotate: '16deg', opacity: 0.08 },
] as const;

function withAlpha(hex: string, alphaHex: string) {
  if (hex.startsWith('#') && hex.length === 7) {
    return `${hex}${alphaHex}`;
  }
  return hex;
}

export function ExperienceWelcomeScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const reduceMotion = useReducedMotion();
  const { experience: rawExperience, nextRoute } = useLocalSearchParams<{
    experience?: string;
    nextRoute?: string;
  }>();

  const experience = normalizeExperience(rawExperience);
  const copy = transitionCopy[experience];
  const token = experienceTokens[experience];
  const modePalette = theme.isDark ? token.dark : token.light;
  const TransitionIcon = appIcons[copy.iconName];
  const destination =
    typeof nextRoute === 'string' && nextRoute.length > 0 ? nextRoute : '/(tabs)';

  const overlayAnim = useRef(new Animated.Value(0)).current;
  const welcomeSlideAnim = useRef(new Animated.Value(40)).current;
  const welcomeOpacityAnim = useRef(new Animated.Value(0)).current;
  const screenShiftAnim = useRef(new Animated.Value(18)).current;
  const screenScaleAnim = useRef(new Animated.Value(0.985)).current;

  useEffect(() => {
    overlayAnim.stopAnimation();
    welcomeSlideAnim.stopAnimation();
    welcomeOpacityAnim.stopAnimation();
    screenShiftAnim.stopAnimation();
    screenScaleAnim.stopAnimation();

    if (reduceMotion) {
      overlayAnim.setValue(1);
      welcomeSlideAnim.setValue(0);
      welcomeOpacityAnim.setValue(1);
      screenShiftAnim.setValue(0);
      screenScaleAnim.setValue(1);
    } else {
      overlayAnim.setValue(0);
      welcomeSlideAnim.setValue(40);
      welcomeOpacityAnim.setValue(0);
      screenShiftAnim.setValue(18);
      screenScaleAnim.setValue(0.985);

      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(welcomeSlideAnim, {
          toValue: 0,
          duration: 540,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(welcomeOpacityAnim, {
          toValue: 1,
          duration: 480,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(screenShiftAnim, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(screenScaleAnim, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }

    const exitDelay = reduceMotion ? 260 : 1280;
    const timer = setTimeout(() => {
      router.replace(destination as any);
    }, exitDelay);

    return () => clearTimeout(timer);
  }, [
    destination,
    overlayAnim,
    reduceMotion,
    screenScaleAnim,
    screenShiftAnim,
    welcomeOpacityAnim,
    welcomeSlideAnim,
  ]);

  const contentTranslateX = welcomeSlideAnim.interpolate({
    inputRange: [0, 40],
    outputRange: [0, -40],
  });
  const blurGhostTranslate = welcomeSlideAnim.interpolate({
    inputRange: [0, 40],
    outputRange: [0, -16],
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.overlay,
        Platform.OS === 'web' ? ({ pointerEvents: 'none' } as any) : null,
        {
          opacity: overlayAnim,
          backgroundColor: modePalette.background,
          transform: [{ translateX: screenShiftAnim }, { scale: screenScaleAnim }],
        },
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        {doodlePositions.map((doodle, index) => (
          <Animated.View
            key={`${experience}-doodle-${index}`}
            style={[
              styles.doodleWrap,
              {
                top: doodle.top as any,
                left: doodle.left as any,
                opacity: welcomeOpacityAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, doodle.opacity],
                }),
                transform: [
                  { translateX: contentTranslateX },
                  { rotate: doodle.rotate },
                  {
                    scale: welcomeOpacityAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.82, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <TransitionIcon
              size={doodle.size}
              color={token.accent}
              strokeWidth={1.8}
            />
          </Animated.View>
        ))}

        <Animated.View
          style={[
            styles.accentGraphic,
            {
              transform: [{ translateX: contentTranslateX }],
              opacity: welcomeOpacityAnim,
            },
          ]}
        >
          <View style={[styles.accentHalo, { backgroundColor: withAlpha(token.accent, '1A') }]} />
          <View style={[styles.accentRingOuter, { borderColor: withAlpha(token.accent, '30') }]} />
          <View style={[styles.accentRingInner, { borderColor: withAlpha(token.accent, '45') }]} />
          <View style={[styles.accentCore, { backgroundColor: token.accent }]}>
            <TransitionIcon size={40} color="#FFFFFF" strokeWidth={2.2} />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.motionGhostBlock,
            {
              opacity: welcomeOpacityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.14],
              }),
              transform: [{ translateX: blurGhostTranslate }],
            },
          ]}
        >
          <AppText variant="body" style={[styles.motionGhostLabel, { color: token.accent }]}>
            Welcome to
          </AppText>
          <AppText variant="pageHeading" style={[styles.motionGhostMode, { color: token.accent }]}>
            {copy.label}
          </AppText>
        </Animated.View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: welcomeOpacityAnim,
              transform: [{ translateX: contentTranslateX }],
            },
          ]}
        >
          <View
            style={[
              styles.badge,
              {
                borderColor: withAlpha(token.accent, '2A'),
                backgroundColor: withAlpha(token.accent, '12'),
              },
            ]}
          >
            <View style={[styles.badgeDot, { backgroundColor: token.accent }]} />
            <AppText variant="caption" style={[styles.badgeText, { color: token.accent }]}>
              {copy.badge}
            </AppText>
          </View>

          <View style={styles.textBlock}>
            <AppText variant="body" tone="secondary" style={styles.welcomeLabel}>
              Welcome to
            </AppText>
            <AppText variant="pageHeading" style={styles.welcomeMode}>
              {copy.label}
            </AppText>
            <AppText variant="body" tone="secondary" style={styles.welcomeSubtitle}>
              {copy.subtitle}
            </AppText>
          </View>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

function normalizeExperience(value: unknown): AppExperience {
  if (value === 'shoouts' || value === 'vault' || value === 'studio' || value === 'hybrid') {
    return value;
  }

  return 'shoouts';
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    overlay: {
      zIndex: 99999,
      elevation: 99999,
      overflow: 'hidden',
    },
    safeArea: {
      flex: 1,
      overflow: 'hidden',
    },
    doodleWrap: {
      position: 'absolute',
    },
    accentGraphic: {
      position: 'absolute',
      top: Math.max(theme.spacing.xl * 2, screenHeight * 0.11),
      right: -34,
      width: screenWidth * 0.72,
      height: screenWidth * 0.72,
      alignItems: 'center',
      justifyContent: 'center',
    },
    accentHalo: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: 999,
      opacity: 0.55,
    },
    accentRingOuter: {
      position: 'absolute',
      width: '78%',
      height: '78%',
      borderRadius: 999,
      borderWidth: 1,
    },
    accentRingInner: {
      position: 'absolute',
      width: '58%',
      height: '58%',
      borderRadius: 999,
      borderWidth: 1,
    },
    accentCore: {
      width: 96,
      height: 96,
      borderRadius: theme.radius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: 0.12,
      shadowRadius: 30,
      elevation: 10,
    },
    motionGhostBlock: {
      position: 'absolute',
      left: theme.spacing.lg,
      bottom: theme.spacing.xxxl + 22,
    },
    motionGhostLabel: {
      marginBottom: theme.spacing.xs,
      letterSpacing: 0.2,
    },
    motionGhostMode: {
      fontSize: 52,
      lineHeight: 58,
      letterSpacing: -1.2,
    },
    content: {
      position: 'absolute',
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      bottom: theme.spacing.xxxl,
      maxWidth: screenWidth * 0.74,
    },
    badge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      paddingHorizontal: theme.spacing.sm + 4,
      paddingVertical: theme.spacing.xs + 2,
      marginBottom: theme.spacing.md,
    },
    badgeDot: {
      width: 8,
      height: 8,
      borderRadius: 999,
      marginRight: theme.spacing.xs + 2,
    },
    badgeText: {
      letterSpacing: 0.15,
    },
    textBlock: {
      maxWidth: screenWidth * 0.67,
    },
    welcomeLabel: {
      marginBottom: theme.spacing.xs,
      letterSpacing: 0.2,
    },
    welcomeMode: {
      fontSize: 52,
      lineHeight: 58,
      letterSpacing: -1.2,
    },
    welcomeSubtitle: {
      lineHeight: 23,
      marginTop: theme.spacing.sm,
    },
  });
}
