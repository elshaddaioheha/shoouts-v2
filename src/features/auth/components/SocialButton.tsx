import { useThemeTokens } from '@/src/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface SocialButtonProps {
  icon: React.ReactNode;
  text: string;
  onPress?: () => void;
  isLight: boolean;
}

export function SocialButton({ icon, text, onPress, isLight }: SocialButtonProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme, isLight);

  return (
    <TouchableOpacity style={styles.socialButton} onPress={onPress}>
      {icon}
      <Text style={styles.socialButtonText}>{text}</Text>
    </TouchableOpacity>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>, isLight: boolean) {
  return StyleSheet.create({
    socialButton: {
      width: '100%',
      height: 56,
      borderWidth: 1.5,
      borderColor: isLight ? '#D8B9AD' : theme.colors.cardBorder,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: isLight ? '#FFF9F6' : 'transparent',
    },
    socialButtonText: {
      color: isLight ? '#2F2624' : theme.colors.textPrimary,
      fontSize: 15,
      fontFamily: 'Poppins-Regular',
      letterSpacing: -0.5,
    },
  });
}
