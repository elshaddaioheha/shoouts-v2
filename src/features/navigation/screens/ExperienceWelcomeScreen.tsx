import type { AppExperience } from '@/src/features/access/access.types';
import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import type { AppIconKey } from '@/src/components/ui/appIcons';
import { useReducedMotion } from '@/src/hooks/use-reduced-motion';
import { experienceTokens, useThemeTokens } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type WelcomeConfig = {
  label: string;
  kicker: string;
  body: string;
  icon: AppIconKey;
};

const welcomeCopy: Record<AppExperience, WelcomeConfig> = {
  shoouts: {
    label: 'Shoouts',
    kicker: 'Marketplace mode',
    body: 'Discover music, inspect creators, and keep the buyer loop moving.',
    icon: 'market',
  },
  vault: {
    label: 'Vault',
    kicker: 'Private creator space',
    body: 'Capture ideas, organize drafts, and keep unfinished work protected.',
    icon: 'vault',
  },
  studio: {
    label: 'Studio',
    kicker: 'Seller workspace',
    body: 'Prepare listings, manage catalog state, and grow your storefront.',
    icon: 'studio',
  },
  hybrid: {
    label: 'Hybrid',
    kicker: 'Full creator workflow',
    body: 'Move from private drafts to public releases with Vault and Studio together.',
    icon: 'hybrid',
  },
};

export function ExperienceWelcomeScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const reduceMotion = useReducedMotion();
  const { experience: rawExperience, nextRoute } = useLocalSearchParams<{
    experience?: string;
    nextRoute?: string;
  }>();
  const experience = normalizeExperience(rawExperience);
  const config = welcomeCopy[experience];
  const token = experienceTokens[experience];
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(reduceMotion ? 1 : 0.94)).current;
  const translateY = useRef(new Animated.Value(reduceMotion ? 0 : 16)).current;
  const destination = typeof nextRoute === 'string' && nextRoute.length > 0
    ? nextRoute
    : '/(tabs)';

  useEffect(() => {
    const duration = reduceMotion ? 120 : 680;
    const holdDuration = reduceMotion ? 180 : 940;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace(destination as any);
    }, duration + holdDuration);

    return () => clearTimeout(timer);
  }, [destination, opacity, reduceMotion, scale, translateY]);

  return (
    <LinearGradient colors={token.gradient} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.orbOne} />
        <View style={styles.orbTwo} />

        <Animated.View
          style={[
            styles.card,
            {
              opacity,
              transform: [{ translateY }, { scale }],
            },
          ]}
        >
          <View style={styles.iconWrap}>
            <AppIcon name={config.icon} size="xl" tone="inverse" stroke="bold" />
          </View>

          <AppText variant="eyebrow" style={styles.kicker}>
            {config.kicker}
          </AppText>

          <AppText variant="pageHeading" style={styles.title}>
            Welcome to {config.label}
          </AppText>

          <AppText variant="body" style={styles.body}>
            {config.body}
          </AppText>

          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  transform: [
                    {
                      scaleX: opacity,
                    },
                  ],
                },
              ]}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function normalizeExperience(value: unknown): AppExperience {
  if (
    value === 'shoouts' ||
    value === 'vault' ||
    value === 'studio' ||
    value === 'hybrid'
  ) {
    return value;
  }

  return 'shoouts';
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    gradient: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
      overflow: 'hidden',
    },
    orbOne: {
      position: 'absolute',
      width: 280,
      height: 280,
      borderRadius: 140,
      top: -52,
      right: -88,
      backgroundColor: 'rgba(255,255,255,0.18)',
    },
    orbTwo: {
      position: 'absolute',
      width: 220,
      height: 220,
      borderRadius: 110,
      left: -74,
      bottom: 58,
      backgroundColor: 'rgba(0,0,0,0.16)',
    },
    card: {
      width: '100%',
      maxWidth: 420,
      borderRadius: theme.radius.xxl,
      backgroundColor: 'rgba(0,0,0,0.24)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.24)',
      padding: theme.spacing.xl,
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    iconWrap: {
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.24)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    kicker: {
      color: 'rgba(255,255,255,0.78)',
      textAlign: 'center',
    },
    title: {
      color: theme.colors.textOnMedia,
      textAlign: 'center',
    },
    body: {
      color: theme.colors.textOnMediaMuted,
      textAlign: 'center',
      lineHeight: 22,
    },
    progressTrack: {
      width: '100%',
      height: 4,
      borderRadius: theme.radius.pill,
      backgroundColor: 'rgba(255,255,255,0.2)',
      overflow: 'hidden',
      marginTop: theme.spacing.sm,
    },
    progressFill: {
      width: '100%',
      height: '100%',
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.textOnMedia,
      transformOrigin: 'left',
    },
  });
}
