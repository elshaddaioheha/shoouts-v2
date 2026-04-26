import { Screen } from '@/src/components/ui/Screen';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ExploreScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Minimal route for launch testing.</Text>

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Ready</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 16,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#EC5C39',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
