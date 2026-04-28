import { useAppTheme } from '@/src/hooks/use-app-theme';
import { useReducedMotion } from '@/src/hooks/use-reduced-motion';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingSlide = {
  key: string;
  kicker?: string;
  lines: Array<Array<{ text: string; accent: boolean }>>;
  body: string;
  asset: any;
  imageScale: number;
};

const slides: OnboardingSlide[] = [
  {
    key: 'heartbeat',
    lines: [[{ text: 'Welcome to the', accent: false }], [{ text: 'heartbeat of', accent: false }, { text: '', accent: false }], [{ text: 'Afro music', accent: true }]],
    body: 'Discover. Create. Share. The Afro sound starts with you',
    asset: require('@/assets/images/welcome-1.png'),
    imageScale: 0.98,
  },
  {
    key: 'discover',
    lines: [[{ text: 'Discover, Create,', accent: true }], [{ text: 'and ', accent: false }, { text: 'Share', accent: true }]],
    body: 'the sounds that move the world.',
    asset: require('@/assets/images/welcome-2.png'),
    imageScale: 1.02,
  },
  {
    key: 'journey',
    kicker: "Whether you're an artist or a fan,",
    lines: [[{ text: 'your ', accent: false }, { text: 'Journey', accent: true }], [{ text: 'Starts ', accent: false }, { text: 'Here.', accent: true }]],
    body: 'Start with discovery, then shape the Shoouts experience that fits you best.',
    asset: require('@/assets/images/welcome-3.png'),
    imageScale: 0.92,
  },
];

const ProgressPill = ({
  index,
  scrollX,
  appTheme,
}: {
  index: number;
  scrollX: SharedValue<number>;
  appTheme: any;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const minWidth = 8;
    const maxWidth = 58;

    const width = interpolate(
      scrollX.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [minWidth, maxWidth, minWidth],
      Extrapolation.CLAMP
    );

    const backgroundColor = interpolateColor(
      scrollX.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [
        appTheme.isDark ? '#504A4A' : '#D8CFCC',
        appTheme.colors.primary,
        appTheme.isDark ? '#504A4A' : '#D8CFCC',
      ]
    );

    return {
      width,
      backgroundColor,
    };
  });

  return <Animated.View style={[styles.progressPill, animatedStyle]} />;
};

const SlideItem = ({ slide, appTheme }: { slide: OnboardingSlide; appTheme: any }) => {
  return (
    <View style={[styles.slideContainer, { width: SCREEN_WIDTH }]}>
      <View style={styles.header}>
        {slide.kicker ? <Text style={[styles.kicker, { color: appTheme.colors.textSecondary }]}>{slide.kicker}</Text> : null}

        <View style={styles.titleBlock}>
          {slide.lines.map((line, lineIndex) => (
            <Text key={`${slide.key}-line-${lineIndex}`} style={[styles.title, { color: appTheme.colors.textPrimary }]}> 
              {line.map((part, partIndex) => (
                <Text
                  key={`${slide.key}-part-${lineIndex}-${partIndex}`}
                  style={{ color: part.accent ? appTheme.colors.primary : appTheme.colors.textPrimary }}
                >
                  {part.text}
                </Text>
              ))}
            </Text>
          ))}
        </View>

        <Text style={[styles.body, { color: appTheme.colors.textSecondary }]}>{slide.body}</Text>
      </View>

      <View style={styles.imageStage}>
        <View style={[styles.imageWrap, { transform: [{ scale: slide.imageScale }] }]}>
          <Image source={slide.asset} style={styles.image} resizeMode="contain" />
        </View>
      </View>
    </View>
  );
};

export function OnboardingScreen() {
  const appTheme = useAppTheme();
  const reduceMotion = useReducedMotion();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<Animated.FlatList<OnboardingSlide>>(null);
  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleSkip = () => {
    router.push('/(auth)/login');
  };

  const finishOnboarding = () => {
    router.push('/(auth)/role-selection');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      try {
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: !reduceMotion });
      } catch {
        // scrollToIndex can fail if measurements are not ready; fallback to offset
        flatListRef.current?.scrollToOffset({ offset: nextIndex * SCREEN_WIDTH, animated: !reduceMotion });
      }
    } else {
      finishOnboarding();
    }
  };

  const goToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: !reduceMotion,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background }]}> 
      <StatusBar barStyle={appTheme.isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.inner}>
        <Animated.FlatList
          ref={flatListRef}
          data={slides}
          renderItem={({ item }) => <SlideItem slide={item} appTheme={appTheme} />}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />

        <View style={styles.bottomSection}>
          <View style={styles.progressRow}>
            {slides.map((_, index) => (
              <Pressable key={`progress-${index}`} onPress={() => goToIndex(index)} hitSlop={10}>
                <ProgressPill index={index} scrollX={scrollX} appTheme={appTheme} />
              </Pressable>
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSkip} activeOpacity={0.8}>
              <Text style={[styles.skipText, { color: appTheme.colors.textPrimary }]}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: appTheme.colors.primary }]}
              activeOpacity={0.9}
              onPress={handleNext}
            >
              <Text style={[styles.nextText, { color: appTheme.colors.textPrimary }]}>{currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
              <Text style={[styles.nextArrow, { color: appTheme.colors.textPrimary }]}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 36,
  },
  slideContainer: {
    paddingHorizontal: 20,
  },
  header: {
    gap: 14,
  },
  kicker: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  titleBlock: {
    gap: 2,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  body: {
    maxWidth: 320,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 26,
  },
  bottomSection: {
    paddingHorizontal: 20,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  progressPill: {
    height: 4,
    borderRadius: 999,
  },
  imageStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  imageWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    maxWidth: 360,
    height: 360,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  skipText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  nextButton: {
    minHeight: 56,
    paddingHorizontal: 20,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  nextText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
  nextArrow: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
});