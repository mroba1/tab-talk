import { BottomTabBarProps } from 'expo-router/tabs';
import { Compass, Home, MessageCircle, User, Wallet, type LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/theme/theme';

const ICONS: Record<string, LucideIcon> = {
  home: Home,
  discover: Compass,
  chats: MessageCircle,
  wallet: Wallet,
  profile: User,
};

const LABELS: Record<string, string> = {
  home: 'Home',
  discover: 'Discover',
  chats: 'Chats',
  wallet: 'Wallet',
  profile: 'Profile',
};

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const Icon = ICONS[route.name] ?? Home;
        const label = LABELS[route.name] ?? route.name;
        const color = isFocused ? colors.inkHigh : colors.textDisabled;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.item} hitSlop={6}>
            <Icon size={20} color={color} strokeWidth={isFocused ? 2.4 : 2} />
            <Text style={[styles.label, { color, fontFamily: isFocused ? fonts.bodyBold : fonts.bodySemibold }]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  item: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  label: {
    fontSize: 10,
  },
});
