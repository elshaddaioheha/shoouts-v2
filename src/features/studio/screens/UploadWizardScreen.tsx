import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import { useAccountStore } from '@/src/features/account/account.store';
import { useThemeTokens } from '@/src/theme';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { type ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  createDraftListing,
  patchListingUrls,
  uploadListingFile,
} from '../studio.api';
import type { StudioListingLicenseType } from '../studio.types';

type Step = 1 | 2 | 3;

type WizardState = {
  step: Step;
  audioUri: string | null;
  audioName: string | null;
  audioExt: string;
  audioProgress: number;
  coverUri: string | null;
  coverName: string | null;
  coverExt: string;
  coverProgress: number;
  title: string;
  genre: string;
  description: string;
  bpm: string;
  musicalKey: string;
  priceDisplay: string;
  licenseType: StudioListingLicenseType | null;
  isSaving: boolean;
  error: string | null;
};

const INITIAL: WizardState = {
  step: 1,
  audioUri: null,
  audioName: null,
  audioExt: 'mp3',
  audioProgress: 0,
  coverUri: null,
  coverName: null,
  coverExt: 'jpg',
  coverProgress: 0,
  title: '',
  genre: '',
  description: '',
  bpm: '',
  musicalKey: '',
  priceDisplay: '',
  licenseType: null,
  isSaving: false,
  error: null,
};

const LICENSE_OPTIONS: { label: string; value: StudioListingLicenseType }[] = [
  { label: 'Lease', value: 'lease' },
  { label: 'Exclusive', value: 'exclusive' },
  { label: 'Non-exclusive', value: 'non_exclusive' },
];

const STEP_TITLES: Record<Step, string> = {
  1: 'Upload Files',
  2: 'Track Details',
  3: 'Pricing',
};

export function UploadWizardScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const uid = useAccountStore((state) => state.profile?.uid ?? null);

  const [state, setState] = useState<WizardState>(INITIAL);

  function patch(updates: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...updates }));
  }

  async function pickAudio() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const ext = asset.name?.split('.').pop()?.toLowerCase() ?? 'mp3';
        patch({
          audioUri: asset.uri,
          audioName: asset.name ?? 'audio',
          audioExt: ext,
          error: null,
        });
      }
    } catch {
      patch({ error: 'Could not open audio picker. Please try again.' });
    }
  }

  async function pickCover() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const ext =
          asset.fileName?.split('.').pop()?.toLowerCase() ??
          asset.uri.split('.').pop()?.toLowerCase() ??
          'jpg';
        patch({
          coverUri: asset.uri,
          coverName: asset.fileName ?? 'cover',
          coverExt: ext,
          error: null,
        });
      }
    } catch {
      patch({ error: 'Could not open image picker. Please try again.' });
    }
  }

  function handleNext() {
    if (state.step === 1) {
      if (!state.audioUri) {
        patch({ error: 'Please select an audio file before continuing.' });
        return;
      }
      patch({ step: 2, error: null });
    } else if (state.step === 2) {
      if (!state.title.trim()) {
        patch({ error: 'Track title is required.' });
        return;
      }
      patch({ step: 3, error: null });
    }
  }

  function handleBack() {
    if (state.step === 1) {
      router.back();
    } else {
      patch({ step: (state.step - 1) as Step, error: null });
    }
  }

  async function handleSaveDraft() {
    if (!uid) {
      patch({ error: 'Not signed in. Please sign in and try again.' });
      return;
    }

    const rawPrice = parseFloat(state.priceDisplay.replace(/[^0-9.]/g, ''));
    const priceInCents = Number.isFinite(rawPrice) ? Math.round(rawPrice * 100) : 0;

    patch({ isSaving: true, error: null });

    try {
      const listingId = await createDraftListing(uid, {
        title: state.title.trim(),
        priceInCents,
        genre: state.genre.trim() || null,
        licenseType: state.licenseType,
        description: state.description.trim() || null,
        bpm: state.bpm ? Number(state.bpm) || null : null,
        key: state.musicalKey.trim() || null,
      });

      const urls: { audioUrl?: string; coverUrl?: string } = {};

      if (state.audioUri) {
        const audioUrl = await uploadListingFile(
          uid,
          listingId,
          'audio',
          state.audioUri,
          state.audioExt,
          (p) => patch({ audioProgress: p })
        );
        urls.audioUrl = audioUrl;
      }

      if (state.coverUri) {
        const coverUrl = await uploadListingFile(
          uid,
          listingId,
          'cover',
          state.coverUri,
          state.coverExt,
          (p) => patch({ coverProgress: p })
        );
        urls.coverUrl = coverUrl;
      }

      await patchListingUrls(uid, listingId, urls);

      router.back();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      patch({ isSaving: false, error: message });
    }
  }

  const isStep1Valid = Boolean(state.audioUri);
  const isStep2Valid = state.title.trim().length > 0;
  const canProceed =
    state.step === 1 ? isStep1Valid : state.step === 2 ? isStep2Valid : true;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <WizardHeader
        step={state.step}
        title={STEP_TITLES[state.step]}
        onClose={() => router.back()}
        theme={theme}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {state.step === 1 && (
          <FilesStep
            state={state}
            onPickAudio={pickAudio}
            onPickCover={pickCover}
            theme={theme}
          />
        )}
        {state.step === 2 && (
          <DetailsStep state={state} onChange={patch} theme={theme} />
        )}
        {state.step === 3 && (
          <PricingStep state={state} onChange={patch} theme={theme} />
        )}
      </ScrollView>

      {state.isSaving && (
        <UploadProgressBar
          audioProgress={state.audioProgress}
          coverProgress={state.coverProgress}
          hasCover={Boolean(state.coverUri)}
          theme={theme}
        />
      )}

      {state.error ? (
        <View style={[styles.errorBanner, { marginHorizontal: theme.spacing.lg }]}>
          <AppText variant="bodySmall" tone="danger">
            {state.error}
          </AppText>
        </View>
      ) : null}

      <WizardFooter
        step={state.step}
        isSaving={state.isSaving}
        canProceed={canProceed}
        onBack={handleBack}
        onNext={handleNext}
        onSave={handleSaveDraft}
        insetBottom={insets.bottom}
        theme={theme}
      />
    </KeyboardAvoidingView>
  );
}

function WizardHeader({
  step,
  title,
  onClose,
  theme,
}: {
  step: Step;
  title: string;
  onClose: () => void;
  theme: ReturnType<typeof useThemeTokens>;
}) {
  const styles = createHeaderStyles(theme);
  return (
    <View style={styles.container}>
      <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
        <AppIcon name="more" size="sm" tone="secondary" />
      </Pressable>
      <View style={styles.center}>
        <AppText variant="title">{title}</AppText>
        <View style={styles.dots}>
          {([1, 2, 3] as Step[]).map((s) => (
            <View
              key={s}
              style={[styles.dot, s === step && styles.dotActive, s < step && styles.dotDone]}
            />
          ))}
        </View>
      </View>
      <View style={styles.closeBtn} />
    </View>
  );
}

function FilesStep({
  state,
  onPickAudio,
  onPickCover,
  theme,
}: {
  state: WizardState;
  onPickAudio: () => void;
  onPickCover: () => void;
  theme: ReturnType<typeof useThemeTokens>;
}) {
  const styles = createFilesStyles(theme);
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPickAudio}
        style={({ pressed }) => [styles.picker, pressed && styles.pickerPressed]}
      >
        <View style={styles.pickerIcon}>
          <AppIcon name="upload" size="md" tone="accent" />
        </View>
        <View style={styles.pickerText}>
          <AppText variant="title">
            {state.audioUri ? 'Audio selected' : 'Select audio file'}
          </AppText>
          <AppText variant="bodySmall" tone={state.audioUri ? 'secondary' : 'muted'}>
            {state.audioName ?? 'MP3, WAV, FLAC — required'}
          </AppText>
        </View>
        {state.audioUri && (
          <AppIcon name="add" size="sm" tone="success" />
        )}
      </Pressable>

      <Pressable
        onPress={onPickCover}
        style={({ pressed }) => [styles.picker, pressed && styles.pickerPressed]}
      >
        <View style={styles.pickerIcon}>
          <AppIcon name="studio" size="md" tone="accent" />
        </View>
        <View style={styles.pickerText}>
          <AppText variant="title">
            {state.coverUri ? 'Artwork selected' : 'Select cover artwork'}
          </AppText>
          <AppText variant="bodySmall" tone={state.coverUri ? 'secondary' : 'muted'}>
            {state.coverName ?? 'Square image — optional'}
          </AppText>
        </View>
        {state.coverUri && (
          <AppIcon name="add" size="sm" tone="success" />
        )}
      </Pressable>
    </View>
  );
}

function DetailsStep({
  state,
  onChange,
  theme,
}: {
  state: WizardState;
  onChange: (u: Partial<WizardState>) => void;
  theme: ReturnType<typeof useThemeTokens>;
}) {
  const styles = createFormStyles(theme);
  return (
    <View style={styles.container}>
      <FieldGroup label="Track title *" theme={theme}>
        <TextInput
          style={styles.input}
          value={state.title}
          onChangeText={(v) => onChange({ title: v })}
          placeholder="Enter track title"
          placeholderTextColor={theme.colors.textMuted}
          returnKeyType="next"
        />
      </FieldGroup>

      <FieldGroup label="Genre" theme={theme}>
        <TextInput
          style={styles.input}
          value={state.genre}
          onChangeText={(v) => onChange({ genre: v })}
          placeholder="e.g. Trap, R&B, Drill"
          placeholderTextColor={theme.colors.textMuted}
          returnKeyType="next"
        />
      </FieldGroup>

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <FieldGroup label="BPM" theme={theme}>
            <TextInput
              style={styles.input}
              value={state.bpm}
              onChangeText={(v) => onChange({ bpm: v.replace(/[^0-9]/g, '') })}
              placeholder="140"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="number-pad"
              returnKeyType="next"
            />
          </FieldGroup>
        </View>
        <View style={styles.rowItem}>
          <FieldGroup label="Key" theme={theme}>
            <TextInput
              style={styles.input}
              value={state.musicalKey}
              onChangeText={(v) => onChange({ musicalKey: v })}
              placeholder="e.g. Am, C#"
              placeholderTextColor={theme.colors.textMuted}
              returnKeyType="next"
            />
          </FieldGroup>
        </View>
      </View>

      <FieldGroup label="Description" theme={theme}>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={state.description}
          onChangeText={(v) => onChange({ description: v })}
          placeholder="Describe your track..."
          placeholderTextColor={theme.colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </FieldGroup>
    </View>
  );
}

function PricingStep({
  state,
  onChange,
  theme,
}: {
  state: WizardState;
  onChange: (u: Partial<WizardState>) => void;
  theme: ReturnType<typeof useThemeTokens>;
}) {
  const styles = createFormStyles(theme);
  return (
    <View style={styles.container}>
      <FieldGroup label="Price (USD)" theme={theme}>
        <View style={styles.priceRow}>
          <AppText variant="title" tone="secondary" style={styles.priceCurrency}>
            $
          </AppText>
          <TextInput
            style={[styles.input, styles.priceInput]}
            value={state.priceDisplay}
            onChangeText={(v) => {
              const cleaned = v.replace(/[^0-9.]/g, '');
              onChange({ priceDisplay: cleaned });
            }}
            placeholder="29.99"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
        </View>
        <AppText variant="caption" tone="muted" style={styles.priceHint}>
          Enter 0 to offer for free
        </AppText>
      </FieldGroup>

      <FieldGroup label="License type" theme={theme}>
        <View style={styles.licenseGroup}>
          {LICENSE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => onChange({ licenseType: opt.value })}
              style={[
                styles.licenseBtn,
                state.licenseType === opt.value && styles.licenseBtnActive,
              ]}
            >
              <AppText
                variant="bodySmall"
                tone={state.licenseType === opt.value ? 'accent' : 'secondary'}
              >
                {opt.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </FieldGroup>
    </View>
  );
}

function FieldGroup({
  label,
  children,
  theme,
}: {
  label: string;
  children: ReactNode;
  theme: ReturnType<typeof useThemeTokens>;
}) {
  const styles = createFormStyles(theme);
  return (
    <View style={styles.fieldGroup}>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
      {children}
    </View>
  );
}

function UploadProgressBar({
  audioProgress,
  coverProgress,
  hasCover,
  theme,
}: {
  audioProgress: number;
  coverProgress: number;
  hasCover: boolean;
  theme: ReturnType<typeof useThemeTokens>;
}) {
  const styles = createProgressStyles(theme);
  return (
    <View style={styles.container}>
      <ProgressRow
        label="Audio"
        progress={audioProgress}
        theme={theme}
      />
      {hasCover && (
        <ProgressRow
          label="Artwork"
          progress={coverProgress}
          theme={theme}
        />
      )}
    </View>
  );
}

function ProgressRow({
  label,
  progress,
  theme,
}: {
  label: string;
  progress: number;
  theme: ReturnType<typeof useThemeTokens>;
}) {
  const styles = createProgressStyles(theme);
  const pct = Math.round(progress * 100);
  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <AppText variant="caption" tone="secondary">
          {label}
        </AppText>
        <AppText variant="caption" tone="accent">
          {pct}%
        </AppText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

function WizardFooter({
  step,
  isSaving,
  canProceed,
  onBack,
  onNext,
  onSave,
  insetBottom,
  theme,
}: {
  step: Step;
  isSaving: boolean;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
  insetBottom: number;
  theme: ReturnType<typeof useThemeTokens>;
}) {
  const styles = createFooterStyles(theme);
  const isLast = step === 3;

  return (
    <View style={[styles.container, { paddingBottom: insetBottom + theme.spacing.md }]}>
      <Pressable
        onPress={onBack}
        disabled={isSaving}
        style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
      >
        <AppText variant="button" tone="secondary">
          {step === 1 ? 'Cancel' : 'Back'}
        </AppText>
      </Pressable>

      <Pressable
        onPress={isLast ? onSave : onNext}
        disabled={isSaving || !canProceed}
        style={({ pressed }) => [
          styles.primaryBtn,
          (!canProceed || isSaving) && styles.primaryBtnDisabled,
          pressed && styles.btnPressed,
        ]}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <AppText variant="button" tone="primary" style={styles.primaryBtnText}>
            {isLast ? 'Save Draft' : 'Next'}
          </AppText>
        )}
      </Pressable>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    errorBanner: {
      backgroundColor: theme.colors.dangerSoft,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.danger,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
  });
}

function createHeaderStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    closeBtn: {
      width: 36,
      alignItems: 'center',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    dots: {
      flexDirection: 'row',
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.border,
    },
    dotActive: {
      backgroundColor: theme.colors.accent,
      width: 16,
    },
    dotDone: {
      backgroundColor: theme.colors.success,
    },
  });
}

function createFilesStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.md,
    },
    picker: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
    },
    pickerPressed: {
      borderColor: theme.colors.accentBorder,
      backgroundColor: theme.colors.accentSoft,
    },
    pickerIcon: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pickerText: {
      flex: 1,
      gap: 2,
    },
  });
}

function createFormStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.lg,
    },
    fieldGroup: {
      gap: theme.spacing.xs,
    },
    input: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 2,
      color: theme.colors.textPrimary,
      ...theme.typography.input,
    },
    multiline: {
      height: 100,
      paddingTop: theme.spacing.sm + 2,
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    rowItem: {
      flex: 1,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    priceCurrency: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 2,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderRightWidth: 0,
      borderColor: theme.colors.borderStrong,
      borderTopLeftRadius: theme.radius.md,
      borderBottomLeftRadius: theme.radius.md,
    },
    priceInput: {
      flex: 1,
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
    priceHint: {
      marginTop: 2,
    },
    licenseGroup: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      flexWrap: 'wrap',
    },
    licenseBtn: {
      flex: 1,
      minWidth: 80,
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surfaceElevated,
    },
    licenseBtnActive: {
      borderColor: theme.colors.accentBorder,
      backgroundColor: theme.colors.accentSoft,
    },
  });
}

function createProgressStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    row: {
      gap: theme.spacing.xs,
    },
    rowHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    track: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: theme.radius.pill,
      overflow: 'hidden',
    },
    fill: {
      height: 4,
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.pill,
    },
  });
}

function createFooterStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    backBtn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    primaryBtn: {
      flex: 2,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.accent,
    },
    primaryBtnDisabled: {
      opacity: 0.45,
    },
    primaryBtnText: {
      color: '#FFFFFF',
    },
    btnPressed: {
      opacity: 0.75,
    },
  });
}
