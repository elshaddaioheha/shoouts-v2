import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import { useThemeTokens } from '@/src/theme';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

type SearchMarketplaceModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function SearchMarketplaceModal({
  visible,
  onClose,
}: SearchMarketplaceModalProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <AppText variant="sectionHeading">Search Marketplace</AppText>

          <Pressable onPress={onClose} style={styles.closeButton}>
            <AppIcon name="more" size="md" tone="secondary" />
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <AppIcon name="market" size="md" tone="muted" />
          <TextInput
            placeholder="Search beats, songs, producers..."
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />
        </View>

        <View style={styles.empty}>
          <AppText variant="title">Search coming next</AppText>
          <AppText variant="body" tone="secondary" style={styles.emptyText}>
            This will support genre, BPM, key, free/paid, and producer search.
          </AppText>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
    },
    header: {
      paddingTop: theme.spacing.xl,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.card,
    },
    searchBox: {
      minHeight: 52,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    input: {
      flex: 1,
      color: theme.colors.textPrimary,
      ...theme.typography.input,
    },
    empty: {
      marginTop: theme.spacing.xxxl,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.lg,
    },
    emptyText: {
      marginTop: theme.spacing.sm,
    },
  });
}
