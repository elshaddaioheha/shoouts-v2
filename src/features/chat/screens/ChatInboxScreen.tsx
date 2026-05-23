import { AppText } from '@/src/components/ui/AppText';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ThreadRow } from '../components/ThreadRow';
import { useChatInbox } from '../chat.hooks';

export function ChatInboxScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const user = useAuthStore((state) => state.user);
  const uid = user?.uid ?? null;
  const { threads, isLoading, error } = useChatInbox(uid);

  if (!user) {
    return (
      <AppShell>
        <View style={styles.centered}>
          <View style={styles.card}>
            <AppText variant="sectionHeading">Sign in to open messages</AppText>
            <AppText variant="bodySmall" tone="secondary" style={styles.copy}>
              Conversation history and thread state are account-linked.
            </AppText>
            <Pressable
              style={styles.primaryButton}
              onPress={() => router.replace('/(auth)/login' as any)}
            >
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
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <AppText variant="button" tone="secondary">Back</AppText>
        </Pressable>

        <AppText variant="eyebrow" tone="accent">Messages</AppText>
        <AppText variant="pageHeading">Inbox</AppText>

        <View style={styles.supportRow}>
          <AppText variant="caption" tone="muted">Support</AppText>
          <Pressable
            style={styles.supportCard}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/more',
              } as any)
            }
          >
            <View style={styles.supportAvatar}>
              <AppText variant="caption" style={styles.supportAvatarText}>S</AppText>
            </View>
            <View style={styles.supportBody}>
              <AppText variant="title">Shoouts Support</AppText>
              <AppText variant="bodySmall" tone="secondary">
                Contact support via our help desk
              </AppText>
            </View>
          </Pressable>
        </View>

        <View style={styles.threadsSection}>
          <AppText variant="caption" tone="muted">Conversations</AppText>

          {isLoading ? (
            <LoadingState label="Loading messages…" />
          ) : error ? (
            <ErrorState
              title="Could not load messages"
              message="Check your connection and try again."
            />
          ) : threads.length === 0 ? (
            <View style={styles.emptyCard}>
              <AppText variant="sectionHeading">No conversations yet</AppText>
              <AppText variant="bodySmall" tone="secondary" style={styles.copy}>
                Message a seller from any listing page to start a conversation.
              </AppText>
              <Pressable
                style={styles.exploreButton}
                onPress={() => router.push('/(tabs)/marketplace' as any)}
              >
                <AppText variant="button">Browse listings</AppText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.list}>
              {threads.map((thread) => (
                <ThreadRow
                  key={thread.id}
                  thread={thread}
                  uid={uid!}
                  onPress={() =>
                    router.push({
                      pathname: '/messages/[threadId]',
                      params: { threadId: thread.id },
                    } as any)
                  }
                />
              ))}
            </View>
          )}
        </View>
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
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
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
    copy: { lineHeight: 20 },
    primaryButton: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: { color: theme.colors.textOnAccent },
    supportRow: { gap: theme.spacing.sm },
    supportCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.md,
    },
    supportAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    supportAvatarText: { color: theme.colors.textMuted },
    supportBody: { flex: 1, minWidth: 0, gap: 2 },
    threadsSection: { gap: theme.spacing.sm },
    list: { gap: theme.spacing.sm },
    emptyCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    exploreButton: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.sm,
    },
  });
}
