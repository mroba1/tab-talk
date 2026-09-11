import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppState } from '@/state/AppState';
import { fonts } from '@/theme/theme';

export default function SplashScreen() {
  const { isReady, onboardingComplete } = useAppState();

  const handleContinue = () => {
    if (!isReady) return;
    router.replace(onboardingComplete ? '/home' : '/onboarding');
  };

  return (
    <Pressable style={styles.flex} onPress={handleContinue}>
      <View style={styles.flex}>
        <Image
          source={require('../assets/images/splash-hero.jpeg')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'transparent', 'rgba(6,4,20,0.5)', 'rgba(6,4,20,0.62)', 'rgba(6,4,20,0.8)']}
          locations={[0, 0.2, 0.32, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={styles.content}>
          <Animated.View entering={FadeIn.duration(500)} style={styles.taglineBlock}>
            <Text style={styles.tagline}>
              Chat, order, and pay with local businesses — all in one place.
            </Text>
          </Animated.View>
          <View style={styles.hintPill}>
            <Text style={styles.hint}>Tap to continue</Text>
          </View>
        </SafeAreaView>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  taglineBlock: {
    position: 'absolute',
    top: '24%',
    left: 28,
    right: 28,
    alignItems: 'center',
  },
  tagline: {
    fontFamily: fonts.heading,
    fontSize: 22,
    letterSpacing: -0.4,
    color: '#ffffff',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 28,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  hintPill: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  hint: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.2,
    color: '#ffffff',
  },
});
