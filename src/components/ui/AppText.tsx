import { useThemeTokens } from '@/src/theme';
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';

type AppTextVariant =
  | 'sectionHeading'
  | 'pageHeading'
  | 'title'
  | 'caption'
  | 'input'
  | 'navItem'
  | 'button'
  | 'body'
  | 'bodySmall';

type AppTextTone =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'accent'
  | 'danger'
  | 'success'
  | 'warning';

type AppTextProps = TextProps & {
  children: ReactNode;
  variant?: AppTextVariant;
  tone?: AppTextTone;
  style?: StyleProp<TextStyle>;
};

export function AppText({
  children,
  variant = 'body',
  tone = 'primary',
  style,
  ...props
}: AppTextProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  return (
    <Text
      {...props}
      style={[styles.base, styles[variant], styles[tone], style]}
    >
      {children}
    </Text>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    base: {
      color: theme.colors.textPrimary,
    },

    sectionHeading: theme.typography.sectionHeading,
    pageHeading: theme.typography.pageHeading,
    title: theme.typography.title,
    caption: theme.typography.caption,
    input: theme.typography.input,
    navItem: theme.typography.navItem,
    button: theme.typography.button,
    body: theme.typography.body,
    bodySmall: theme.typography.bodySmall,

    primary: {
      color: theme.colors.textPrimary,
    },
    secondary: {
      color: theme.colors.textSecondary,
    },
    muted: {
      color: theme.colors.textMuted,
    },
    accent: {
      color: theme.colors.accent,
    },
    danger: {
      color: theme.colors.danger,
    },
    success: {
      color: theme.colors.success,
    },
    warning: {
      color: theme.colors.warning,
    },
  });
}
