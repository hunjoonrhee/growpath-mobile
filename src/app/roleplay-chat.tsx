import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/forms/PrimaryButton';
import { BackHeader } from '@/components/navigation/BackHeader';
import { ChatBubble } from '@/components/roleplay/ChatBubble';
import { ChatComposer } from '@/components/roleplay/ChatComposer';
import { SessionSummaryCard } from '@/components/roleplay/SessionSummaryCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useActiveRoadmap } from '@/hooks/roadmap/use-active-roadmap';
import { useRoleplayChat } from '@/hooks/roleplay/use-roleplay-chat';
import { useAuth } from '@/lib/auth-context';

export default function RoleplayChatScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const { language, topic } = useLocalSearchParams<{ language?: string; topic?: string }>();
  const scrollRef = useRef<ScrollView>(null);

  const activeRoadmap = useActiveRoadmap(session?.user.id);

  const chat = useRoleplayChat({
    userId: session?.user.id ?? '',
    topic: topic ?? '',
    language: language ?? '',
    goal: activeRoadmap.roadmap.data?.goal ?? '',
    careerLevel: activeRoadmap.roadmap.data?.careerLevel ?? '',
    locale: i18n.language,
  });
  const { start } = chat;

  useEffect(() => {
    // topic/language can be empty on a render that's about to redirect away
    // (the guards below run after all hooks, per Rules of Hooks, so this
    // effect still fires for that render) - skip starting a session with
    // malformed params in that case. Also skip if the active-roadmap lookup
    // itself failed - starting anyway would silently open the roleplay with
    // an empty goal/career-level context instead of surfacing the error.
    if (!activeRoadmap.isLoading && !activeRoadmap.isError && topic && language) {
      start();
    }
  }, [activeRoadmap.isLoading, activeRoadmap.isError, topic, language, start]);

  if (!session) return <Redirect href="/login" />;
  if (!topic || !language) return <Redirect href="/roleplay" />;

  const handleEnd = () => {
    Alert.alert(t('roleplay.endConfirmTitle'), t('roleplay.endConfirmMessage'), [
      { text: t('roleplay.endCancel'), style: 'cancel' },
      { text: t('roleplay.endConfirm'), style: 'destructive', onPress: () => chat.endSession() },
    ]);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BackHeader accessibilityLabel={t('roleplay.backAccessibilityLabel')} onPress={() => router.back()} />

        {activeRoadmap.isError ? (
          <ThemedText type="small" themeColor="amber" style={styles.centerText}>
            {t('roleplay.errorGeneric')}
          </ThemedText>
        ) : chat.summary ? (
          <ScrollView contentContainerStyle={styles.summaryContent}>
            <ThemedText type="subtitle" style={styles.summaryTitle}>
              {t('roleplay.summaryTitle')}
            </ThemedText>
            <SessionSummaryCard summary={chat.summary} label={t('roleplay.summaryTilLabel')} />
            <PrimaryButton label={t('roleplay.summaryDoneCta')} onPress={() => router.replace('/log')} style={styles.doneButton} />
          </ScrollView>
        ) : (
          <KeyboardAvoidingView style={styles.chatArea} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.messages}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
              {chat.isStarting && (
                <ThemedText type="small" themeColor="textDim" style={styles.centerText}>
                  {t('roleplay.starting')}
                </ThemedText>
              )}

              {chat.errorKind && (
                <>
                  <ThemedText type="small" themeColor="amber" style={styles.centerText}>
                    {chat.errorKind === 'unavailable' ? t('roleplay.errorUnavailable') : t('roleplay.errorGeneric')}
                  </ThemedText>
                  <PrimaryButton
                    label={t('roleplay.retryCta')}
                    onPress={chat.retry}
                    disabled={chat.isStarting || chat.isSending}
                    style={styles.retryButton}
                  />
                </>
              )}

              {chat.messages.map((message, index) => (
                <ChatBubble key={index} message={message} />
              ))}

              {chat.isSending && (
                <ThemedText type="small" themeColor="textDim">
                  {t('roleplay.thinking')}
                </ThemedText>
              )}
            </ScrollView>

            {chat.messages.length > 0 && !chat.isStarting && (
              <PrimaryButton
                label={t('roleplay.endCta')}
                onPress={handleEnd}
                disabled={chat.isEnding || chat.isSending}
                style={styles.endButton}
              />
            )}

            <ChatComposer
              onSend={chat.sendMessage}
              disabled={chat.isStarting || chat.isSending || chat.isEnding}
              placeholder={t('roleplay.composerPlaceholder')}
              sendLabel={t('roleplay.sendCta')}
            />
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  chatArea: {
    flex: 1,
  },
  messages: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.one,
  },
  centerText: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  endButton: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    backgroundColor: Colors.surf2,
  },
  retryButton: {
    marginTop: Spacing.two,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
  },
  summaryContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  summaryTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  doneButton: {
    marginTop: Spacing.three,
  },
});
