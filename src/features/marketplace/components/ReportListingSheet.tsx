import { AppText } from '@/src/components/ui/AppText';
import { submitReport } from '@/src/features/admin/admin.api';
import type { ReportReason } from '@/src/features/admin/admin.types';
import { useThemeTokens } from '@/src/theme';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

const REASONS: { key: ReportReason; label: string }[] = [
  { key: 'copyright', label: 'Copyright violation' },
  { key: 'inappropriate', label: 'Inappropriate content' },
  { key: 'spam', label: 'Spam or misleading' },
  { key: 'other', label: 'Other' },
];

type Props = {
  visible: boolean;
  listingId: string;
  listingTitle: string;
  sellerId: string;
  reportedBy: string;
  onClose: () => void;
  onSent: () => void;
};

export function ReportListingSheet({
  visible,
  listingId,
  listingTitle,
  sellerId,
  reportedBy,
  onClose,
  onSent,
}: Props) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setReason(null);
    setDetails('');
    setError(null);
    onClose();
  }

  async function handleSubmit() {
    if (!reason) { setError('Please select a reason.'); return; }
    setSending(true);
    setError(null);
    try {
      await submitReport({
        listingId,
        listingTitle,
        sellerId,
        reportedBy,
        reason,
        details: details.trim() || null,
      });
      setReason(null);
      setDetails('');
      onSent();
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <AppText variant="sectionHeading" style={styles.title}>Report listing</AppText>
        <AppText variant="caption" tone="secondary" style={styles.subtitle}>
          Select a reason for reporting "{listingTitle}"
        </AppText>

        <View style={styles.reasons}>
          {REASONS.map((item) => (
            <Pressable
              key={item.key}
              style={[styles.reasonButton, reason === item.key && styles.reasonButtonActive]}
              onPress={() => setReason(item.key)}
            >
              <AppText
                variant="bodySmall"
                tone={reason === item.key ? 'primary' : 'secondary'}
              >
                {item.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.detailsInput}
          value={details}
          onChangeText={setDetails}
          placeholder="Additional details (optional)"
          placeholderTextColor={theme.colors.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {error ? (
          <AppText variant="caption" tone="secondary" style={styles.error}>{error}</AppText>
        ) : null}

        <View style={styles.actions}>
          <Pressable style={styles.cancelButton} onPress={handleClose}>
            <AppText variant="button" tone="secondary">Cancel</AppText>
          </Pressable>
          <Pressable
            style={[styles.submitButton, (!reason || sending) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!reason || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={theme.colors.textOnAccent} />
            ) : (
              <AppText variant="button" style={{ color: theme.colors.textOnAccent }}>Submit report</AppText>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.xxl,
      borderTopRightRadius: theme.radius.xxl,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.md,
    },
    handle: {
      alignSelf: 'center',
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.borderStrong,
      marginBottom: theme.spacing.sm,
    },
    title: { marginBottom: theme.spacing.xs },
    subtitle: { lineHeight: 18, marginTop: -theme.spacing.xs },
    reasons: { gap: theme.spacing.sm },
    reasonButton: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reasonButtonActive: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.surfaceElevated,
    },
    detailsInput: {
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      color: theme.colors.textPrimary,
      fontSize: 14,
      minHeight: 72,
    },
    error: { marginTop: -theme.spacing.xs },
    actions: { flexDirection: 'row', gap: theme.spacing.sm },
    cancelButton: {
      flex: 1,
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitButton: {
      flex: 1,
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitButtonDisabled: { opacity: 0.5 },
  });
}
