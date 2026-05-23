import { AppText } from '@/src/components/ui/AppText';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
import { markThreadRead, sendMessage } from '../chat.api';
import { useChatInbox, useChatMessages } from '../chat.hooks';
import type { ChatMessage } from '../chat.types';

export function ThreadScreen() {
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const user = useAuthStore((state) => state.user);
  const uid = user?.uid ?? null;

  const { threads } = useChatInbox(uid);
  const thread = threads.find((t) => t.id === threadId) ?? null;
  const { messages, isLoading, error } = useChatMessages(threadId ?? null);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const isBuyer = thread?.buyerId === uid;
  const isClosed = thread?.status === 'closed';
  const listingTakenDown = false; // resolved from marketplace data if available

  useEffect(() => {
    if (!threadId || !uid || !thread) return;
    const role = thread.buyerId === uid ? 'buyer' : 'seller';
    markThreadRead(threadId, role).catch(() => null);
  }, [threadId, uid, thread]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollRef.current?.scrollToEnd({ animated: false });
    }
  }, [messages]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending || !threadId || !uid || !thread) return;
    setSending(true);
    setSendError(null);
    try {
      await sendMessage({
        threadId,
        senderId: uid,
        isBuyer: thread.buyerId === uid,
        text: trimmed,
      });
      setText('');
    } catch {
      setSendError('Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  }

  const inputDisabled = isClosed || listingTakenDown || sending;
  const inputPlaceholder = isClosed
    ? 'This thread is closed'
    : listingTakenDown
      ? 'Listing no longer available'
      : 'Type a message…';

  return (
    <AppShell showSwitcher={false} showBottomBar={false} reserveBottomBarSpace={false}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <AppText variant="button" tone="secondary">Back</AppText>
          </Pressable>
          <View style={styles.headerCenter}>
            <AppText variant="title" numberOfLines={1}>
              {thread ? (isBuyer ? 'Seller' : 'Buyer') : '…'}
            </AppText>
            {thread ? (
              <AppText variant="caption" tone="muted" numberOfLines={1}>
                {thread.listingTitle}
              </AppText>
            ) : null}
          </View>
          <View style={styles.backBtn} />
        </View>

        {isLoading ? (
          <LoadingState label="Loading messages…" />
        ) : error ? (
          <ErrorState
            title="Could not load messages"
            message="Check your connection and try again."
          />
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.length === 0 ? (
              <AppText variant="bodySmall" tone="muted" style={styles.emptyLabel}>
                No messages yet. Say hello!
              </AppText>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} uid={uid ?? ''} theme={theme} />
              ))
            )}
          </ScrollView>
        )}

        {sendError ? (
          <AppText variant="caption" tone="danger" style={styles.sendError}>
            {sendError}
          </AppText>
        ) : null}

        <View style={[styles.inputRow, { paddingBottom: insets.bottom + theme.spacing.sm }]}>
          <TextInput
            style={[
              styles.input,
              { color: inputDisabled ? theme.colors.textMuted : theme.colors.textPrimary },
            ]}
            value={text}
            onChangeText={setText}
            placeholder={inputPlaceholder}
            placeholderTextColor={theme.colors.textMuted}
            editable={!inputDisabled}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <Pressable
            style={[styles.sendBtn, (!text.trim() || sending || inputDisabled) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending || inputDisabled}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <AppText variant="button" style={styles.sendBtnText}>Send</AppText>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </AppShell>
  );
}

function MessageBubble({
  message,
  uid,
  theme,
}: {
  message: ChatMessage;
  uid: string;
  theme: ReturnType<typeof useThemeTokens>;
}) {
  const isMine = message.senderId === uid;
  const styles = createBubbleStyles(theme);

  if (message.deletedAtMs !== null) {
    return (
      <View style={[styles.wrap, isMine ? styles.wrapMine : styles.wrapTheirs]}>
        <AppText variant="caption" tone="muted" style={styles.deleted}>
          This message was removed
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, isMine ? styles.wrapMine : styles.wrapTheirs]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <AppText
          variant="bodySmall"
          style={isMine ? styles.textMine : styles.textTheirs}
        >
          {message.text}
        </AppText>
      </View>
      <AppText variant="caption" tone="muted" style={styles.time}>
        {formatTime(message.createdAtMs)}
      </AppText>
    </View>
  );
}

function formatTime(ms: number): string {
  if (!ms) return '';
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: theme.spacing.sm,
    },
    backBtn: { width: 56, alignItems: 'flex-start' },
    headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    emptyLabel: { textAlign: 'center', marginTop: theme.spacing.xxl },
    sendError: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xs,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    input: {
      flex: 1,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      maxHeight: 100,
      ...theme.typography.input,
    },
    sendBtn: {
      height: 44,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnDisabled: { opacity: 0.45 },
    sendBtnText: { color: '#FFFFFF' },
  });
}

function createBubbleStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    wrap: { maxWidth: '80%', gap: 2 },
    wrapMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    wrapTheirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
    bubble: {
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    bubbleMine: { backgroundColor: theme.colors.accent },
    bubbleTheirs: {
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    textMine: { color: theme.colors.textOnAccent },
    textTheirs: { color: theme.colors.textPrimary },
    time: { fontSize: 10, marginHorizontal: theme.spacing.xs },
    deleted: { fontStyle: 'italic' },
  });
}
