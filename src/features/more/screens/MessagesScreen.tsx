import { AppText } from '@/src/components/ui/AppText';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

const placeholderThreads = [
  {
    id: '1',
    name: 'Shoouts Support',
    snippet: 'Messaging flows are now routed. Live chat sync comes next.',
    meta: 'System',
  },
  {
    id: '2',
    name: 'Creator Inbox',
    snippet: 'Buyer/seller threads will appear here when conversation writes are enabled.',
    meta: 'Preview',
  },
];

export function MessagesScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <AppShell>
        <View style={styles.centered}>
          <View style={styles.card}>
            <AppText variant="sectionHeading">Sign in to open messages</AppText>
            <AppText variant="bodySmall" tone="secondary" style={styles.copy}>
              Conversation history and thread state are account-linked.
            </AppText>
            <Pressable style={styles.primaryButton} onPress={() => router.replace('/(auth)/login' as any)}>
              <AppText variant="button" style={styles.primaryButtonText}>
                Go to login
              </AppText>
            </Pressable>
          </View>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <AppText variant="button" tone="secondary">
            Back
          </AppText>
        </Pressable>

        <AppText variant="eyebrow" tone="accent">
          Messages
        </AppText>
        <AppText variant="pageHeading">Inbox</AppText>
        <AppText variant="bodySmall" tone="secondary">
          Thread navigation is now live. Real-time messaging will be connected in a later phase.
        </AppText>

        <View style={styles.list}>
          {placeholderThreads.map((thread) => (
            <View key={thread.id} style={styles.row}>
              <View style={styles.rowCopy}>
                <AppText variant="title">{thread.name}</AppText>
                <AppText variant="bodySmall" tone="secondary" style={styles.copy}>
                  {thread.snippet}
                </AppText>
              </View>
              <AppText variant="caption" tone="muted">
                {thread.meta}
              </AppText>
            </View>
          ))}
        </View>

        <Pressable style={styles.secondaryButton} onPress={() => router.push('/(tabs)/marketplace' as any)}>
          <AppText variant="button">Find creators on Explore</AppText>
        </Pressable>
      </ScrollView>
    </AppShell>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    centered: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      backgroundColor: theme.colors.background,
      gap: theme.spacing.md,
    },
    backButton: {
      alignSelf: 'flex-start',
      minHeight: 34,
      justifyContent: 'center',
    },
    card: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    copy: {
      lineHeight: 20,
    },
    list: {
      gap: theme.spacing.sm,
    },
    row: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    rowCopy: {
      flex: 1,
      minWidth: 0,
      gap: theme.spacing.xs,
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
      marginTop: theme.spacing.sm,
    },
  });
}
