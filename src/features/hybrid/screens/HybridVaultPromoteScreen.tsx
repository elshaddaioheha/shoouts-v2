import { AppText } from '@/src/components/ui/AppText';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { useAccountStore } from '@/src/features/account/account.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { createDraftListing } from '@/src/features/studio/studio.api';
import { markVaultProjectPromoted } from '@/src/features/vault/vault.api';
import { useVaultProjects } from '@/src/features/vault/vault.hooks';
import { useThemeTokens } from '@/src/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

export function HybridVaultPromoteScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const profile = useAccountStore((state) => state.profile);
  const uid = user?.uid ?? profile?.uid ?? null;
  const query = useVaultProjects(uid, 48, { enabled: Boolean(uid) });
  const project = query.data?.find((p) => p.id === id);

  const [priceText, setPriceText] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePromote() {
    if (!uid) {
      setError('You must be signed in to promote a project.');
      return;
    }
    if (!project) {
      setError('Project not found.');
      return;
    }
    if (!project.sourcePath) {
      setError('Cannot promote: vault project source path is missing.');
      return;
    }

    const rawPrice = priceText.trim().replace(/[^0-9.]/g, '');
    const parsedDollars = parseFloat(rawPrice);
    const priceInCents = isNaN(parsedDollars) ? 0 : Math.round(parsedDollars * 100);

    setPromoting(true);
    setError(null);

    try {
      await createDraftListing(uid, {
        title: project.title,
        priceInCents,
        genre: project.genre ?? null,
        licenseType: null,
        description: project.description ?? null,
        bpm: project.bpm ?? null,
        key: project.key ?? null,
        coverUrl: project.coverUrl ?? null,
        audioUrl: project.audioUrl ?? null,
        vaultSourceId: project.id,
      });

      await markVaultProjectPromoted(project.sourcePath);
      await query.refetch();

      router.replace('/hybrid/studio' as any);
    } catch {
      setError('Promotion failed. Please try again.');
    } finally {
      setPromoting(false);
    }
  }

  if (query.isLoading) {
    return (
      <AppShell>
        <LoadingState label="Loading project..." />
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <View style={styles.center}>
          <AppText variant="sectionHeading">Project not found</AppText>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <AppText variant="button" tone="secondary">Go back</AppText>
          </Pressable>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell showBottomBar={false} reserveBottomBarSpace={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => router.back()}>
            <AppText variant="button" tone="secondary" style={styles.back}>Back</AppText>
          </Pressable>

          <AppText variant="eyebrow" tone="accent">Promote to Studio</AppText>
          <AppText variant="pageHeading" style={styles.heading}>Review listing</AppText>
          <AppText variant="body" tone="secondary" style={styles.subtext}>
            This will create a Studio listing draft from your vault project. Set a price to continue.
          </AppText>

          <View style={styles.summary}>
            {project.coverUrl ? (
              <Image source={{ uri: project.coverUrl }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, styles.coverPlaceholder]} />
            )}

            <View style={styles.summaryMeta}>
              <SummaryRow label="Title" value={project.title} styles={styles} />
              <SummaryRow label="Artist" value={project.artist} styles={styles} />
              {project.genre ? (
                <SummaryRow label="Genre" value={project.genre} styles={styles} />
              ) : null}
              {project.bpm != null ? (
                <SummaryRow label="BPM" value={String(project.bpm)} styles={styles} />
              ) : null}
              {project.key ? (
                <SummaryRow label="Key" value={project.key} styles={styles} />
              ) : null}
            </View>
          </View>

          {project.description ? (
            <View style={styles.descriptionCard}>
              <AppText variant="caption" tone="muted" style={styles.fieldLabel}>Description</AppText>
              <AppText variant="body" tone="secondary">{project.description}</AppText>
            </View>
          ) : null}

          <View style={styles.priceSection}>
            <AppText variant="sectionHeading" style={styles.priceSectionTitle}>Set price</AppText>
            <AppText variant="caption" tone="muted" style={styles.priceHint}>
              Enter 0 for a free listing. You can adjust pricing later in Studio.
            </AppText>
            <View style={styles.priceInputWrap}>
              <AppText variant="sectionHeading" style={styles.priceCurrency}>$</AppText>
              <TextInput
                style={styles.priceInput}
                value={priceText}
                onChangeText={setPriceText}
                placeholder="0.00"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>
          </View>

          {error ? (
            <AppText variant="caption" tone="secondary" style={styles.errorText}>
              {error}
            </AppText>
          ) : null}

          <Pressable
            style={[styles.promoteButton, promoting && styles.promoteButtonDisabled]}
            onPress={handlePromote}
            disabled={promoting}
          >
            {promoting ? (
              <ActivityIndicator size="small" color={theme.colors.textOnAccent} />
            ) : (
              <AppText variant="button" style={{ color: theme.colors.textOnAccent }}>
                Create listing draft
              </AppText>
            )}
          </Pressable>

          <AppText variant="caption" tone="muted" style={styles.disclaimer}>
            The vault project stays private. The listing draft appears in Hybrid Studio for final review before publishing.
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  );
}

function SummaryRow({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.summaryRow}>
      <AppText variant="caption" tone="muted" style={styles.summaryLabel}>{label}</AppText>
      <AppText variant="bodySmall" style={styles.summaryValue} numberOfLines={1}>{value}</AppText>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.md,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    back: {
      marginBottom: theme.spacing.xs,
    },
    heading: {
      marginBottom: theme.spacing.xs,
    },
    subtext: {
      lineHeight: 21,
      marginBottom: theme.spacing.xs,
    },
    summary: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
    },
    cover: {
      width: 80,
      height: 80,
      borderRadius: theme.radius.lg,
      flexShrink: 0,
    },
    coverPlaceholder: {
      backgroundColor: theme.colors.surfaceElevated,
    },
    summaryMeta: {
      flex: 1,
      gap: theme.spacing.xs,
      justifyContent: 'center',
    },
    summaryRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      alignItems: 'baseline',
    },
    summaryLabel: {
      width: 52,
      flexShrink: 0,
    },
    summaryValue: {
      flex: 1,
      color: theme.colors.textPrimary,
    },
    descriptionCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    fieldLabel: {
      marginBottom: 2,
    },
    priceSection: {
      gap: theme.spacing.sm,
    },
    priceSectionTitle: {
      marginBottom: theme.spacing.xs,
    },
    priceHint: {
      lineHeight: 17,
    },
    priceInputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      paddingHorizontal: theme.spacing.md,
      minHeight: theme.layout.minTouchTarget,
      gap: theme.spacing.xs,
    },
    priceCurrency: {
      color: theme.colors.textMuted,
      fontSize: 20,
    },
    priceInput: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 20,
      lineHeight: 24,
      paddingVertical: theme.spacing.sm,
    },
    errorText: {
      color: theme.colors.textMuted,
    },
    promoteButton: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.accent,
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: theme.layout.minTouchTarget,
    },
    promoteButtonDisabled: {
      opacity: 0.6,
    },
    disclaimer: {
      textAlign: 'center',
      lineHeight: 17,
    },
    backButton: {
      minHeight: theme.layout.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
