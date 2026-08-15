import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import type { ChatMessage } from '@/lib/roleplay';

export type ChatBubbleProps = {
  message: ChatMessage;
  /**
   * Model messages: reads the AI's dialogue line aloud (see roleplay-chat.tsx's
   * use of dialogueText). User messages: reads back the user's own transcript
   * as a reference pronunciation - only offered when the message carries a
   * pronunciation score. Either way, only present when TTS has a usable voice
   * for this session's language (see roleplayLanguageToBcp47).
   */
  playback?: {
    isPlaying: boolean;
    isLoading: boolean;
    onPress: () => void;
    playAccessibilityLabel: string;
    stopAccessibilityLabel: string;
  };
  /** Formats message.pronunciation.pronScore into a display label (e.g. "발음 92점") - kept as a caller-supplied formatter, like the playback labels above, so this component doesn't need its own i18n dependency. */
  formatPronunciationLabel?: (score: number) => string;
};

// PronScore is 0-100 (see joon-dashboard's transcribe route). This app only
// has two semantic status colors (ok/amber, see theme.ts) rather than a
// full traffic-light scale, so a single "good vs needs work" cutoff matches
// how amber is already used everywhere else (errors, warnings) instead of
// introducing a third color just for this.
function pronunciationColor(score: number): string {
  return score >= 80 ? Colors.ok : Colors.amber;
}

export function ChatBubble({ message, playback, formatPronunciationLabel }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const [wordsExpanded, setWordsExpanded] = useState(false);

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleModel]}>
        <ThemedText type="small" style={isUser ? styles.textUser : styles.textModel}>
          {message.text}
        </ThemedText>
        {isUser && message.pronunciation && formatPronunciationLabel && (
          <>
            <Pressable accessibilityRole="button" onPress={() => setWordsExpanded((current) => !current)} style={styles.pronunciationRow}>
              <ThemedText type="small" style={[styles.pronunciation, { color: pronunciationColor(message.pronunciation.pronScore) }]}>
                {formatPronunciationLabel(Math.round(message.pronunciation.pronScore))}
              </ThemedText>
              <ThemedText type="small" style={styles.pronunciationChevron}>
                {wordsExpanded ? '▲' : '▼'}
              </ThemedText>
            </Pressable>
            {wordsExpanded && (
              <View style={styles.wordChips}>
                {message.pronunciation.words.map((word, index) => {
                  const color = pronunciationColor(word.accuracyScore);
                  return (
                    <View key={index} style={[styles.wordChip, { borderColor: color }]}>
                      <ThemedText style={[styles.wordChipText, { color }]}>{word.word}</ThemedText>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
        {playback && (
          // A row below the text, not beside it - a Text sharing a row with
          // a fixed-width sibling needs extra Yoga-layout care to keep
          // wrapping correctly at every length, and got it wrong for long
          // replies (text was clipped instead of wrapping under the icon).
          // Full-width text plus a separate row underneath sidesteps that
          // entirely.
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={playback.isPlaying ? playback.stopAccessibilityLabel : playback.playAccessibilityLabel}
            onPress={playback.onPress}
            disabled={playback.isLoading}
            style={styles.playButton}>
            {playback.isLoading ? (
              <ActivityIndicator size="small" color={Colors.textDim} />
            ) : (
              <ThemedText style={styles.playIcon}>{playback.isPlaying ? '⏹️' : '🔊'}</ThemedText>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: Spacing.two,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  pronunciationRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  pronunciation: {
    fontSize: 11,
  },
  pronunciationChevron: {
    fontSize: 8,
    color: Colors.textFaint,
  },
  wordChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: Spacing.one,
  },
  wordChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  wordChipText: {
    fontSize: 11,
  },
  playButton: {
    alignSelf: 'flex-end',
    width: 24,
    height: 24,
    marginTop: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 14,
  },
  bubbleModel: {
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.pri,
    borderTopRightRadius: 4,
  },
  textModel: {
    color: Colors.text,
  },
  textUser: {
    color: '#ffffff',
  },
});
