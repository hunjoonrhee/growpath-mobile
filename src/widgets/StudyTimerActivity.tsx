import { HStack, Image, Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, lineLimit, monospacedDigit, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';

// Strings are pre-translated by the caller (timer.tsx) - see the same note
// in TodayProgressWidget.tsx, this function body has no react-i18next access.
export type StudyTimerActivityProps = {
  topic: string;
  statusLabel: string;
  isPaused: boolean;
  // While running, the elapsed clock is a native SwiftUI timerInterval text
  // (so it keeps ticking without JS updates) anchored to a *virtual* start
  // time such that (now - virtualStartEpochMs) equals elapsed-so-far. This
  // gets recomputed on every resume so paused stretches don't count toward
  // the displayed duration.
  virtualStartEpochMs: number;
  // Static mm:ss text shown only while paused, since a timerInterval clock
  // can't be frozen mid-count.
  pausedElapsedLabel: string;
};

const StudyTimerActivity = (props: StudyTimerActivityProps, _environment: LiveActivityEnvironment) => {
  'widget';
  // Opts this out of React Compiler's auto-memoization - it injects a `_c`
  // cache-array reference that doesn't exist in the widget's own extracted
  // runtime, which otherwise breaks with "Can't find variable: _c" (the
  // same class of issue Reanimated worklets hit before this escape hatch).
  'use no memo';
  // Must be declared inside this function, not at module scope - the
  // 'widget' directive only serializes the function body into the Live
  // Activity's own bundle, so outer-scope references silently fail at
  // runtime with "Can't find variable" instead of a build-time error.
  const ACCENT = '#8b83ff';
  const TEXT = '#f3f4f6';
  const TEXT_DIM = '#9ca3af';
  // Timer interval needs an upper bound - this is a count-up with no fixed
  // end, so pick a date far enough out it'll never be reached in practice.
  const FAR_FUTURE = new Date('2099-01-01T00:00:00Z');
  const startDate = new Date(props.virtualStartEpochMs);

  // Block body (not an expression body) so it can carry its own opt-out
  // directive - React Compiler decides per-function, based on that
  // function's own directive prologue, not the enclosing one, and a
  // PascalCase arrow function returning JSX is exactly what its component
  // heuristic targets.
  const Clock = ({ size, color }: { size: number; color: string }) => {
    'use no memo';
    return props.isPaused ? (
      <Text modifiers={[font({ weight: 'medium', size }), monospacedDigit(), foregroundStyle(color)]}>{props.pausedElapsedLabel}</Text>
    ) : (
      <Text
        timerInterval={{ lower: startDate, upper: FAR_FUTURE }}
        countsDown={false}
        modifiers={[font({ weight: 'medium', size }), monospacedDigit(), foregroundStyle(color)]}
      />
    );
  };

  return {
    banner: (
      <VStack
        alignment="leading"
        spacing={10}
        modifiers={[containerBackground('#0b0d12', 'widget'), frame({ maxWidth: Infinity, alignment: 'leading' }), padding({ all: 16 })]}>
        <Text modifiers={[font({ weight: 'semibold', size: 13 }), foregroundStyle(TEXT_DIM), lineLimit(1)]}>{props.statusLabel}</Text>
        <Text modifiers={[font({ weight: 'bold', size: 17 }), foregroundStyle(TEXT), lineLimit(1)]}>{props.topic}</Text>
        <Clock size={28} color={ACCENT} />
      </VStack>
    ),
    compactLeading: <Image systemName="timer" size={14} color={ACCENT} />,
    compactTrailing: <Clock size={13} color={TEXT} />,
    minimal: <Image systemName="timer" size={16} color={ACCENT} />,
    expandedLeading: (
      <HStack spacing={6} modifiers={[padding({ leading: 8 })]}>
        <Image systemName="timer" size={16} color={ACCENT} />
        <Text modifiers={[font({ weight: 'semibold', size: 14 }), foregroundStyle(TEXT), lineLimit(1)]}>{props.topic}</Text>
      </HStack>
    ),
    expandedTrailing: (
      <HStack modifiers={[padding({ trailing: 6 })]}>
        <Clock size={16} color={ACCENT} />
      </HStack>
    ),
    expandedBottom: (
      <VStack alignment="leading" spacing={4} modifiers={[padding({ top: 4, horizontal: 6 })]}>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(TEXT_DIM)]}>{props.statusLabel}</Text>
      </VStack>
    ),
  };
};

export default createLiveActivity<StudyTimerActivityProps>('StudyTimerActivity', StudyTimerActivity);
