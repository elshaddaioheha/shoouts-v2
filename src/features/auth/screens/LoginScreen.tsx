import { brandAssets } from '@/src/assets/brand';
import { useThemeTokens } from '@/src/theme';
import { fontFamily } from '@/src/theme/fonts';
import { useAppTheme } from '@/src/hooks/use-app-theme';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { SocialButton } from '@/src/features/auth/components/SocialButton';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { auth } from '@/src/config/firebase';

export function LoginScreen() {
  const themeTokens = useThemeTokens();
  const styles = createStyles(themeTokens);
  const appTheme = useAppTheme();
  const isLightMode = !appTheme.isDark;
  const lightBackground = '#FFF4EE';
  const lightSurface = '#FFF9F6';
  const lightText = '#2F2624';
  const lightMutedText = '#6F5A53';
  const lightBorder = '#D8B9AD';

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;

    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/');
    } catch {
      Alert.alert('Login failed', 'Check your email and password, then try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert('Coming soon', 'Google Sign-In will be added after the stable UI migration.');
  };

  const handleAppleLogin = () => {
    Alert.alert('Coming soon', 'Apple Sign-In will be added after the stable UI migration.');
  };

  const goGuestHome = () => {
    router.replace('/(tabs)');
  };

  const handleForgotPassword = () => {
    Alert.alert('Coming soon', 'Forgot Password will be available soon.');
  };

  const emailInputAnimatedStyle = {
    borderColor: appTheme.colors.primary,
  };

  const passwordInputAnimatedStyle = {
    borderColor: appTheme.colors.primary,
  };

  return (
    <View style={[styles.container, isLightMode && { backgroundColor: lightBackground }]}>
      <StatusBar barStyle={appTheme.isDark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.guestRow}>
            <TouchableOpacity onPress={goGuestHome}>
              <Text style={[styles.guestText, isLightMode && { color: lightMutedText }]}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logoContainer}>
            <View style={styles.logoRow}>
              <Image source={brandAssets.mark} style={styles.logoMark} resizeMode="contain" />
              <Text style={[styles.logoText, isLightMode && { color: lightText }]}>Shoouts</Text>
            </View>
          </View>

          <Text style={[styles.title, isLightMode && { color: lightText }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, isLightMode && { color: lightMutedText }]}>Log in to your account</Text>

          <View style={styles.socialContainer}>
            {Platform.OS === 'ios' && (
              <SocialButton icon={<AppleIcon color={isLightMode ? '#2F2624' : '#FFFFFF'} />} text="Login with Apple" onPress={handleAppleLogin} isLight={isLightMode} />
            )}
            <SocialButton icon={<GoogleIcon />} text="Login with Google" onPress={handleGoogleLogin} isLight={isLightMode} />
          </View>

          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, isLightMode && { backgroundColor: lightBorder }]} />
            <Text style={[styles.dividerText, isLightMode && { color: lightMutedText }]}>Or use email</Text>
            <View style={[styles.dividerLine, isLightMode && { backgroundColor: lightBorder }]} />
          </View>

          <View style={styles.form}>
            <View style={[styles.input, isLightMode && { backgroundColor: lightSurface, borderColor: lightBorder }, emailInputAnimatedStyle]}>
              <TextInput
                style={[styles.inputText, isLightMode && { color: lightText }]}
                placeholder="Email Address"
                placeholderTextColor={appTheme.colors.textPlaceholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
            </View>

            <View style={[styles.passwordContainer, isLightMode && { backgroundColor: lightSurface, borderColor: lightBorder }, passwordInputAnimatedStyle]}>
              <TextInput
                ref={passwordInputRef}
                style={[styles.inputText, { paddingRight: 50 }, isLightMode && { color: lightText }]}
                placeholder="Password"
                placeholderTextColor={appTheme.colors.textPlaceholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                {showPassword ? (
                  <Eye color={isLightMode ? lightMutedText : appTheme.colors.textPrimary} size={24} />
                ) : (
                  <EyeOff color={isLightMode ? lightMutedText : appTheme.colors.textPrimary} size={24} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: appTheme.colors.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              style={[styles.loginButton, { backgroundColor: appTheme.colors.primary }]}
              activeOpacity={0.8}
              disabled={submitting}
            >
              <Text style={styles.loginButtonText}>{submitting ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, isLightMode && { color: lightMutedText }]}>{"Don't have an account? "}</Text>
            <TouchableOpacity onPress={() => Alert.alert('Coming soon', 'Sign up will be available soon.')}>
              <Text style={[styles.registerText, { color: appTheme.colors.primary }]}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function AppleIcon({ color = '#FFFFFF' }: { color?: string }) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
        fill={color}
      />
    </Svg>
  );
}

function GoogleIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: 33,
      paddingTop: 60,
      paddingBottom: 40,
      alignItems: 'center',
    },
    guestRow: {
      width: '100%',
      alignItems: 'flex-end',
      marginBottom: 12,
    },
    guestText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontFamily: fontFamily.workSansRegular,
    },
    logoContainer: {
      width: 256,
      minHeight: 64,
      marginBottom: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    logoMark: {
      width: 36,
      height: 36,
    },
    logoText: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontFamily: fontFamily.interSemiBold,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 32,
      fontFamily: fontFamily.interSemiBold,
      lineHeight: 51,
      textAlign: 'center',
      letterSpacing: -0.5,
      marginBottom: 15,
    },
    subtitle: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontFamily: fontFamily.workSansRegular,
      lineHeight: 25,
      textAlign: 'center',
      letterSpacing: -0.5,
      marginBottom: 27,
    },
    socialContainer: {
      width: '100%',
      gap: 12,
      marginBottom: 17,
    },
    socialButton: {
      width: '100%',
      height: 56,
      borderWidth: 1.5,
      borderColor: theme.colors.cardBorder,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    socialButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontFamily: fontFamily.workSansRegular,
      letterSpacing: -0.5,
    },
    dividerContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 1,
      marginBottom: 16,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.cardBorder,
    },
    dividerText: {
      flex: 2,
      color: theme.colors.textMuted,
      fontSize: 13,
      fontFamily: fontFamily.workSansRegular,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    form: {
      width: '100%',
      gap: 16,
      marginBottom: 23,
    },
    input: {
      width: '100%',
      height: 56,
      paddingHorizontal: 16,
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.cardBorder,
      borderRadius: 10,
      justifyContent: 'center',
    },
    inputText: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontFamily: fontFamily.workSansRegular,
      height: '100%',
      paddingVertical: 0,
    },
    passwordContainer: {
      position: 'relative',
      width: '100%',
      height: 56,
      paddingHorizontal: 16,
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.cardBorder,
      borderRadius: 10,
      justifyContent: 'center',
    },
    eyeIcon: {
      position: 'absolute',
      right: 15,
      top: 16,
    },
    actionContainer: {
      width: '100%',
      alignItems: 'flex-end',
      gap: 24,
      marginBottom: 23,
    },
    forgotPasswordText: {
      fontSize: 15,
      fontFamily: fontFamily.workSansRegular,
      lineHeight: 25,
      letterSpacing: -0.5,
    },
    loginButton: {
      width: '100%',
      height: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#D32626',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontFamily: fontFamily.interSemiBold,
    },
    footer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    footerText: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontFamily: fontFamily.workSansRegular,
      lineHeight: 25,
      letterSpacing: -0.5,
    },
    registerText: {
      fontSize: 15,
      fontFamily: fontFamily.interSemiBold,
    },
  });
}
