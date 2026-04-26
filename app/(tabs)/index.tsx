import { Screen } from '@/src/components/ui/Screen';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '800' }}>
          Home
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
          Tabs are working.
        </Text>
      </View>
    </Screen>
  );
}
