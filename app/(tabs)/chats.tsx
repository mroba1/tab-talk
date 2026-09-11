import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatListItem } from '@/components/chat/ChatListItem';
import { getMerchant } from '@/data/merchants';
import { useAppState } from '@/state/AppState';
import { colors, fonts } from '@/theme/theme';

export default function ChatsScreen() {
  const { chats } = useAppState();
  const sorted = [...chats].sort((a, b) => b.lastMessageAt - a.lastMessageAt);

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
      </View>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {sorted.map((c) => {
          const m = getMerchant(c.merchantId);
          if (!m) return null;
          return <ChatListItem key={c.id} chat={c} merchant={m} primary={m.id === 'sweet-crumb'} bordered />;
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { fontFamily: fonts.heading, fontSize: 20, color: colors.ink },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
});
