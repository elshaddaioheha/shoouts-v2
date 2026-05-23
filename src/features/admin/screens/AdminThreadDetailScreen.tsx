import { AppText } from '@/src/components/ui/AppText';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import {
  closeThread,
  flagThread,
  reopenThread,
  softDeleteMessage,
  subscribeToAdminThreads,
} from '@/src/features/admin/admin.api';
import type { ChatThread } from '@/src/features/chat/chat.types';
import { subscribeToMessages } from '@/src/features/chat/chat.api';
import type { ChatMessage } from '@/src/features/chat/chat.types';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { useThemeTokens } from '@/src/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export function AdminThreadDetailScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToAdminThreads('all', (threads) => {
      const found = threads.find((t) => t.id === id);
      if (found) setThread(found);
    }, () => null);
    return unsub;
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToMessages(id, setMessages, () => null);
    return unsub;
  }, [id]);

  async function handleFlag() {
    if (!user || !id) return;
    setActioning('flag');
    try { await flagThread(id, user.uid); } finally { setActioning(null); }
  }

  async function handleClose() {
    if (!id) return;
    setActioning('close');
    try { await closeThread(id); } finally { setActioning(null); }
  }

  async function handleReopen() {
    if (!id) return;
    setActioning('reopen');
    try { await reopenThread(id); } finally { setActioning(null); }
  }

  async function handleDeleteMessage(messageId: string) {
    if (!id) return;
    setActioning(`msg-${messageId}`);
    try { await softDeleteMessage(id, messageId); } finally { setActioning(null); }
  }

  if (!thread) {
    return (
      <AppShell showBottomBar={false} reserveBottomBarSpace={false}>
        <View style={styles.center}><ActivityIndicator color={theme.colors.accent} /></View>
      </AppShell>
    );
  }

  return (
    <AppShell showBottomBar={false} reserveBottomBarSpace={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()}>
          <AppText variant="button" tone="secondary" style={styles.back}>Back</AppText>
        </Pressable>

        <AppText variant="eyebrow" tone="accent">Thread</AppText>
        <AppText variant="pageHeading" numberOfLines={1}>{thread.listingTitle}</AppText>

        <View style={styles.metaCard}>
          <MetaRow label="Status" value={thread.status} />
          <MetaRow label="Buyer" value={thread.buyerId} />
          <MetaRow label="Seller" value={thread.sellerId} />
          <MetaRow label="Listing ID" value={thread.listingId} />
        </View>

        <View style={styles.threadActions}>
          {thread.status !== 'flagged' ? (
            <ActionButton
              label="Flag thread"
              loading={actioning === 'flag'}
              onPress={handleFlag}
              styles={styles}
              theme={theme}
              variant="warning"
            />
          ) : null}
          {thread.status !== 'closed' ? (
            <ActionButton
              label="Close thread"
              loading={actioning === 'close'}
              onPress={handleClose}
              styles={styles}
              theme={theme}
            />
          ) : (
            <ActionButton
              label="Reopen thread"
              loading={actioning === 'reopen'}
              onPress={handleReopen}
              styles={styles}
              theme={theme}
            />
          )}
          <Pressable
            style={styles.linkButton}
            onPress={() =>
              router.push({
                pathname: '/admin/listings',
                params: { highlightId: thread.listingId, ownerUid: thread.sellerId },
              } as any)
            }
          >
            <AppText variant="button" tone="accent">View listing →</AppText>
          </Pressable>
        </View>

        <AppText variant="sectionHeading" style={styles.sectionTitle}>
          Messages ({messages.length})
        </AppText>

        {messages.map((message) => (
          <View key={message.id} style={styles.messageRow}>
            <View style={styles.messageMeta}>
              <AppText variant="caption" tone="muted">
                {message.senderId.slice(0, 10)}…
              </AppText>
              <AppText variant="caption" tone="muted">
                {new Date(message.createdAtMs).toLocaleTimeString()}
              </AppText>
            </View>
            {message.deletedAtMs ? (
              <AppText variant="caption" tone="muted" style={styles.tombstone}>
                [Removed]
              </AppText>
            ) : (
              <View style={styles.messageContent}>
                <AppText variant="bodySmall" style={styles.messageText}>
                  {message.text}
                </AppText>
                <Pressable
                  style={styles.deleteMessageButton}
                  onPress={() => handleDeleteMessage(message.id)}
                  disabled={actioning === `msg-${message.id}`}
                >
                  {actioning === `msg-${message.id}` ? (
                    <ActivityIndicator size="small" color={theme.colors.textMuted} />
                  ) : (
                    <AppText variant="caption" tone="muted">Remove</AppText>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </AppShell>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  const theme = useThemeTokens();
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline' }}>
      <AppText variant="caption" tone="muted" style={{ width: 72, flexShrink: 0 }}>{label}</AppText>
      <AppText variant="caption" style={{ flex: 1, color: theme.colors.textPrimary }} numberOfLines={1}>{value}</AppText>
    </View>
  );
}

function ActionButton({
  label,
  loading,
  onPress,
  styles,
  theme,
  variant,
}: {
  label: string;
  loading: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof useThemeTokens>;
  variant?: 'warning';
}) {
  return (
    <Pressable
      style={[styles.actionButton, variant === 'warning' && { borderColor: '#FF4D4D55' }]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.textMuted} />
      ) : (
        <AppText variant="button" style={variant === 'warning' ? { color: '#FF4D4D' } : undefined}>
          {label}
        </AppText>
      )}
    </Pressable>
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
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    back: { marginBottom: theme.spacing.sm },
    metaCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    threadActions: { gap: theme.spacing.sm },
    actionButton: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    linkButton: {
      minHeight: theme.layout.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: { marginTop: theme.spacing.sm },
    messageRow: {
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    messageMeta: { flexDirection: 'row', justifyContent: 'space-between' },
    tombstone: { fontStyle: 'italic' },
    messageContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    messageText: { flex: 1, color: theme.colors.textPrimary },
    deleteMessageButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      flexShrink: 0,
    },
  });
}
