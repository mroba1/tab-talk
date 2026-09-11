import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { formatRelative } from '@/services/time';
import { colors, fonts } from '@/theme/theme';
import { Chat, Merchant } from '@/types';

interface ChatListItemProps {
  chat: Chat;
  merchant: Merchant;
  primary?: boolean;
  bordered?: boolean;
  /** 'merchant' renders this row from the business's inbox — the customer's
   * name is shown instead of the merchant's own business name. */
  viewerRole?: 'customer' | 'merchant';
}

export function ChatListItem({ chat, merchant, primary, bordered, viewerRole = 'customer' }: ChatListItemProps) {
  const isMerchantView = viewerRole === 'merchant';
  const href = isMerchantView ? `/chat/${merchant.id}?as=merchant` : `/chat/${merchant.id}`;

  return (
    <Pressable onPress={() => router.push(href)} style={[styles.row, bordered && styles.bordered]}>
      {isMerchantView ? (
        <Avatar initials="AR" size={44} variant="light" />
      ) : (
        <Avatar initials={merchant.initials} size={44} variant={primary ? 'gradient' : 'light'} />
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.name} numberOfLines={1}>
          {isMerchantView ? 'Amara Reyes' : merchant.name}
        </Text>
        <Text style={styles.preview} numberOfLines={1}>
          {isMerchantView ? `${merchant.name} · ${chat.lastMessage}` : chat.lastMessage}
        </Text>
      </View>
      <View style={styles.metaCol}>
        <Text style={styles.time}>{formatRelative(chat.lastMessageAt)}</Text>
        {chat.hasPendingInvoice && <View style={styles.dot} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLighter,
    paddingVertical: 12,
  },
  name: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  preview: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  metaCol: { alignItems: 'flex-end', gap: 6 },
  time: { fontFamily: fonts.body, fontSize: 11, color: colors.textFaint },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
