import { AppText } from '@/src/components/ui/AppText';
import { useThemeTokens } from '@/src/theme';
import { Pressable, StyleSheet, View } from 'react-native';
import type { ChatThread } from '../chat.types';

type Props = {
  thread: ChatThread;
  uid: string;
  onPress: () => void;
};

export function ThreadRow({ thread, uid, onPress }: Props) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const unread = thread.buyerId === uid ? thread.unreadCountBuyer : thread.unreadCountSeller;
  const hasUnread = unread > 0;
  const isClosed = thread.status === 'closed';
  const otherName = thread.buyerId === uid ? 'Seller' : 'Buyer';
  const timeLabel = formatTime(thread.lastMessageAtMs);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.avatar, isClosed && styles.avatarClosed]}>
        <AppText variant="caption" style={styles.avatarText}>
          {otherName[0]}
        </AppText>
      </View>

      <View style={styles.body}>
        <View style={styles.topLine}>
          <AppText variant="title" numberOfLines={1} style={styles.name}>
            {otherName}
          </AppText>
          <AppText variant="caption" tone="muted">{timeLabel}</AppText>
        </View>
        <AppText variant="caption" tone="muted" numberOfLines={1} style={styles.listing}>
          {thread.listingTitle}
        </AppText>
        <AppText
          variant="bodySmall"
          tone={hasUnread ? 'primary' : 'secondary'}
          numberOfLines={1}
          style={[styles.snippet, hasUnread && styles.snippetUnread]}
        >
          {thread.lastMessageText || '…'}
        </AppText>
      </View>

      {hasUnread ? (
        <View style={styles.badge}>
          <AppText variant="caption" style={styles.badgeText}>
            {unread > 9 ? '9+' : String(unread)}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

function formatTime(ms: number): string {
  if (!ms) return '';
  const diff = Date.now() - ms;
  if (diff < 60_000) return 'now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.md,
    },
    rowPressed: { opacity: 0.75 },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    avatarClosed: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    avatarText: { color: theme.colors.accent },
    body: { flex: 1, minWidth: 0, gap: 2 },
    topLine: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    name: { flex: 1 },
    listing: { marginBottom: 1 },
    snippet: { lineHeight: 18 },
    snippetUnread: { color: theme.colors.textPrimary },
    badge: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
      flexShrink: 0,
    },
    badgeText: { color: theme.colors.textOnAccent, fontSize: 11 },
  });
}
