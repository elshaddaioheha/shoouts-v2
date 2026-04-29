import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import {
  canAccessExperience,
  canPreviewExperience,
} from '@/src/features/access/access.helpers';
import type { AppExperience } from '@/src/features/access/access.types';
import { useAccountStore } from '@/src/features/account/account.store';
import { EXPERIENCE_NAVIGATION } from '@/src/features/navigation/navigation.config';
import { useExperienceNavigationStore } from '@/src/features/navigation/navigation.store';
import { layout, useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const experiences: AppExperience[] = ['shoouts', 'vault', 'studio', 'hybrid'];
const appIconAsset = require('@/assets/images/icon.png');

const experienceDescriptions: Record<AppExperience, string> = {
  shoouts: 'Marketplace listening and buying.',
  vault: 'Private workspace for ideas and drafts.',
  studio: 'Seller tools for publishing and growth.',
  hybrid: 'Vault and Studio combined.',
};

type ActiveSheet = 'workspace' | 'messages' | 'notifications' | null;

export function ExperienceSwitcher() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const role = useAccountStore((state) => state.role);
  const activeExperience = useExperienceNavigationStore((state) => state.activeExperience);
  const setActiveExperience = useExperienceNavigationStore((state) => state.setActiveExperience);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);

  const activeConfig = EXPERIENCE_NAVIGATION[activeExperience];
  const activeUnlocked = canAccessExperience(role, activeExperience);

  function handleSwitch(experience: AppExperience) {
    if (!canPreviewExperience(role, experience)) return;

    setActiveExperience(experience);
    setActiveSheet(null);
    router.replace(EXPERIENCE_NAVIGATION[experience].defaultRoute as any);
  }

  return (
    <>
      <View
        style={[
          styles.wrapper,
          {
            minHeight: layout.topSwitcherHeight + insets.top,
            paddingTop: insets.top + theme.spacing.sm,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => setActiveSheet('workspace')}
            style={({ pressed }) => [
              styles.trigger,
              pressed ? styles.triggerPressed : undefined,
            ]}
          >
            <Image source={appIconAsset} style={styles.logo} resizeMode="cover" />

            <View style={styles.triggerTextWrap}>
              <AppText variant="navItem" style={styles.triggerText}>
                {activeConfig.label}
              </AppText>
              {!activeUnlocked ? (
                <AppText variant="caption" tone="accent">
                  Preview
                </AppText>
              ) : null}
            </View>

            <AppIcon name="chevronDown" size="sm" tone="secondary" variant="plain" />
          </Pressable>

          <View style={styles.headerActions}>
            <HeaderActionButton
              icon="messages"
              onPress={() => setActiveSheet('messages')}
            />
            <HeaderActionButton
              icon="notifications"
              onPress={() => setActiveSheet('notifications')}
            />
          </View>
        </View>
      </View>

      <SheetModal
        visible={activeSheet === 'workspace'}
        onClose={() => setActiveSheet(null)}
        title="Switch workspace"
        description="Choose the subscription workspace you want to use right now."
      >
        <View style={styles.optionList}>
          {experiences.map((experience) => {
            const config = EXPERIENCE_NAVIGATION[experience];
            const isActive = activeExperience === experience;
            const unlocked = canAccessExperience(role, experience);
            const previewable = canPreviewExperience(role, experience);

            return (
              <Pressable
                key={experience}
                onPress={() => handleSwitch(experience)}
                disabled={!previewable}
                style={({ pressed }) => [
                  styles.option,
                  isActive ? styles.optionActive : undefined,
                  !previewable ? styles.optionDisabled : undefined,
                  pressed ? styles.optionPressed : undefined,
                ]}
              >
                <View style={styles.optionBody}>
                  <View style={styles.optionTitleRow}>
                    <AppText
                      variant="title"
                      style={isActive ? styles.optionTitleActive : undefined}
                    >
                      {config.label}
                    </AppText>
                    {!unlocked ? (
                      <View style={styles.previewBadge}>
                        <AppText variant="caption" tone="accent">
                          Preview
                        </AppText>
                      </View>
                    ) : null}
                  </View>

                  <AppText
                    variant="bodySmall"
                    tone={isActive ? 'primary' : 'secondary'}
                    style={isActive ? styles.optionDescriptionActive : undefined}
                  >
                    {experienceDescriptions[experience]}
                  </AppText>
                </View>

                <View style={[styles.optionMeta, isActive ? styles.optionMetaActive : undefined]}>
                  {isActive ? (
                    <AppText variant="caption" style={styles.optionMetaActiveText}>
                      Live
                    </AppText>
                  ) : (
                    <AppIcon name="more" size="sm" tone="muted" variant="plain" />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </SheetModal>

      <SheetModal
        visible={activeSheet === 'messages'}
        onClose={() => setActiveSheet(null)}
        title="Messages"
        description="Conversation tools will land here once the shared header is stable."
      >
        <View style={styles.placeholderCard}>
          <AppText variant="title">Messages are coming next</AppText>
          <AppText variant="bodySmall" tone="secondary" style={styles.placeholderText}>
            This placeholder lets us test the shared header interaction without adding route noise yet.
          </AppText>
        </View>
      </SheetModal>

      <SheetModal
        visible={activeSheet === 'notifications'}
        onClose={() => setActiveSheet(null)}
        title="Notifications"
        description="Updates and alerts will land here once the header shell is locked."
      >
        <View style={styles.placeholderCard}>
          <AppText variant="title">Notifications are coming next</AppText>
          <AppText variant="bodySmall" tone="secondary" style={styles.placeholderText}>
            We can wire this into updates and activity after the home migration.
          </AppText>
        </View>
      </SheetModal>
    </>
  );
}

function HeaderActionButton({
  icon,
  onPress,
}: {
  icon: 'messages' | 'notifications';
  onPress: () => void;
}) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        pressed ? styles.actionButtonPressed : undefined,
      ]}
    >
      <AppIcon name={icon} size="md" tone="secondary" variant="plain" />
    </Pressable>
  );
}

function SheetModal({
  visible,
  onClose,
  title,
  description,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            { paddingBottom: theme.spacing.lg + insets.bottom },
          ]}
        >
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <AppText variant="sectionHeading">{title}</AppText>
            <AppText variant="bodySmall" tone="secondary">
              {description}
            </AppText>
          </View>

          {children}
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    wrapper: {
      width: '100%',
      backgroundColor: theme.colors.background,
      paddingBottom: theme.spacing.sm,
    },
    headerRow: {
      paddingHorizontal: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    trigger: {
      minWidth: 142,
      maxWidth: 196,
      minHeight: 44,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingHorizontal: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    triggerPressed: {
      backgroundColor: theme.colors.card,
    },
    logo: {
      width: 28,
      height: 28,
      borderRadius: 14,
      flexShrink: 0,
    },
    triggerTextWrap: {
      flexShrink: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    triggerText: {
      flexShrink: 1,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    actionButtonPressed: {
      backgroundColor: theme.colors.card,
    },
    modalRoot: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(15, 23, 42, 0.24)',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    sheet: {
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
    sheetHandle: {
      alignSelf: 'center',
      width: 46,
      height: 5,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.border,
      marginBottom: theme.spacing.lg,
    },
    sheetHeader: {
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.lg,
    },
    optionList: {
      gap: theme.spacing.sm,
    },
    option: {
      minHeight: 72,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    optionActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    optionDisabled: {
      opacity: 0.45,
    },
    optionPressed: {
      opacity: 0.92,
    },
    optionBody: {
      flex: 1,
      minWidth: 0,
      gap: theme.spacing.xs,
    },
    optionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    optionTitleActive: {
      color: '#FFFFFF',
    },
    optionDescriptionActive: {
      color: '#FFFFFF',
    },
    previewBadge: {
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.accentSoft,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
    },
    optionMeta: {
      minWidth: 38,
      height: 32,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm,
    },
    optionMetaActive: {
      backgroundColor: 'rgba(255,255,255,0.18)',
    },
    optionMetaActiveText: {
      color: '#FFFFFF',
    },
    placeholderCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
    },
    placeholderText: {
      marginTop: theme.spacing.sm,
    },
  });
}
