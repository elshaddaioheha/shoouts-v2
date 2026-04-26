import { Screen } from '@/src/components/ui/Screen';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function OnboardingScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Shoout</Text>
        <Text style={styles.subtitle}>Stable shell is running.</Text>

        <Pressable style={styles.button} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.buttonText}>Go to Login</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.secondaryText}>Continue to App</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#EC5C39',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  secondaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
