import { PropsWithChildren } from 'react';
import { SafeAreaView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type ScreenProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  withSafeArea?: boolean;
}>;

export function Screen({ children, style, withSafeArea = true }: ScreenProps) {
  if (withSafeArea) {
    return <SafeAreaView style={[styles.base, style]}>{children}</SafeAreaView>;
  }

  return <View style={[styles.base, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
});
