import { useThemeTokens } from '@/src/theme';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { appIcons, type AppIconKey } from './appIcons';

type AppIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
type AppIconTone =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'accent'
  | 'danger'
  | 'success'
  | 'warning'
  | 'inverse';

type AppIconVariant =
  | 'plain'
  | 'soft'
  | 'solid'
  | 'outline'
  | 'ghost';

type AppIconProps = {
  icon?: LucideIcon;
  name?: AppIconKey;
  size?: AppIconSize;
  tone?: AppIconTone;
  variant?: AppIconVariant;
  stroke?: 'thin' | 'regular' | 'medium' | 'bold';
  active?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function AppIcon({
  icon,
  name,
  size = 'md',
  tone = 'secondary',
  variant = 'plain',
  stroke = 'regular',
  active = false,
  disabled = false,
  onPress,
  style,
}: AppIconProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  const color = getIconColor(theme, tone, active, variant);
  const iconSize = theme.iconSizes[size];
  const strokeWidth = theme.iconStrokeWidths[stroke];
  const Icon = icon ?? (name ? appIcons[name] : null);

  if (!Icon) return null;

  const content = (
    <View
      style={[
        styles.base,
        variant !== 'plain' && styles.container,
        styles[variant],
        active && styles.active,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Icon color={color} size={iconSize} strokeWidth={strokeWidth} />
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      {content}
    </Pressable>
  );
}

function getIconColor(
  theme: ReturnType<typeof useThemeTokens>,
  tone: AppIconTone,
  active: boolean,
  variant: AppIconVariant
) {
  if (variant === 'solid') return '#FFFFFF';
  if (active) return theme.colors.accent;

  const map = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    muted: theme.colors.textMuted,
    accent: theme.colors.accent,
    danger: theme.colors.danger,
    success: theme.colors.success,
    warning: theme.colors.warning,
    inverse: '#FFFFFF',
  };

  return map[tone];
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    container: {
      width: theme.iconContainers.md.width,
      height: theme.iconContainers.md.height,
      borderRadius: theme.iconContainers.md.borderRadius,
    },
    plain: {
      backgroundColor: 'transparent',
    },
    soft: {
      backgroundColor: theme.colors.accentSoft,
    },
    solid: {
      backgroundColor: theme.colors.accent,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    ghost: {
      backgroundColor: theme.colors.card,
    },
    active: {
      backgroundColor: theme.colors.accentSoft,
    },
    disabled: {
      opacity: 0.45,
    },
  });
}
