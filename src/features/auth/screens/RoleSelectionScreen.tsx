import type { UserRole } from '@/src/features/access/access.types';
import { useAccountStore } from '@/src/features/account/account.store';
import { useAppTheme } from '@/src/hooks/use-app-theme';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CheckCircle, ChevronRight, Zap, Lock, Music, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// Role definitions with basic metadata
const ROLE_OPTIONS: {
  id: UserRole;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  colors: { primary: string; gradient: [string, string]; accent: string };
  features: string[];
}[] = [
  {
    id: 'shoouts',
    title: 'Shoouts',
    subtitle: 'For everyone',
    description: 'Create and share voice content with ease',
    icon: <Sparkles size={28} color="#EC5C39" />,
    colors: {
      primary: '#EC5C39',
      gradient: ['#EC5C39', '#D32626'] as [string, string],
      accent: '#EC5C39',
    },
    features: ['Create shoouts', 'Share with friends', 'Basic library'],
  },
  {
    id: 'vault',
    title: 'Vault',
    subtitle: 'For creators',
    description: 'Store and organize unlimited voice content',
    icon: <Lock size={28} color="#9333EA" />,
    colors: {
      primary: '#9333EA',
      gradient: ['#9333EA', '#7E22CE'] as [string, string],
      accent: '#9333EA',
    },
    features: ['Unlimited storage', 'Advanced organization', 'Private vault'],
  },
  {
    id: 'studio',
    title: 'Studio',
    subtitle: 'For producers',
    description: 'Professional audio creation and production tools',
    icon: <Music size={28} color="#0EA5E9" />,
    colors: {
      primary: '#0EA5E9',
      gradient: ['#0EA5E9', '#0284C7'] as [string, string],
      accent: '#0EA5E9',
    },
    features: ['Audio editing', 'Effects & mixing', 'Export options'],
  },
  {
    id: 'hybrid',
    title: 'Hybrid',
    subtitle: 'For power users',
    description: 'Vault + Studio combined for complete control',
    icon: <Zap size={28} color="#F59E0B" />,
    colors: {
      primary: '#F59E0B',
      gradient: ['#F59E0B', '#FBBF24'] as [string, string],
      accent: '#F59E0B',
    },
    features: ['Full Vault access', 'Studio tools', 'Everything included'],
  },
];

export function RoleSelectionScreen() {
  const appTheme = useAppTheme();
  const router = useRouter();
  const setRole = useAccountStore((state) => state.setRole);

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headerProgress = useSharedValue(0);
  const buttonProgress = useSharedValue(0);
  const pulseProgress = useSharedValue(1);

  useEffect(() => {
    headerProgress.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    buttonProgress.value = withDelay(
      800,
      withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [buttonProgress, headerProgress]);

  useEffect(() => {
    if (selectedRole) {
      pulseProgress.value = withSequence(
        withTiming(1.05, { duration: 150, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) })
      );
    }
  }, [pulseProgress, selectedRole]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerProgress.value,
    transform: [{ translateY: interpolate(headerProgress.value, [0, 1], [-30, 0]) }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonProgress.value,
    transform: [{ translateY: interpolate(buttonProgress.value, [0, 1], [20, 0]) }],
  }));

  const backgroundCircleStyle = useAnimatedStyle(() => ({
    opacity: headerProgress.value,
  }));

  const handleRolePress = (roleId: UserRole) => {
    if (isSubmitting) return;
    setSelectedRole(roleId);
    Haptics.selectionAsync().catch(() => null);
  };

  const handleContinue = async () => {
    if (!selectedRole || isSubmitting) return;

    setIsSubmitting(true);
    try {
      setRole(selectedRole);
      router.replace('/');
    } catch {
      // Silently fail for now; role was set locally
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTier = ROLE_OPTIONS.find((role) => role.id === selectedRole);

  return (
    <View style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      <StatusBar barStyle={appTheme.isDark ? 'light-content' : 'dark-content'} />

      {/* Background decorative circles */}
      <Animated.View
        style={[
          styles.bgCircle1,
          backgroundCircleStyle,
          { backgroundColor: appTheme.isDark ? 'rgba(236, 92, 57, 0.04)' : 'rgba(236, 92, 57, 0.08)' },
        ]}
      />
      <Animated.View
        style={[
          styles.bgCircle2,
          backgroundCircleStyle,
          { backgroundColor: appTheme.isDark ? 'rgba(147, 51, 234, 0.03)' : 'rgba(147, 51, 234, 0.06)' },
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Text style={[styles.title, { color: appTheme.colors.textPrimary }]}>How will you use{'\n'}Shoouts?</Text>
          <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]}>
            Choose your experience. You can always change this later.
          </Text>
        </Animated.View>

        {/* Selected Tier Preview */}
        {selectedTier && (
          <View style={styles.selectedWelcomeWrap}>
            <LinearGradient
              colors={selectedTier.colors.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.selectedWelcomeGradient,
                {
                  borderColor: `${selectedTier.colors.accent}44`,
                  backgroundColor: appTheme.isDark ? 'rgba(20, 15, 16, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                },
              ]}
            >
              <View style={styles.selectedWelcomeHeader}>
                <View
                  style={[
                    styles.selectedWelcomeBadge,
                    { backgroundColor: `${selectedTier.colors.accent}22` },
                  ]}
                >
                  <Text style={[styles.selectedWelcomeBadgeText, { color: selectedTier.colors.accent }]}>
                    Selected Experience
                  </Text>
                </View>
                <Text style={[styles.selectedWelcomeTitle, { color: appTheme.colors.textPrimary }]}>
                  {selectedTier.title}
                </Text>
                <Text
                  style={[
                    styles.selectedWelcomeLine,
                    { color: appTheme.isDark ? 'rgba(255,255,255,0.82)' : 'rgba(23,18,19,0.72)' },
                  ]}
                >
                  {selectedTier.description}
                </Text>
              </View>

              {/* Selected Hero Card */}
              <View
                style={[
                  styles.selectedHeroCard,
                  {
                    borderColor: `${selectedTier.colors.accent}55`,
                    backgroundColor: appTheme.isDark ? 'rgba(20,15,16,0.34)' : 'rgba(255,255,255,0.56)',
                  },
                ]}
              >
                <View
                  style={[
                    styles.selectedHeroBackdrop,
                    {
                      backgroundColor: appTheme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(23,18,19,0.05)',
                    },
                  ]}
                />
                <View
                  style={[
                    styles.selectedHeroOrb,
                    {
                      backgroundColor: `${selectedTier.colors.accent}20`,
                      borderColor: `${selectedTier.colors.accent}40`,
                    },
                  ]}
                >
                  {selectedTier.icon}
                </View>
                <View style={styles.selectedHeroTextWrap}>
                  <Text
                    style={[
                      styles.selectedHeroEyebrow,
                      { color: appTheme.isDark ? 'rgba(255,255,255,0.72)' : 'rgba(23,18,19,0.56)' },
                    ]}
                  >
                    {selectedTier.title}
                  </Text>
                  <Text style={[styles.selectedHeroSubhead, { color: appTheme.colors.textPrimary }]}>
                    {selectedTier.subtitle}
                  </Text>
                </View>
              </View>

              {/* Features Grid */}
              <View style={styles.selectedFeatureGrid}>
                {selectedTier.features.slice(0, 3).map((feature, index) => (
                  <View
                    key={`${selectedTier.id}-${feature}`}
                    style={[
                      styles.selectedFeaturePill,
                      {
                        borderColor: `${selectedTier.colors.accent}33`,
                        backgroundColor: appTheme.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)',
                      },
                    ]}
                  >
                    <Text style={[styles.selectedFeatureText, { color: appTheme.colors.textPrimary }]}>
                      ✓ {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Role Cards */}
        <View style={styles.cardsContainer}>
          {ROLE_OPTIONS.map((role, index) => {
            const isSelected = selectedRole === role.id;
            const cardGradient: [string, string] = isSelected
              ? role.colors.gradient
              : [appTheme.colors.surface, appTheme.colors.surface];

            return (
              <AnimatedRoleCard
                key={role.id}
                role={role}
                index={index}
                isSelected={isSelected}
                isSubmitting={isSubmitting}
                pulseProgress={pulseProgress}
                cardGradient={cardGradient}
                appTheme={appTheme}
                onPress={() => handleRolePress(role.id)}
              />
            );
          })}
        </View>

        {/* Continue Button */}
        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
          <TouchableOpacity
            accessibilityLabel={selectedRole ? `Continue with ${selectedRole}` : 'Select a role to continue'}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={!selectedRole || isSubmitting}
            style={[styles.continueButton, (!selectedRole || isSubmitting) && { opacity: 0.4 }]}
          >
            <LinearGradient
              colors={
                selectedRole && selectedTier
                  ? [selectedTier.colors.primary, selectedTier.colors.gradient[1]]
                  : [appTheme.colors.border, appTheme.colors.border]
              }
              style={styles.continueGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.continueText, { color: appTheme.colors.textPrimary }]}>
                {isSubmitting ? 'Loading...' : 'Continue'}
              </Text>
              {!isSubmitting && <ChevronRight size={20} color={appTheme.colors.textPrimary} />}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

interface AnimatedRoleCardProps {
  role: (typeof ROLE_OPTIONS)[number];
  index: number;
  isSelected: boolean;
  isSubmitting: boolean;
  pulseProgress: SharedValue<number>;
  cardGradient: [string, string];
  appTheme: ReturnType<typeof useAppTheme>;
  onPress: () => void;
}

function AnimatedRoleCard({
  role,
  index,
  isSelected,
  isSubmitting,
  pulseProgress,
  cardGradient,
  appTheme,
  onPress,
}: AnimatedRoleCardProps) {
  const cardProgress = useSharedValue(0);

  useEffect(() => {
    cardProgress.value = withDelay(
      200 + index * 120,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [cardProgress, index]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardProgress.value,
    transform: [
      { translateY: interpolate(cardProgress.value, [0, 1], [40, 0]) },
      { scale: isSelected ? pulseProgress.value : 1 },
    ],
  }));

  return (
    <Animated.View style={cardAnimatedStyle}>
      <TouchableOpacity
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected, disabled: isSubmitting }}
        accessibilityLabel={`${role.title} experience option`}
        activeOpacity={0.85}
        disabled={isSubmitting}
        onPress={onPress}
      >
        <LinearGradient
          colors={cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.roleCard,
            isSelected && [
              styles.roleCardSelected,
              { shadowColor: role.colors.primary, borderColor: `${role.colors.accent}88` },
            ],
          ]}
        >
          <View style={styles.roleCardContent}>
            <View
              style={[
                styles.roleIconContainer,
                {
                  backgroundColor: isSelected
                    ? appTheme.isDark
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(23,18,19,0.12)'
                    : `${role.colors.primary}15`,
                },
              ]}
            >
              {role.icon}
            </View>
            <View style={styles.roleTextContent}>
              <Text style={[styles.roleTitle, { color: appTheme.colors.textPrimary }]}>
                {role.title}
              </Text>
              <Text
                style={[
                  styles.roleSubtitle,
                  {
                    color: isSelected
                      ? appTheme.colors.textSecondary
                      : appTheme.colors.textSecondary,
                  },
                ]}
              >
                {role.subtitle}
              </Text>
            </View>
            <View style={styles.checkIndicatorContainer}>
              {isSelected && (
                <CheckCircle
                  size={24}
                  color={role.colors.accent}
                  fill={appTheme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)'}
                />
              )}
            </View>
          </View>

          {/* Features When Selected */}
          {isSelected && (
            <View style={styles.featuresContainer}>
              {role.features.map((feature, fi) => (
                <View key={fi} style={styles.featureRow}>
                  <Text
                    style={[
                      styles.featureText,
                      { color: appTheme.isDark ? 'rgba(255,255,255,0.85)' : 'rgba(23,18,19,0.72)' },
                    ]}
                  >
                    • {feature}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  bgCircle1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: -0.5,
  },
  cardsContainer: {
    gap: 12,
  },
  selectedWelcomeWrap: {
    marginBottom: 24,
  },
  selectedWelcomeGradient: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  selectedWelcomeHeader: {
    gap: 4,
  },
  selectedWelcomeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  selectedWelcomeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedWelcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  selectedWelcomeLine: {
    fontSize: 13,
    fontWeight: '400',
  },
  selectedHeroCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 120,
  },
  selectedHeroBackdrop: {
    position: 'absolute',
    right: -22,
    top: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  selectedHeroOrb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  selectedHeroTextWrap: {
    flex: 1,
    gap: 6,
  },
  selectedHeroEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  selectedHeroSubhead: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  selectedFeatureGrid: {
    gap: 8,
  },
  selectedFeaturePill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedFeatureText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  roleCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  roleCardSelected: {
    borderColor: 'rgba(255,255,255,0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  roleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTextContent: {
    flex: 1,
    marginLeft: 16,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  roleSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
  },
  checkIndicatorContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuresContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '400',
  },
  buttonContainer: {
    marginTop: 32,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 56,
  },
  continueGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
