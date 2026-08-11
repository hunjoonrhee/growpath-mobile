import { HStack, Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, lineLimit, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

// Every string here is pre-translated by the caller (Today tab, which has
// i18n context) - the widget's function body runs in its own JS runtime with
// no access to react-i18next, so it can only render text it's handed as data.
export type TodayProgressWidgetProps = {
  goalTitle: string;
  progressLabel: string;
  stageLabel: string;
  streakLabel: string;
  percent: number;
};

const TodayProgressWidget = (props: TodayProgressWidgetProps, environment: WidgetEnvironment) => {
  'widget';
  // Opts this out of React Compiler's auto-memoization - it injects a `_c`
  // cache-array reference that doesn't exist in the widget's own extracted
  // runtime, which otherwise breaks with "Can't find variable: _c" (the
  // same class of issue Reanimated worklets hit before this escape hatch).
  'use no memo';
  // Must be declared inside this function, not at module scope - the
  // 'widget' directive only serializes the function body into the widget's
  // own bundle, so outer-scope references silently fail at runtime with
  // "Can't find variable" instead of a build-time error.
  const BG = '#0b0d12';
  const PRIMARY = '#8b83ff';
  const TEXT = '#f3f4f6';
  const TEXT_DIM = '#9ca3af';
  const clampedPercent = Math.max(0, Math.min(100, Number.isFinite(props.percent) ? props.percent : 0));
  const isSmall = environment.widgetFamily === 'systemSmall';

  // Block body (not an expression body) so it can carry its own opt-out
  // directive - React Compiler decides per-function, based on that
  // function's own directive prologue, not the enclosing one, and a
  // PascalCase arrow function returning JSX is exactly what its component
  // heuristic targets.
  const ProgressRing = () => {
    'use no memo';
    return (
      <VStack
        spacing={2}
        modifiers={[
          frame({ width: isSmall ? 64 : 72, height: isSmall ? 64 : 72 }),
          padding({ all: isSmall ? 10 : 12 }),
        ]}>
        <Text modifiers={[font({ weight: 'bold', size: isSmall ? 20 : 22 }), foregroundStyle(TEXT)]}>{`${Math.round(clampedPercent)}%`}</Text>
      </VStack>
    );
  };

  return (
    <VStack
      alignment="leading"
      spacing={isSmall ? 6 : 8}
      modifiers={[
        containerBackground(BG, 'widget'),
        frame({ maxWidth: Infinity, maxHeight: Infinity, alignment: 'leading' }),
        padding({ all: isSmall ? 14 : 16 }),
      ]}>
      {isSmall ? (
        <>
          <ProgressRing />
          <Text modifiers={[font({ weight: 'semibold', size: 13 }), foregroundStyle(TEXT), lineLimit(1)]}>{props.goalTitle}</Text>
          <Text modifiers={[font({ size: 11 }), foregroundStyle(TEXT_DIM), lineLimit(1)]}>{props.stageLabel}</Text>
        </>
      ) : (
        <HStack spacing={14} modifiers={[frame({ maxWidth: Infinity })]}>
          <ProgressRing />
          <VStack alignment="leading" spacing={4} modifiers={[frame({ maxWidth: Infinity, alignment: 'leading' })]}>
            <Text modifiers={[font({ weight: 'semibold', size: 15 }), foregroundStyle(TEXT), lineLimit(1)]}>{props.goalTitle}</Text>
            <Text modifiers={[font({ size: 12 }), foregroundStyle(TEXT_DIM), lineLimit(1)]}>{props.progressLabel}</Text>
            <Text modifiers={[font({ size: 12 }), foregroundStyle(TEXT_DIM), lineLimit(1)]}>{props.stageLabel}</Text>
            <Text modifiers={[font({ weight: 'medium', size: 12 }), foregroundStyle(PRIMARY), lineLimit(1)]}>{props.streakLabel}</Text>
          </VStack>
        </HStack>
      )}
    </VStack>
  );
};

export default createWidget<TodayProgressWidgetProps>('TodayProgressWidget', TodayProgressWidget);
