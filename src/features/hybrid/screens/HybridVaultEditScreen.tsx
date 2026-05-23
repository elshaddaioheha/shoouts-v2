import { AppText } from '@/src/components/ui/AppText';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { useAccountStore } from '@/src/features/account/account.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { updateVaultProject } from '@/src/features/vault/vault.api';
import { useVaultProjects } from '@/src/features/vault/vault.hooks';
import type { VaultProjectEditFields } from '@/src/features/vault/vault.types';
import { useThemeTokens } from '@/src/theme';
import * as ImagePicker from 'expo-image-picker';
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

export function HybridVaultEditScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const profile = useAccountStore((state) => state.profile);
  const uid = user?.uid ?? profile?.uid ?? null;
  const query = useVaultProjects(uid, 48, { enabled: Boolean(uid) });
  const project = query.data?.find((p) => p.id === id);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!initialized && project) {
    setTitle(project.title ?? '');
    setArtist(project.artist ?? '');
    setGenre(project.genre ?? '');
    setBpm(project.bpm != null ? String(project.bpm) : '');
    setKey(project.key ?? '');
    setDescription(project.description ?? '');
    setCoverUrl(project.coverUrl ?? null);
    setInitialized(true);
  }

  async function handlePickCover() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setCoverUrl(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (!project?.sourcePath) {
      setError('Cannot save: vault project source path is missing.');
      return;
    }

    setSaving(true);
    setError(null);

    const fields: Partial<VaultProjectEditFields> = {
      title: title.trim() || project.title,
      artist: artist.trim() || project.artist,
      genre: genre.trim() || null,
      bpm: bpm.trim() ? Number(bpm.trim()) || null : null,
      key: key.trim() || null,
      description: description.trim() || null,
    };

    try {
      await updateVaultProject(project.sourcePath, fields);
      await query.refetch();
      router.back();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (query.isLoading || !initialized) {
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

          <AppText variant="eyebrow" tone="muted">Hybrid Vault</AppText>
          <AppText variant="pageHeading" style={styles.heading}>Edit project</AppText>

          <Pressable style={styles.coverWrap} onPress={handlePickCover}>
            {coverUrl ? (
              <Image source={{ uri: coverUrl }} style={styles.cover} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <AppText variant="caption" tone="muted">Tap to add artwork</AppText>
              </View>
            )}
          </Pressable>

          <View style={styles.fields}>
            <Field label="Title" styles={styles} theme={theme}>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Project title"
                placeholderTextColor={theme.colors.textMuted}
              />
            </Field>

            <Field label="Artist" styles={styles} theme={theme}>
              <TextInput
                style={styles.input}
                value={artist}
                onChangeText={setArtist}
                placeholder="Artist name"
                placeholderTextColor={theme.colors.textMuted}
              />
            </Field>

            <Field label="Genre" styles={styles} theme={theme}>
              <TextInput
                style={styles.input}
                value={genre}
                onChangeText={setGenre}
                placeholder="e.g. Hip-Hop, R&B"
                placeholderTextColor={theme.colors.textMuted}
              />
            </Field>

            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <Field label="BPM" styles={styles} theme={theme}>
                  <TextInput
                    style={styles.input}
                    value={bpm}
                    onChangeText={setBpm}
                    placeholder="140"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="numeric"
                  />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Key" styles={styles} theme={theme}>
                  <TextInput
                    style={styles.input}
                    value={key}
                    onChangeText={setKey}
                    placeholder="e.g. C minor"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </Field>
              </View>
            </View>

            <Field label="Description" styles={styles} theme={theme}>
              <TextInput
                style={[styles.input, styles.multiline]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add notes about this project..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </Field>
          </View>

          {error ? (
            <AppText variant="caption" tone="secondary" style={styles.errorText}>
              {error}
            </AppText>
          ) : null}

          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={theme.colors.textOnAccent} />
            ) : (
              <AppText variant="button" style={{ color: theme.colors.textOnAccent }}>
                Save changes
              </AppText>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  );
}

function Field({
  label,
  children,
  styles,
}: {
  label: string;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof useThemeTokens>;
}) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" tone="muted" style={styles.fieldLabel}>{label}</AppText>
      {children}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.sm,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    back: {
      marginBottom: theme.spacing.sm,
    },
    heading: {
      marginBottom: theme.spacing.sm,
    },
    coverWrap: {
      alignSelf: 'center',
      marginBottom: theme.spacing.md,
    },
    cover: {
      width: 140,
      height: 140,
      borderRadius: theme.radius.xl,
    },
    coverPlaceholder: {
      width: 140,
      height: 140,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
    },
    fields: {
      gap: theme.spacing.sm,
    },
    fieldRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    field: {
      gap: theme.spacing.xs,
    },
    fieldLabel: {
      marginBottom: 2,
    },
    input: {
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      color: theme.colors.textPrimary,
      fontSize: 15,
      lineHeight: 20,
      minHeight: theme.layout.minTouchTarget,
    },
    multiline: {
      minHeight: 96,
      paddingTop: theme.spacing.sm,
    },
    errorText: {
      color: theme.colors.textMuted,
      marginTop: theme.spacing.xs,
    },
    saveButton: {
      marginTop: theme.spacing.md,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.accent,
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: theme.layout.minTouchTarget,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    backButton: {
      minHeight: theme.layout.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
