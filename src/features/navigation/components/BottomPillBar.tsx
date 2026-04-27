import { EXPERIENCE_NAVIGATION } from '@/src/features/navigation/navigation.config';
import { useExperienceNavigationStore } from '@/src/features/navigation/navigation.store';
import { router, usePathname } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function BottomPillBar() {
  const pathname = usePathname();
  const activeExperience = useExperienceNavigationStore((state) => state.activeExperience);
  const config = EXPERIENCE_NAVIGATION[activeExperience];

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {config.tabs.map((item) => {
          const active =
            pathname === item.route ||
            (item.route !== '/(tabs)' && pathname.startsWith(item.route));

          return (
            <Pressable
              key={item.key}
              onPress={() => router.replace(item.route as any)}
              style={[styles.item, active && styles.activeItem]}
            >
              <Text style={[styles.label, active && styles.activeLabel]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    minHeight: 58,
    borderRadius: 999,
    backgroundColor: 'rgba(20,15,16,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  item: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  activeItem: {
    backgroundColor: '#EC5C39',
  },
  label: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    fontWeight: '700',
  },
  activeLabel: {
    color: '#FFFFFF',
  },
});
