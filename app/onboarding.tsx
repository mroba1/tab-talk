import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { mockPhoto } from '@/services/images';
import { useAppState } from '@/state/AppState';
import { colors, fonts } from '@/theme/theme';

const STEPS = [
  {
    title: 'Discover businesses around you.',
    body: 'Find local shops, bakeries, tailors and freelancers nearby, all in one place.',
    image: mockPhoto('onboarding-discover', 600, 440),
  },
  {
    title: 'Chat directly with local businesses.',
    body: 'Ask questions, send photos, and get custom quotes right inside the conversation.',
    image: mockPhoto('onboarding-chat', 600, 440),
  },
  {
    title: 'Pay securely and stay protected.',
    body: 'Your payment stays in escrow until you confirm the order or service is complete.',
    image: mockPhoto('onboarding-pay', 600, 440),
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useAppState();
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  const finish = async () => {
    await completeOnboarding();
    router.replace('/home');
  };

  const onNext = () => {
    if (isLast) finish();
    else setStep((s) => s + 1);
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <View style={styles.skipRow}>
        <Text onPress={finish} style={styles.skip} suppressHighlighting>
          Skip
        </Text>
      </View>

      <View style={styles.body}>
        <ImagePlaceholder
          uri={STEPS[step].image}
          label="Onboarding illustration"
          radius={24}
          style={styles.illustration}
        />
        <Text style={styles.title}>{STEPS[step].title}</Text>
        <Text style={styles.desc}>{STEPS[step].body}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { width: i === step ? 22 : 6, backgroundColor: i === step ? colors.inkHigh : '#e5e1f0' },
              ]}
            />
          ))}
        </View>
        <Button label={isLast ? 'Get Started' : 'Next'} onPress={onNext} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  skipRow: { alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 4 },
  skip: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textMuted },
  body: { flex: 1, paddingHorizontal: 28, paddingTop: 8 },
  illustration: { width: '100%', height: 220, marginTop: 12 },
  title: {
    marginTop: 36,
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.ink,
    lineHeight: 31,
    letterSpacing: -0.3,
  },
  desc: {
    marginTop: 12,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted2,
    lineHeight: 22,
  },
  footer: { paddingHorizontal: 28, paddingBottom: 24, paddingTop: 8 },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 24 },
  dot: { height: 6, borderRadius: 3 },
});
