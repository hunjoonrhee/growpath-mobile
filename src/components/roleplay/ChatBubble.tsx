import { ChevronDown, ChevronUp, Square, Volume2 } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing, type Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
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

// Both call sites below only ever render inside a user bubble (pronunciation
// scores only exist on the user's own recorded speech), so this always sits
// on a colors.pri background. `ok` is defined as an alias of `pri` in both
// palettes (green-on-green makes semantic sense as a standalone token) -
// exactly the collision that made a "good" score render invisible here.
// `onPri` is guaranteed to read against `pri`; amber already contrasts fine
// against it in both modes, so only the good-score branch needed to change.
function pronunciationColor(score: number, colors: Palette): string {
  return score >= 80 ? colors.onPri : colors.amber;
}

export function ChatBubble({ message, playback, formatPronunciationLabel }: ChatBubbleProps) {
  const colors = useTheme();
  const isUser = message.role === 'user';
  const [wordsExpanded, setWordsExpanded] = useState(false);

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: colors.pri, borderTopRightRadius: 4 }
            : { backgroundColor: colors.surf, borderWidth: 1, borderColor: colors.border, borderTopLeftRadius: 4 },
        ]}>
        <ThemedText type="small" style={{ color: isUser ? colors.onPri : colors.text }}>
          {message.text}
        </ThemedText>
        {isUser && message.pronunciation && formatPronunciationLabel && (
          <>
            <Pressable accessibilityRole="button" onPress={() => setWordsExpanded((current) => !current)} style={styles.pronunciationRow}>
              <ThemedText type="small" style={[styles.pronunciation, { color: pronunciationColor(message.pronunciation.pronScore, colors) }]}>
                {formatPronunciationLabel(Math.round(message.pronunciation.pronScore))}
              </ThemedText>
              {wordsExpanded ? (
                <ChevronUp size={12} color={colors.textFaint} strokeWidth={1.8} />
              ) : (
                <ChevronDown size={12} color={colors.textFaint} strokeWidth={1.8} />
              )}
            </Pressable>
            {wordsExpanded && (
              <View style={styles.wordChips}>
                {message.pronunciation.words.map((word, index) => {
                  const color = pronunciationColor(word.accuracyScore, colors);
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
            {(() => {
              // Model-message play buttons sit on colors.surf (textDim
              // reads fine there); user-message ones - the "hear my own
              // recording back" case - sit on colors.pri, where textDim's
              // contrast was too low to see (reported: "확성기 이모티콘이
              // 잘 안보이네").
              const iconColor = isUser ? colors.onPri : colors.textDim;
              if (playback.isLoading) return <ActivityIndicator size="small" color={iconColor} />;
              if (playback.isPlaying) return <Square size={14} color={iconColor} strokeWidth={1.8} fill={iconColor} />;
              return <Volume2 size={14} color={iconColor} strokeWidth={1.8} />;
            })()}
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
});
