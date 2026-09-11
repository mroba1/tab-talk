import { router } from 'expo-router';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MerchantListItem } from '@/components/merchant/MerchantCard';
import { IconButton } from '@/components/ui/IconButton';
import { MERCHANTS } from '@/data/merchants';
import { colors, fonts, radii } from '@/theme/theme';

const STOPWORDS = new Set([
  'a',
  'an',
  'the',
  'i',
  'need',
  'want',
  'for',
  'my',
  'some',
  'to',
  'with',
  'and',
  'this',
  'that',
  'on',
  'of',
]);

const EXAMPLES = ['A custom birthday cake for Saturday', 'Someone to fix a leaking pipe', 'A haircut this week'];

export default function RequestScreen() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const results = useMemo(() => {
    const words = submitted
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w));
    if (words.length === 0) return [];
    return MERCHANTS.filter((m) => {
      const haystack = `${m.name} ${m.category} ${m.categoryLabel} ${m.about}`.toLowerCase();
      return words.some((w) => haystack.includes(w));
    });
  }, [submitted]);

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <Pressable style={styles.header} onPress={Keyboard.dismiss}>
        <IconButton onPress={() => router.back()}>
          <ChevronLeft size={15} color={colors.inkHigh} />
        </IconButton>
        <Text style={styles.title}>What are you looking for?</Text>
      </Pressable>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        <Text style={styles.subtitle}>
          Describe what you need in your own words — we'll match you with businesses that can help.
        </Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="I need a custom birthday cake for Saturday…"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
        />

        <Pressable
          onPress={() => setSubmitted(query)}
          disabled={!query.trim()}
          style={[styles.submitBtn, !query.trim() && styles.submitBtnDisabled]}
        >
          <Sparkles size={14} color="#fff" />
          <Text style={styles.submitBtnText}>Find businesses</Text>
        </Pressable>

        {!submitted && (
          <View style={styles.examplesWrap}>
            <Text style={styles.examplesTitle}>Try something like</Text>
            {EXAMPLES.map((ex) => (
              <Pressable key={ex} onPress={() => setQuery(ex)} style={styles.exampleChip}>
                <Text style={styles.exampleText}>{ex}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {submitted && (
          <View style={styles.resultsWrap}>
            <Text style={styles.resultsTitle}>
              {results.length > 0 ? 'Businesses that can help' : 'No matches yet'}
            </Text>
            {results.length === 0 && (
              <Text style={styles.emptyText}>Try different words, or browse Discover instead.</Text>
            )}
            {results.map((m) => (
              <MerchantListItem key={m.id} merchant={m} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { flex: 1, fontFamily: fonts.heading, fontSize: 17, color: colors.ink },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  input: {
    marginTop: 16,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.xxl,
    padding: 16,
    minHeight: 88,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 12,
    backgroundColor: colors.inkHigh,
    borderRadius: radii.pill,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontFamily: fonts.bodyBold, fontSize: 14, color: '#fff' },
  examplesWrap: { marginTop: 28, gap: 10 },
  examplesTitle: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  exampleChip: {
    backgroundColor: colors.surfaceMuted2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: 14,
  },
  exampleText: { fontFamily: fonts.body, fontSize: 13, color: colors.ink },
  resultsWrap: { marginTop: 24 },
  resultsTitle: { fontFamily: fonts.heading, fontSize: 15, color: colors.ink },
  emptyText: { marginTop: 8, fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted },
});
