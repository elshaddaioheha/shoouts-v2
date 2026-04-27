import { Screen } from '@/src/components/ui/Screen';
import { auth } from '@/src/config/firebase';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
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
  }

  return (
    <Screen keyboard>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Pressable style={styles.button} onPress={handleLogin} disabled={submitting}>
          <Text style={styles.buttonText}>{submitting ? 'Logging in...' : 'Login'}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    color: '#FFFFFF',
    paddingHorizontal: 14,
  },
  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#EC5C39',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
