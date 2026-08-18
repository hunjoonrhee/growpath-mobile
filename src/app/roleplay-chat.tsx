import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/forms/PrimaryButton';
import { BackHeader } from '@/components/navigation/BackHeader';
import { ChatBubble } from '@/components/roleplay/ChatBubble';
import { ChatComposer } from '@/components/roleplay/ChatComposer';
import { SessionSummaryCard } from '@/components/roleplay/SessionSummaryCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useActiveRoadmap } from '@/hooks/roadmap/use-active-roadmap';
import { useRoleplayChat } from '@/hooks/roleplay/use-roleplay-chat';
import { useRoleplayTts } from '@/hooks/roleplay/use-roleplay-tts';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';
import { roleplayLanguageToBcp47 } from '@/lib/roleplay-language-bcp47';

export default function RoleplayChatScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const colors = useTheme();
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
    roadmapId: activeRoadmap.adoptedRoadmapId.data,
  });
  const { start } = chat;
  const voiceLanguage = roleplayLanguageToBcp47(language ?? '');
  const tts = useRoleplayTts(voiceLanguage);

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

        {chat.summary ? (
          <ScrollView contentContainerStyle={styles.summaryContent}>
            <ThemedText type="subtitle" style={styles.summaryTitle}>
              {t('roleplay.summaryTitle')}
            </ThemedText>
            <SessionSummaryCard summary={chat.summary} label={t('roleplay.summaryTilLabel')} vocabAddedLabel={t('roleplay.summaryVocabAdded')} />
            <PrimaryButton label={t('roleplay.summaryDoneCta')} onPress={() => router.replace('/log')} style={styles.doneButton} />
          </ScrollView>
        ) : activeRoadmap.isError && chat.messages.length === 0 ? (
          // Checked after chat.summary, and only blocks the view before any
          // messages exist - activeRoadmap.isError is a combined OR of three
          // queries shared app-wide (including focusStageLevel, which this
          // screen doesn't even use), so a background refetch failure on any
          // of them must not lock an already-started conversation out of its
          // own Send/End UI, or replace an already-finished summary screen.
          <View style={styles.centerContent}>
            <ThemedText type="small" themeColor="amber" style={styles.centerTextNoMargin}>
              {t('roleplay.errorGeneric')}
            </ThemedText>
            <PrimaryButton
              label={t('roleplay.retryCta')}
              onPress={() => {
                // isError can come from any of the three underlying queries
                // (see useActiveRoadmap's own comment) - refetching only the
                // first would leave the other two's failures unrecoverable.
                activeRoadmap.adoptedRoadmapId.refetch();
                activeRoadmap.roadmap.refetch();
                activeRoadmap.focusStageLevel.refetch();
              }}
              style={styles.retryButton}
            />
          </View>
        ) : (
          <KeyboardAvoidingView style={styles.chatArea} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.messages}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
              {chat.isStarting && (
                <ThemedText type="small" themeColor="textDim" style={styles.centerText}>
                  {t('roleplay.starting')}
                </ThemedText>
              )}

              {chat.messages.map((message, index) => (
                <ChatBubble
                  key={index}
                  message={message}
                  formatPronunciationLabel={(score) => t('roleplay.pronunciationScore', { score })}
                  playback={
                    // Model messages: always offered (reads the in-character
                    // dialogue line). User messages: only when there's a
                    // pronunciation score to reference - reads their own
                    // transcript back as a "how this should sound" reference,
                    // reusing the same TTS pipeline.
                    voiceLanguage && (message.role === 'model' || message.pronunciation)
                      ? {
                          isPlaying: tts.playingIndex === index,
                          isLoading: tts.isLoading && tts.playingIndex === index,
                          onPress: () => tts.play(index, message.dialogueText ?? message.text),
                          playAccessibilityLabel: t('roleplay.playAccessibilityLabel'),
                          stopAccessibilityLabel: t('roleplay.stopAccessibilityLabel'),
                        }
                      : undefined
                  }
                />
              ))}

              {chat.isSending && (
                <ThemedText type="small" themeColor="textDim">
                  {t('roleplay.thinking')}
                </ThemedText>
              )}

              {/* Rendered after the message list (not before it) so the
                  ScrollView's auto-scroll-to-bottom on content-size-change
                  lands on this, not past it - a banner above the messages
                  would otherwise scroll out of view in a long conversation. */}
              {chat.errorKind && (
                <View style={styles.errorBanner}>
                  <ThemedText type="small" themeColor="amber" style={styles.centerTextNoMargin}>
                    {chat.errorKind === 'unavailable' ? t('roleplay.errorUnavailable') : t('roleplay.errorGeneric')}
                  </ThemedText>
                  {/* 'unavailable' means retrying can't help (see RoleplayErrorKind) - showing Retry there just lets the user repeat a call that's guaranteed to fail identically. */}
                  {chat.errorKind === 'transient' && (
                    <PrimaryButton
                      label={t('roleplay.retryCta')}
                      onPress={chat.retry}
                      disabled={chat.isStarting || chat.isSending || chat.isEnding}
                      style={styles.retryButton}
                    />
                  )}
                </View>
              )}
            </ScrollView>

            {chat.messages.length > 0 && !chat.isStarting && (
              <PrimaryButton
                label={t('roleplay.endCta')}
                onPress={handleEnd}
                disabled={chat.isEnding || chat.isSending}
                style={[styles.endButton, { backgroundColor: colors.surf2 }]}
              />
            )}

            {/* Disabled on any errorKind, not just specific cases - a
                failed start/send/end all need Retry (or, for 'unavailable',
                nothing) to be the next action, not a new message typed on
                top of whatever's unresolved. */}
            <ChatComposer
              onSend={chat.sendMessage}
              disabled={chat.isStarting || chat.isSending || chat.isEnding || chat.errorKind !== null}
              placeholder={t('roleplay.composerPlaceholder')}
              sendLabel={t('roleplay.sendCta')}
              voiceLanguage={voiceLanguage}
              voiceIdleLabel={t('roleplay.voiceIdle')}
              voiceRecordingLabel={t('roleplay.voiceRecording')}
              voiceTranscribingLabel={t('roleplay.voiceTranscribing')}
              voiceAssessingPronunciationLabel={t('roleplay.voiceAssessingPronunciation')}
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
  centerContent: {
    marginTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  centerTextNoMargin: {
    textAlign: 'center',
  },
  errorBanner: {
    marginTop: Spacing.two,
    gap: Spacing.one,
  },
  endButton: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
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
