import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { colors, fonts } from '@/theme/theme';
import { ChatMessage } from '@/types';

interface ChatBubbleProps {
  message: ChatMessage;
  /** True when the current viewer is the merchant side of this conversation —
   * flips which sender's messages render as "sent" (right, gradient) vs "received". */
  viewerIsMerchant?: boolean;
}

export function ChatBubble({ message, viewerIsMerchant = false }: ChatBubbleProps) {
  if (message.type === 'system') {
    return (
      <Animated.View entering={FadeInDown.duration(300)} style={styles.systemWrap}>
        <Text style={styles.systemText}>{message.text}</Text>
      </Animated.View>
    );
  }

  const isOwnMessage = viewerIsMerchant ? message.sender === 'merchant' : message.sender === 'user';

  if (message.type === 'image') {
    return (
      <Animated.View entering={FadeInDown.duration(300)} style={[styles.imageAlign, isOwnMessage && styles.alignEnd]}>
        <ImagePlaceholder uri={message.imageUri} label="Reference photo" radius={16} style={styles.image} />
      </Animated.View>
    );
  }

  if (isOwnMessage) {
    return (
      <Animated.View entering={FadeInDown.duration(300)} style={styles.alignEnd}>
        <LinearGradient colors={[colors.primaryDark, colors.primary]} style={[styles.bubble, styles.userBubble]}>
          <Text style={styles.userText}>{message.text}</Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.alignStart}>
      <View style={[styles.bubble, styles.merchantBubble]}>
        <Text style={styles.merchantText}>{message.text}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  alignEnd: { alignSelf: 'flex-end', maxWidth: '78%' },
  alignStart: { alignSelf: 'flex-start', maxWidth: '78%' },
  imageAlign: { maxWidth: '78%' },
  image: { width: 150, height: 110 },
  bubble: { paddingVertical: 12, paddingHorizontal: 15, borderRadius: 18 },
  userBubble: { borderBottomRightRadius: 4 },
  userText: { fontFamily: fonts.body, fontSize: 14, color: '#fff', lineHeight: 21 },
  merchantBubble: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderLight, borderBottomLeftRadius: 4 },
  merchantText: { fontFamily: fonts.body, fontSize: 14, color: colors.ink, lineHeight: 21 },
  systemWrap: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  systemText: { fontFamily: fonts.bodySemibold, fontSize: 11.5, color: colors.textMuted4 },
});
