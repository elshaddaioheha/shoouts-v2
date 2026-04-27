import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const moreOptions = [
  {
    title: 'Downloads',
    description: 'View purchased and free-downloadable beats.',
    route: '/downloads',
  },
  {
    title: 'Purchase History',
    description: 'Review your past beat purchases.',
    route: '/purchases',
  },
  {
    title: 'Saved & Favourites',
    description: 'Your liked beats and saved creators.',
    route: '/saved',
  },
  {
    title: 'Messages',
    description: 'Buyer and seller conversations.',
    route: '/messages',
  },
  {
    title: 'Subscriptions',
    description: 'Manage Shoouts, Vault, Studio, and Hybrid access.',
    route: '/settings/subscriptions',
  },
  {
    title: 'Settings',
    description: 'Account, privacy, preferences, and support.',
    route: '/settings',
  },
];

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 130,
    },
    eyebrow: {
      color: theme.colors.accent,
      fontSize: 13,
      fontWeight: '900',
      marginBottom: 8,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 30,
      fontWeight: '900',
    },
    subtitle: {
      color: theme.colors.textSecondary,
      marginTop: 8,
      lineHeight: 21,
      marginBottom: 22,
    },
    list: {
      gap: 12,
    },
    card: {
      minHeight: 82,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    cardTitle: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '900',
    },
    cardText: {
      color: theme.colors.textSecondary,
      marginTop: 4,
      lineHeight: 19,
    },
    chevron: {
      color: theme.colors.textMuted,
      fontSize: 30,
      fontWeight: '300',
    },
  });
}

export function MoreScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>More</Text>
        <Text style={styles.title}>Account & tools</Text>
        <Text style={styles.subtitle}>
          Manage downloads, purchases, subscriptions, settings, and support.
        </Text>

        <View style={styles.list}>
          {moreOptions.map((option) => (
            <Pressable
              key={option.title}
              style={styles.card}
              onPress={() => router.push(option.route as any)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{option.title}</Text>
                <Text style={styles.cardText}>{option.description}</Text>
              </View>

              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </AppShell>
  );
}



