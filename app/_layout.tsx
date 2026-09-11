import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppStateProvider } from '@/state/AppState';
import { colors } from '@/theme/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_800ExtraBold,
    Manrope_700Bold,
    Manrope_500Medium,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppStateProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.surface },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="merchant/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="chat/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="payment/confirm" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="payment/success" options={{ animation: 'fade' }} />
            <Stack.Screen name="escrow/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="orders/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="saved" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="request" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="biz/dashboard" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="biz/orders" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="biz/chats" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="biz/invoice" options={{ animation: 'slide_from_right' }} />
          </Stack>
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
