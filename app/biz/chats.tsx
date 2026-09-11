import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatListItem } from '@/components/chat/ChatListItem';
import { IconButton } from '@/components/ui/IconButton';
import { getMerchant } from '@/data/merchants';
import { useAppState } from '@/state/AppState';
import { colors, fonts } from '@/theme/theme';

export default function MerchantChatsScreen() {
  const { chats } = useAppState();
  const sorted = [...chats].sort((a, b) => b.lastMessageAt - a.lastMessageAt);

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton onPress={() => router.push('/biz/dashboard')}>
          <ChevronLeft size={15} color={colors.inkHigh} />
        </IconButton>
        <Text style={styles.title}>Chats</Text>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {sorted.map((c) => {
          const m = getMerchant(c.merchantId);
          if (!m) return null;
          return <ChatListItem key={c.id} chat={c} merchant={m} viewerRole="merchant" bordered />;
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontFamily: fonts.heading, fontSize: 17, color: colors.ink },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
});
