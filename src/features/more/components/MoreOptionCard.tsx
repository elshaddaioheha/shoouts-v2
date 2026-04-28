import { AppText } from '@/src/components/ui/AppText';
import { useThemeTokens } from '@/src/theme';
import { ChevronRight } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type MoreOptionCardProps = {
  title: string;
  description: string;
  value?: string;
  icon?: ComponentType<{ color?: string; size?: number }>;
  onPress: () => void;
};

export function MoreOptionCard({
  title,
  description,
  value,
  icon: Icon,
  onPress,
}: MoreOptionCardProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.cardPressed : undefined,
      ]}
    >
      {Icon ? (
        <View style={styles.iconWrap}>
          <Icon size={20} color={theme.colors.accent} />
        </View>
      ) : null}

      <View style={styles.textGroup}>
        <AppText variant="title" numberOfLines={1}>
          {title}
        </AppText>

        <AppText variant="bodySmall" tone="secondary" numberOfLines={2}>
          {description}
        </AppText>
      </View>

      {value ? (
        <AppText variant="caption" tone="muted" numberOfLines={1} style={styles.value}>
          {value}
        </AppText>
      ) : null}

      <View style={styles.chevronWrap}>
        <ChevronRight size={18} color={theme.colors.textMuted} />
      </View>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    card: {
      minHeight: theme.layout.minTouchTarget + theme.spacing.lg,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      ...theme.shadows.md,
    },
    cardPressed: {
      backgroundColor: theme.colors.surfacePressed,
      borderColor: theme.colors.borderStrong,
    },
    textGroup: {
      flex: 1,
      gap: theme.spacing.xs,
      minWidth: 0,
    },
    iconWrap: {
      width: theme.layout.minTouchTarget,
      height: theme.layout.minTouchTarget,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    value: {
      maxWidth: 96,
      flexShrink: 1,
    },
    chevronWrap: {
      width: theme.spacing.xl,
      alignItems: 'flex-end',
      justifyContent: 'center',
      flexShrink: 0,
    },
  });
}
