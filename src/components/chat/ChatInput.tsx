import { Paperclip, Send } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, fonts, radii } from '@/theme/theme';

interface ChatInputProps {
  value: string;
  onChangeText: (v: string) => void;
  onSend: () => void;
  onAttach: () => void;
  placeholder: string;
}

export function ChatInput({ value, onChangeText, onSend, onAttach, placeholder }: ChatInputProps) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onAttach} style={styles.attachBtn} hitSlop={4}>
        <Paperclip size={16} color={colors.textMuted2} />
      </Pressable>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        style={styles.input}
        multiline
      />
      <Pressable onPress={onSend} style={styles.sendBtn} hitSlop={4}>
        <Send size={15} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.pill,
    paddingVertical: 11,
    paddingHorizontal: 16,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.inkHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
