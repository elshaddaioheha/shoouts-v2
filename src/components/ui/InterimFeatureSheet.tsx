import { useThemeTokens } from '@/src/theme';
import { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';

type InterimFeatureSheetProps = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  primaryLabel?: string;
  onPrimaryPress?: () => void;
  secondaryLabel?: string;
  footer?: ReactNode;
};

export function InterimFeatureSheet({
  visible,
  title,
  message,
  onClose,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel = 'Not now',
  footer,
}: InterimFeatureSheetProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: theme.spacing.lg + insets.bottom }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <AppText variant="sectionHeading">{title}</AppText>
            <AppText variant="bodySmall" tone="secondary" style={styles.message}>
              {message}
            </AppText>
          </View>

          <View style={styles.actions}>
            {primaryLabel && onPrimaryPress ? (
              <Pressable style={styles.primaryButton} onPress={onPrimaryPress}>
                <AppText variant="button" style={styles.primaryButtonText}>
                  {primaryLabel}
                </AppText>
              </Pressable>
            ) : null}
            <Pressable style={styles.secondaryButton} onPress={onClose}>
              <AppText variant="button" tone="secondary">
                {secondaryLabel}
              </AppText>
            </Pressable>
          </View>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
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
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    sheet: {
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      gap: theme.spacing.lg,
    },
    handle: {
      alignSelf: 'center',
      width: 48,
      height: 5,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.border,
    },
    header: {
      gap: theme.spacing.sm,
    },
    message: {
      lineHeight: 20,
    },
    actions: {
      gap: theme.spacing.sm,
    },
    primaryButton: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    primaryButtonText: {
      color: theme.colors.textOnAccent,
    },
    secondaryButton: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    footer: {
      marginTop: -theme.spacing.xs,
    },
  });
}
