import { AppShell } from '@/src/features/navigation/components/AppShell';
import { Text, View } from 'react-native';

export default function CartScreen() {
  return (
    <AppShell>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '800' }}>
          Cart
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
          Cart workspace coming next.
        </Text>
      </View>
    </AppShell>
  );
}
