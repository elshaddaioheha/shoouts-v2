import { AppText } from '@/src/components/ui/AppText';
import { useThemeTokens } from '@/src/theme';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  listingTitle: string;
  onSend: (text: string) => Promise<void>;
  onClose: () => void;
};

export function ComposeThreadModal({ visible, listingTitle, onSend, onClose }: Props) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      await onSend(trimmed);
      setText('');
    } catch {
      setError('Could not send message. Please try again.');
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    if (sending) return;
    setText('');
    setError(null);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + theme.spacing.lg }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <AppText variant="eyebrow" tone="accent">New message</AppText>
            <AppText variant="title" numberOfLines={1}>{listingTitle}</AppText>
          </View>

          <TextInput
            style={[styles.input, { color: theme.colors.textPrimary }]}
            value={text}
            onChangeText={setText}
            placeholder="Write your message…"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            autoFocus
            editable={!sending}
          />

          {error ? (
            <AppText variant="caption" tone="danger">{error}</AppText>
          ) : null}

          <View style={styles.footer}>
            <Pressable style={styles.cancelBtn} onPress={handleClose} disabled={sending}>
              <AppText variant="button" tone="secondary">Cancel</AppText>
            </Pressable>
            <Pressable
              style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!text.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <AppText variant="button" style={styles.sendBtnText}>Send</AppText>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.colors.overlay,
    },
    backdrop: { ...StyleSheet.absoluteFillObject },
    sheet: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      borderTopWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      gap: theme.spacing.md,
    },
    handle: {
      alignSelf: 'center',
      width: 48,
      height: 5,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.border,
    },
    header: { gap: theme.spacing.xs },
    input: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 2,
      minHeight: 100,
      ...theme.typography.input,
    },
    footer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    cancelBtn: {
      flex: 1,
      minHeight: theme.layout.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    sendBtn: {
      flex: 2,
      minHeight: theme.layout.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.accent,
    },
    sendBtnDisabled: { opacity: 0.45 },
    sendBtnText: { color: '#FFFFFF' },
  });
}
